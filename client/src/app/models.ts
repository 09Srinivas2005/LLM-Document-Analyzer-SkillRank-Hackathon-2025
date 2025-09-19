export interface UploadResponse {
doc_id: string;
filename: string;
text_preview: string;
is_scanned_or_empty: boolean;
}


export interface ClassifyResponse {
doc_id: string;
type: 'contract' | 'invoice' | 'report' | 'unknown';
confidence: number;
evidence: string[];
}


export interface AnalyzeResponse {
doc_id: string;
type: 'contract' | 'invoice';
present: { field: string; value: string; evidence: string }[];
missing: string[];
analysis_id: string;
}