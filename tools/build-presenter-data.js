// Extracts the deck's slide registry from the patched chunk into
// site/presenter-data.json for the zero-key AI Presenter (matching + narration).
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'site', '_next', 'static', 'chunks', '3bo5o5jld0gbv.js');
const OUT = path.join(__dirname, '..', 'site', 'presenter-data.json');
const src = fs.readFileSync(FILE, 'utf8');

// The registry is exported as e.s(["f",0,[ ...slides... ]], 82217)
const marker = 'e.s(["f",0,';
const start = src.indexOf(marker);
if (start < 0) throw new Error('slide registry marker not found');
const arrStart = src.indexOf('[', start + marker.length - 1);

// Balanced-bracket scan that respects string literals and escapes.
let depth = 0, i = arrStart, end = -1, inStr = false, esc = false;
for (; i < src.length; i++) {
  const c = src[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === '\\') esc = true;
    else if (c === '"') inStr = false;
    continue;
  }
  if (c === '"') { inStr = true; continue; }
  if (c === '[' || c === '{') depth++;
  else if (c === ']' || c === '}') { depth--; if (depth === 0) { end = i; break; } }
}
if (end < 0) throw new Error('array end not found');
const arrSrc = src.slice(arrStart, end + 1);
// The literal references a shared `t` (the reusable blank slide) defined in the
// module; supply it, plus a `window`/`document`-free evaluation context.
let slides;
try {
  slides = new Function('t', 'return (' + arrSrc + ')')({ layoutId: 'blank' });
} catch (e) {
  // Report any other bare identifiers the array references.
  const ids = [...new Set([...arrSrc.matchAll(/[^{}\[\]":,\s]+(?=,|\])/g)].map((m) => m[0]).filter((w) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(w)))];
  throw new Error('Eval failed: ' + e.message + ' — identifiers present: ' + ids.join(', '));
}

const clean = (s) => String(s || '')
  .replace(/\u2197/g, '')
  .replace(/\s*\n+\s*/g, '. ')
  .replace(/\s+/g, ' ')
  .trim();

const derivedNarration = (s) => {
  const parts = [];
  if (s.intro) parts.push(clean(s.intro));
  if (s.title) parts.push(clean(s.title));
  if (s.subtitle) parts.push(clean(s.subtitle));
  if (s.body) parts.push(clean(s.body));
  if (s.paragraphs) s.paragraphs.forEach((p) => parts.push(clean(p)));
  if (s.bullets) parts.push(clean(s.bullets.join(', ')));
  if (s.projectDetails) s.projectDetails.forEach((d) => parts.push(clean(d.title) + ': ' + (d.items || []).map(clean).join('. ')));
  if (s.links && s.links.length) parts.push('Links: ' + s.links.map((l) => clean(l.text)).join(', '));
  return parts.filter(Boolean).join('. ').replace(/\.\.+/g, '.').slice(0, 1200);
};

const STOP = new Set(['a', 'an', 'the', 'to', 'me', 'my', 'of', 'and', 'for', 'i', 'is', 'it', 'this', 'that']);
const keywordsOf = (s) => {
  const kw = new Set(String(s.id || '').split(/[^a-z0-9]+/i).filter((w) => w && !STOP.has(w.toLowerCase())));
  [s.intro, s.title, s.subtitle].forEach((f) => {
    String(f || '').toLowerCase().split(/[^a-z0-9]+/).forEach((w) => { if (w && w.length > 2 && !STOP.has(w)) kw.add(w); });
  });
  return [...kw];
};

const out = slides.map((s, index) => ({
  id: s.id,
  index,
  layoutId: s.layoutId,
  blank: s.layoutId === 'blank',
  intro: s.intro || null,
  title: s.title || null,
  keywords: keywordsOf(s),
  narration: s.narration || derivedNarration(s),
}));

fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: out.length, slides: out }, null, 1));
console.log('Wrote', OUT, 'with', out.length, 'slides (blank:', out.filter((s) => s.blank).length + ')');
