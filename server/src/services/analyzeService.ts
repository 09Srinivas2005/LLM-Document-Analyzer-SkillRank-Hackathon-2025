import { regex } from '../utils/regex';


export const REQUIRED: Record<string, string[]> = {
contract: ['party_1', 'party_2', 'signature', 'date', 'payment_terms'],
invoice: ['invoice_number', 'amount', 'due_date', 'tax', 'bill_to', 'bill_from']
};


export function heuristicClassify(text: string): { type: 'contract'|'invoice'|'report'|'unknown'; confidence: number; evidence: string[] } {
const evid: string[] = [];
let score = { contract: 0, invoice: 0, report: 0 } as Record<string, number>;
if (regex.contractKeywords.test(text)) { score.contract += 1; evid.push('contract keywords'); }
if (regex.invoiceKeywords.test(text)) { score.invoice += 1; evid.push('invoice keywords'); }
if (regex.reportKeywords.test(text)) { score.report += 1; evid.push('report keywords'); }
const type = (Object.entries(score).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'unknown') as any;
const top = score[type] || 0;
const confidence = Math.min(1, 0.5 + 0.25 * top);
return { type, confidence, evidence: evid.slice(0,3) };
}


export function regexAssistInvoice(text: string) {
const out: Record<string, any> = {};
const inv = text.match(regex.invoiceNumber);
if (inv) out.invoice_number = inv[3];
const tot = text.match(regex.totalAmount);
if (tot) out.amount = tot[2];
const due = text.match(regex.dueDate);
if (due) out.due_date = due[2];
const tax = text.match(regex.taxLine);
if (tax) out.tax = tax[0];
const bt = text.match(regex.billTo);
if (bt) out.bill_to = bt[0];
const bf = text.match(regex.billFrom);
if (bf) out.bill_from = bf[0];
return out;
}