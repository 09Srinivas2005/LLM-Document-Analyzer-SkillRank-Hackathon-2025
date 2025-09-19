export const regex = {
invoiceNumber: /(invoice\s*(no\.|number|#)\s*[:\-]?\s*)([A-Z0-9\-\/\.]{4,})/i,
totalAmount: /(grand\s*total|total\s*amount\s*due)\s*[:\-]?\s*\$?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i,
anyAmount: /\$\s*([0-9][0-9,]*\.?[0-9]{0,2})/g,
dueDate: /(due\s*date|payment\s*due\s*by)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
dateAny: /(\b\w{3,9}\s+\d{1,2},\s*\d{4}\b|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b)/,
taxLine: /(tax|vat|gst)\s*(amount|rate|%)?\s*[:\-]?\s*(\d{1,2}(\.\d+)?%|\$?\s*[0-9][0-9,]*\.?[0-9]{0,2}|not\s*calculated)/i,
billTo: /(bill\s*to\s*:?[\s\S]{0,200})/i,
billFrom: /(vendor\s*information|bill\s*from|seller|from\s*:?[\s\S]{0,200})/i,
contractKeywords: /(contract|agreement|services|arbitration|indemnification|governing\s*law)/i,
invoiceKeywords: /(invoice|qty|unit\s*price|amount\s*due|subtotal|tax|remittance)/i,
reportKeywords: /(report|executive\s*summary|findings|methodology|appendix)/i
};