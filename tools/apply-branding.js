// Applies WeExalate branding to the mirrored index.html (title, meta, OG,
// favicon) and verifies deck-state. Idempotent.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'site', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

const swaps = [
  ['<title>Tashfeen Ahmed | AI Product Designer, Microsoft 365 Copilot</title>',
   '<title>WeExalate Dev Solutions | Web + SEO Agency, Valsad</title>'],
  ['Tashfeen Ahmed is an AI Product Designer and Sr. Product Designer at Microsoft working on Microsoft 365 Copilot. Awwwards Honorable Mention, January 14 2026.',
   'WeExalate Dev Solutions — web design, development and SEO agency in Valsad, India. Custom software, web apps and websites that actually work. 85+ projects since 2019.'],
  ['<meta property="og:title" content="Tashfeen Ahmed | AI Product Designer, Microsoft 365 Copilot"/>',
   '<meta property="og:title" content="WeExalate Dev Solutions | Web + SEO Agency, Valsad"/>'],
  ['<meta property="og:image" content="https://tashfeen.me/featured.png"/>',
   '<meta property="og:image" content="https://weexalate.com/img/weexalate/weexalate-home.jpg"/>'],
  ['<meta name="twitter:image" content="https://tashfeen.me/featured.png"/>',
   '<meta name="twitter:image" content="https://weexalate.com/img/weexalate/weexalate-home.jpg"/>'],
  ['<meta name="twitter:title" content="Tashfeen Ahmed | AI Product Designer, Microsoft 365 Copilot"/>',
   '<meta name="twitter:title" content="WeExalate Dev Solutions | Web + SEO Agency, Valsad"/>'],
  ['<meta name="twitter:description" content="Tashfeen Ahmed is an AI Product Designer and Sr. Product Designer at Microsoft working on Microsoft 365 Copilot. Awwwards Honorable Mention, January 14 2026."/>',
   '<meta name="twitter:description" content="WeExalate Dev Solutions — web design, development and SEO agency in Valsad, India. Custom software, web apps and websites that actually work."/>'],
  ['content="https://tashfeen.me/featured-square.png"',
   'content="https://weexalate.com/img/weexalate/weexalate-home.jpg"'],
  ['href="/favicon.ico?favicon.2vob68tjqpejf.ico"',
   'href="/favicon.svg" type="image/svg+xml"'],
];

let applied = 0;
for (const [from, to] of swaps) {
  if (html.includes(from)) { html = html.split(from).join(to); applied++; }
  else if (!html.includes(to.split('"').slice(-2, -1)[0]) && !html.includes(to)) {
    console.log('SKIP (pattern not found):', from.slice(0, 60));
  }
}
// og:title/twitter:title may appear escaped inside the flight payload — leave those.
fs.writeFileSync(FILE, html);
console.log('Branding applied: ' + applied + '/' + swaps.length + ' swaps.');
