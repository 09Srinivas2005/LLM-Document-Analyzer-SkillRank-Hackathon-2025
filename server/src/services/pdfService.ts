import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extracts ALL text from a PDF file.
 * Removes null characters and trims extra whitespace.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  // pdf-parse returns all pages joined in data.text
  const text = (data.text || '')
    .replace(/\u0000/g, '') // clean out null chars
    .replace(/\s+\n/g, '\n') // normalize whitespace before line breaks
    .trim();

  return text;
}

/**
 * Optional: extract both text and page count
 */
export async function extractPdfMeta(
  filePath: string
): Promise<{ text: string; numPages: number }> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  const text = (data.text || '').replace(/\u0000/g, '').trim();

  return {
    text,
    numPages: data.numpages || 0
  };
}
