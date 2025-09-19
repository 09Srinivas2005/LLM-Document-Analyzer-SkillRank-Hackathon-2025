import { Request, Response, NextFunction } from 'express';
import DocumentModel from '../models/Document';
import AnalysisModel from '../models/Analysis';
import { extractTextFromPdf } from '../services/pdfService';
import { classifyDocumentLLM, analyzeMissingFieldsLLM } from '../services/llmService';
import { heuristicClassify, REQUIRED, regexAssistInvoice } from '../services/analyzeService';

// ========== UPLOAD ==========
export async function uploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw Object.assign(new Error('No file uploaded'), { status: 400 });
    const { originalname, filename, mimetype, size, path: filePath } = req.file as any;

    const text = await extractTextFromPdf(filePath);
    const doc = await DocumentModel.create({
      originalName: originalname,
      filename,
      mimetype,
      size,
      text
    });

    res.json({
      doc_id: doc._id,
      filename,
      text_preview: text.slice(0, 1000),
      is_scanned_or_empty: text.trim().length === 0
    });
  } catch (err) {
    next(err);
  }
}

// ========== CLASSIFY ==========
export async function classifyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id);
    if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

    // Try LLM classification first; fallback to heuristic
    let type: 'contract' | 'invoice' | 'report' | 'unknown' = 'unknown';
    let confidence = 0;
    let evidence: string[] = [];

    try {
      const out = await classifyDocumentLLM(doc.text);
      type = (out.type as any) ?? 'unknown';
      confidence = Number(out.confidence) || 0;
      evidence = out.evidence || [];
    } catch (e: any) {
      console.warn('[LLM classify] falling back to heuristic:', e?.message || e);
      const heur = heuristicClassify(doc.text);
      type = heur.type;
      confidence = heur.confidence;
      evidence = heur.evidence;
    }

    doc.detectedType = type;
    doc.detectedConfidence = confidence;
    await doc.save();

    res.json({ doc_id: doc._id, type, confidence, evidence });
  } catch (err) {
    next(err);
  }
}

// ========== ANALYZE (MISSING FIELDS) ==========
export async function analyzeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id);
    if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

    const type = (doc.detectedType || 'unknown') as keyof typeof REQUIRED;
    if (!['contract', 'invoice'].includes(type)) {
      return res.status(400).json({ error: `Unsupported type for analysis: ${type}` });
    }

    const required = REQUIRED[type];

    // Regex assists (esp. for invoice)
    const hints = type === 'invoice' ? regexAssistInvoice(doc.text) : {};

    // Ask LLM to extract present/missing
    let present: Array<{ field: string; value: string; evidence: string }> = [];
    let missing: string[] = [];

    try {
      const out = await analyzeMissingFieldsLLM(type, required, doc.text);
      present = (out.present ?? []).map((p: any) => ({
        field: String(p.field),
        value: String(p.value ?? ''),
        evidence: String(p.evidence ?? 'llm')
      }));
      missing = Array.isArray(out.missing) ? out.missing.map(String) : [];
    } catch (e: any) {
      console.warn('[LLM analyze] defaulting to regex-only due to error:', e?.message || e);
      // Start pessimistic: everything missing; regex fills what it can
      present = [];
      missing = required.slice();
    }

    // Merge regex hints into present
    for (const k of Object.keys(hints)) {
      const exists = present.find(p => p.field === k);
      if (!exists) {
        // @ts-ignore
        present.push({ field: k, value: String((hints as any)[k]), evidence: 'regex' });
      }
    }

    // Recompute missing from present
    const presentSet = new Set(present.map(p => p.field));
    missing = required.filter(f => !presentSet.has(f));

    const analysis = await AnalysisModel.create({
      documentId: doc._id,
      kind: 'missing_fields',
      result: { type, present, missing }
    });

    res.json({ doc_id: doc._id, type, present, missing, analysis_id: analysis._id });
  } catch (err) {
    next(err);
  }
}

// ========== GET DOC ==========
export async function getDocHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

// ========== GET RESULTS (DOC + ANALYSES) ==========
export async function getResultsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const doc = await DocumentModel.findById(id).lean();
    if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

    const analyses = await AnalysisModel.find({ documentId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ doc, analyses });
  } catch (err) {
    next(err);
  }
}
