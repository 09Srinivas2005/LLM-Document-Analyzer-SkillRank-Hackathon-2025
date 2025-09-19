import * as dotenv from 'dotenv'; // <-- satisfies verbatimModuleSyntax
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/llm_doc_analyzer',
  HF_API_TOKEN: process.env.HF_API_TOKEN || '',
  HF_MODEL: process.env.HF_MODEL || 'microsoft/Phi-3-mini-4k-instruct',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
  TEXT_TRUNCATE_CHARS: parseInt(process.env.TEXT_TRUNCATE_CHARS || '6000', 10),
};

if (!env.HF_API_TOKEN) {
  console.warn('[WARN] HF_API_TOKEN not set. LLM routes will fail until provided.');
}
