export function extractFirstJsonObject(text: string): any | null {
const start = text.indexOf('{');
if (start === -1) return null;
// naive brace matching to find end of first JSON object
let depth = 0;
for (let i = start; i < text.length; i++) {
const ch = text[i];
if (ch === '{') depth++;
else if (ch === '}') {
depth--;
if (depth === 0) {
const candidate = text.slice(start, i + 1);
try {
return JSON.parse(candidate);
} catch { /* continue */ }
}
}
}
return null;
}