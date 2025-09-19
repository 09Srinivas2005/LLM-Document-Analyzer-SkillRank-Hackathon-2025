import axios from 'axios';
import { env } from '../config/env';
import { extractFirstJsonObject } from '../utils/json';

function buildClassificationPrompt(docText: string) {
  return (
    `You are a strict JSON generator. Classify the document into one of: ["contract","invoice","report","unknown"].\n` +
    `Return ONLY valid JSON with keys: type (string), confidence (0-1), evidence (array of short strings).\n` +
    `Example: {"type":"invoice","confidence":0.92,"evidence":["Invoice","Amount due"]}\n\n` +
    `DOCUMENT:\n` + docText
  );
}

function buildMissingFieldsPrompt(type: string, required: string[], docText: string) {
  return (
    `You are a strict JSON extractor. Given a ${type} and its REQUIRED_FIELDS, read the document text and identify present and missing fields.\n` +
    `Return ONLY JSON with structure: {"present":[{"field":"...","value":"...","evidence":"..."}],"missing":["..."]}\n` +
    `REQUIRED_FIELDS: ${JSON.stringify(required)}\n\n` +
    `DOCUMENT:\n` + docText
  );
}

async function hfGenerate(prompt: string) {
  const url = `https://api-inference.huggingface.co/models/${env.HF_MODEL}`;
  const headers = {
    Authorization: `Bearer ${env.HF_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  const payload = {
    inputs: prompt,
    parameters: {
      max_new_tokens: 400,
      temperature: 0.2,
      top_p: 0.9,
      return_full_text: false
    }
  };

  try {
    console.log('[HF] →', url);
    const { data } = await axios.post(url, payload, { headers, timeout: 60000 });
    const text: string = Array.isArray(data)
      ? (data[0]?.generated_text ?? '')
      : (data.generated_text ?? JSON.stringify(data));
    return text;
  } catch (err: any) {
    const status = err?.response?.status;
    const body = err?.response?.data;
    console.error('[HF ERROR]', status, body);
    throw Object.assign(new Error(`HF request failed: ${status}`), { status, body });
  }
}

export async function classifyDocumentLLM(text: string) {
  const truncated = text.slice(0, env.TEXT_TRUNCATE_CHARS);
  const raw = await hfGenerate(buildClassificationPrompt(truncated));
  const json = extractFirstJsonObject(raw);
  if (!json) throw Object.assign(new Error('LLM classification returned invalid JSON'), { status: 502, raw });
  return json as { type: string; confidence: number; evidence: string[] };
}

export async function analyzeMissingFieldsLLM(type: string, required: string[], text: string) {
  const truncated = text.slice(0, env.TEXT_TRUNCATE_CHARS);
  const raw = await hfGenerate(buildMissingFieldsPrompt(type, required, truncated));
  const json = extractFirstJsonObject(raw);
  if (!json) throw Object.assign(new Error('LLM analysis returned invalid JSON'), { status: 502, raw });
  return json as { present: Array<{ field: string; value: string; evidence: string }>; missing: string[] };
}
