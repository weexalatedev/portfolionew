// Replaces the deck's slide registry with the WeExalate agency deck (content
// researched from weexalate.com + github.com/weexalatedev + live Vercel apps).
// The original (SSR-rendered) slide array is preserved as a snapshot that the
// reader-layer article feed keeps using, so React hydration stays clean.
// Idempotent: exits if the WeExalate deck is already installed.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'site', '_next', 'static', 'chunks', '3bo5o5jld0gbv.js');
let src = fs.readFileSync(FILE, 'utf8');

if (src.includes('"id":"weex-about"') || src.includes('id:"weex-about"')) {
  console.log('WeExalate deck already installed — nothing to do.');
  process.exit(0);
}

// ---- 1. snapshot the pristine (SSR-rendered) slide array from main ----
const pristine = execFileSync('git', ['show', 'main:site/_next/static/chunks/3bo5o5jld0gbv.js'], {
  cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
});
function extractArray(source) {
  const marker = 'e.s(["f",0,';
  const start = source.indexOf(marker);
  if (start < 0) throw new Error('registry marker not found');
  const arrStart = source.indexOf('[', start + marker.length - 1);
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = arrStart; i < source.length; i++) {
    const c = source[i];
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
  return source.slice(arrStart, end + 1);
}
const ssrArray = extractArray(pristine);

// ---- 2. inject the snapshot + repoint the article feed ----
const bootAnchor = '(()=>{"use strict";';
if (!src.includes('globalThis.__ssrSlides=')) {
  const idx = src.indexOf(bootAnchor);
  if (idx < 0) throw new Error('chunk boot anchor not found');
  const at = idx + bootAnchor.length;
  // The pristine array references the module-local blank-slide constant `t`;
  // evaluate the snapshot in a scope that provides it.
  src = src.slice(0, at) + 'globalThis.__ssrSlides=(function(){var t={layoutId:"blank"};return ' + ssrArray + ';})();' + src.slice(at);
}
const feedOld = 'n.f.map((e,i)=>';
const feedNew = '(globalThis.__ssrSlides||n.f).map((e,i)=>';
if (src.includes(feedOld)) src = src.replace(feedOld, feedNew);

// ---- 3. the WeExalate deck ----
const BLANK = { layoutId: 'blank' };
const SLIDES = [
  // — opening —
  {
    id: 'intro', layoutId: 'particle-globe',
    title: 'WeExalate Dev Solutions',
    subtitle: 'We build websites that actually work.',
    links: [
      { text: 'weexalate.com ↗', url: 'https://weexalate.com' },
      { text: 'GitHub ↗', url: 'https://github.com/weexalatedev' },
    ],
    narration: "Welcome — this is WeExalate Dev Solutions, a web and SEO agency from Valsad, India. We build websites that actually work: fast, beautiful, and built to rank. Let me walk you through who we are and what we've shipped.",
  },
  BLANK,
  // — agency —
  {
    id: 'weex-about', layoutId: 'about-layout-dark',
    intro: 'The agency',
    title: 'Web + SEO agency from Valsad,\nbuilding websites that actually work',
    highlightText: '85+ projects · ₹4Cr+ generated · 98% client retention',
    body: 'WeExalate crafts high-performance websites and data-driven SEO strategies for Indian businesses — WordPress, Shopify, Webflow, or fully custom. Since 2019.',
    paragraphs: [
      'Average traffic increase across clients: 3.2×. Rating: 5.0 out of 5.0. Every project is quoted upfront, with weekly check-ins and no hidden costs.',
    ],
    image: '/img/weexalate/weexalate-home.jpg',
    links: [{ text: 'weexalate.com ↗', url: 'https://weexalate.com' }],
    narration: "A quick introduction. WeExalate is a web and SEO agency based in Valsad, Gujarat. Since 2019 we've shipped more than eighty-five projects and generated over four crore rupees in client revenue, with a ninety-eight percent client retention rate.",
  },
  {
    id: 'weex-services', layoutId: 'project-details',
    intro: 'What we do',
    title: 'Every digital need, expertly handled',
    projectDetails: [
      { title: 'Web development', items: ['WordPress, Shopify and Webflow builds that load fast, rank high and convert.'] },
      { title: 'Custom development', items: ['Bespoke web apps on Next.js, React and Node.js — SaaS platforms, internal tools and API-first systems.'] },
      { title: 'SEO & digital growth', items: ['Technical excellence, content architecture and link authority that move the rankings that matter.'] },
      { title: 'UI/UX design', items: ['Interfaces rooted in user research — every button placement and colour choice intentional.'] },
    ],
    narration: "We do four things. Web development on WordPress, Shopify and Webflow. Custom development — SaaS platforms, internal tools and API-first systems on Next.js, React and Node.js. Data-driven SEO that moves rankings that matter. And UI/UX design where every interaction is intentional.",
  },
  {
    id: 'weex-results', layoutId: 'project-details',
    intro: 'Proven results',
    title: 'Work that moves the numbers',
    projectDetails: [
      { title: 'Vrajesh Textiles · Surat', items: ['Shopify + SEO: 3× online revenue in 90 days', '₹18L+ per month · +312% revenue · +189% organic traffic', '4.2% conversion rate · 1.8s page load'] },
      { title: 'Dharmatech SaaS · Ahmedabad', items: ['Next.js website that converts at 6.8%', '99/100 Lighthouse score', '+240% trial signups · −52% bounce rate'] },
      { title: 'Across the portfolio', items: ['3.2× average traffic increase · 98% client retention'] },
    ],
    narration: "We don't just build websites — we build businesses. For Vrajesh Textiles in Surat, a Shopify store plus SEO tripled online revenue in ninety days — they now process over eighteen lakh rupees a month. For Dharmatech, an HR-tech SaaS in Ahmedabad, we shipped a Next.js site with a 99 Lighthouse score that converts at six point eight percent.",
  },
  {
    id: 'weex-testimonials', layoutId: 'testimonial-cards',
    intro: 'In their words',
    title: 'Clients on working with WeExalate',
    testimonials: [
      { quote: "WeExalate didn't just build us a website — they built us a revenue channel. Our online sales went from near zero to ₹18L per month in 90 days. I wish we had done this 3 years earlier.", name: 'Vrajesh Patel', company: 'Owner — Vrajesh Textiles, Surat' },
      { quote: "The team understood our SaaS product deeply, rewrote our entire messaging, and delivered a site that converts at 6.8%. That's not a web agency — that's a growth partner.", name: 'Neha Gohil', company: 'Co-Founder — Dharmatech Solutions, Ahmedabad' },
      { quote: 'Professional from the first call. The WordPress site they built for us is fast, beautiful, and we can update it ourselves. SEO results started showing in month 3.', name: 'Rajan Doshi', company: 'Director — Coastal Foods, Vapi' },
      { quote: 'We needed a Webflow site quickly for a product launch. WeExalate delivered in 3 weeks, it looked incredible, and our Google Ads quality scores improved immediately.', name: 'Sonal Trivedi', company: 'Marketing Head — Sunrise Pharma, Bharuch' },
    ],
    narration: "Don't take our word for it. Vrajesh Patel calls us a revenue channel, not a website vendor. Neha Gohil from Dharmatech says that's a growth partner, not a web agency. Rajan Doshi and Sonal Trivedi will tell you about speed, quality and SEO results that show up in months, not years.",
  },
  {
    id: 'weex-process', layoutId: 'project-details',
    intro: 'How we work',
    title: 'From idea to launch — and beyond',
    projectDetails: [
      { title: '01 · Discovery call', items: ['1–2 hrs — we understand your business, goals and competitive landscape.'] },
      { title: '02 · Strategy & proposal', items: ['2–3 days — recommended stack, timeline, milestones and transparent pricing.'] },
      { title: '03 · Design & build', items: ['3–8 weeks — design-first: you approve the look before development begins. Weekly check-ins.'] },
      { title: '04 · QA & launch', items: ['1 week — device testing, performance tuning and SEO setup before go-live.'] },
      { title: '05 · Growth & support', items: ['Ongoing — monitoring, maintenance and ongoing SEO after launch.'] },
      { title: 'Pricing', items: ['Quoted comprehensively upfront. Scope changes are discussed before any work proceeds.'] },
    ],
    narration: "How we work: a one-to-two-hour discovery call, a full strategy and proposal within two or three days, design and build over three to eight weeks with weekly check-ins, a week of QA before launch, and ongoing growth support after. Everything is quoted upfront — no surprises, ever.",
  },
  BLANK,
  // — work index —
  {
    id: 'main-menu', layoutId: 'projects-index-two-column-dark',
    title: "Things we've built",
    bullets: ['EnerOS — AI energy manager', 'Window PMS — manufacturing ERP', 'Image Extractor', 'PropDesk — real estate CRM', 'Product Catalog'],
    links: [
      { text: 'EnerOS', url: 'slide://weex-eneros' },
      { text: 'Window PMS', url: 'slide://weex-pms' },
      { text: 'Image Extractor', url: 'slide://weex-extractor' },
      { text: 'PropDesk CRM', url: 'slide://weex-propdesk' },
      { text: 'Product Catalog', url: 'slide://weex-catalog' },
      { text: 'weexalate.com ↗', url: 'https://weexalate.com' },
    ],
    narration: "Here's a sample of what we've built — all open on GitHub and most live in production. EnerOS, an AI energy manager. Window PMS, a manufacturing ERP. Image Extractor. PropDesk, a real estate CRM. And a full-stack product catalog.",
  },
  // — EnerOS —
  {
    id: 'weex-eneros', layoutId: 'project-cover-dark',
    intro: 'Product build · Live on Vercel',
    title: 'EnerOS',
    body: 'An AI energy manager for British SMBs: reads bills, audits every line against the contract, and watches sites so waste shows up before it hits the P&L. Web + mobile console on one shared data core.',
    image: '/img/weexalate/eneros.jpg',
    links: [
      { text: 'Live ↗', url: 'https://bill-neon-two.vercel.app' },
      { text: 'GitHub ↗', url: 'https://github.com/weexalatedev/bill' },
    ],
    narration: "First up: EnerOS — the autonomous energy manager for Britain's small and medium businesses. It reads your bills, checks every line against your contract and a published reference, and watches your sites so waste shows up before it reaches your P and L. A web and mobile console sharing one source of truth.",
  },
  {
    id: 'weex-eneros-shot', layoutId: 'full-cover-image',
    image: '/img/weexalate/eneros.jpg',
    narration: 'That is EnerOS live — the bill audit screen flags every deviation from the contract, and every saving is estimated or verified against a baseline. Never an unsupported claim.',
  },
  // — Window PMS —
  {
    id: 'weex-pms', layoutId: 'project-cover-dark',
    intro: 'Product build · Manufacturing ERP',
    title: 'Window PMS',
    body: 'Production-grade PMS for window manufacturing: orders move through tasks, alerts and a kanban board — with role-based access, threaded comments and push notifications.',
    image: '/img/weexalate/window-pms.jpg',
    links: [{ text: 'GitHub ↗', url: 'https://github.com/weexalatedev/pms-window' }],
    narration: "Window PMS — a production-grade production management system for window manufacturing. Orders move through tasks, alerts and a kanban board, with role-based access control, threaded comments and push notifications. Built on Next.js with MongoDB, Clerk auth and Firebase messaging.",
  },
  {
    id: 'weex-pms-shot', layoutId: 'full-cover-image',
    image: '/img/weexalate/window-pms.jpg',
    narration: 'The Window PMS repository — a hundred and thirteen commits of production TypeScript.',
  },
  // — Image Extractor —
  {
    id: 'weex-extractor', layoutId: 'project-cover-dark',
    intro: 'Internal tool',
    title: 'Image Extractor',
    body: 'Pulls images off the web four ways — page URL, pasted HTML, bulk URLs, or stock search across Unsplash, Pexels and Pixabay — into one gallery with filters, format conversion and bulk ZIP download.',
    image: '/img/weexalate/image-extractor.jpg',
    links: [{ text: 'GitHub ↗', url: 'https://github.com/weexalatedev/image-downloader' }],
    narration: "Image Extractor — an internal tool that pulls images off the web four ways: from a page URL, pasted HTML, bulk URLs, or stock-photo search across Unsplash, Pexels and Pixabay. Everything lands in one gallery with filters and a bulk ZIP pipeline.",
  },
  {
    id: 'weex-extractor-shot', layoutId: 'full-cover-image',
    image: '/img/weexalate/image-extractor.jpg',
    narration: 'The Image Extractor repository — TypeScript end to end.',
  },
  // — PropDesk —
  {
    id: 'weex-propdesk', layoutId: 'project-cover-dark',
    intro: 'Product build · Real estate CRM',
    title: 'PropDesk',
    body: 'A full-featured real estate CRM: revenue pipeline dashboard, property listings, lead scoring with a Kanban pipeline, calendar-based visit scheduling, payment tracking and unified global search.',
    image: '/img/weexalate/propdesk-crm.jpg',
    links: [{ text: 'GitHub ↗', url: 'https://github.com/weexalatedev/realestate-crm' }],
    narration: "PropDesk — a full-featured real estate CRM. Revenue pipeline dashboards, property listings, lead scoring on a Kanban pipeline, calendar-based visit scheduling, payment tracking and unified global search. Built with Next.js, MongoDB, Clerk and Recharts.",
  },
  {
    id: 'weex-propdesk-shot', layoutId: 'full-cover-image',
    image: '/img/weexalate/propdesk-crm.jpg',
    narration: 'The PropDesk repository — dark-first UI with a sidebar layout and role-based access control.',
  },
  // — Product Catalog —
  {
    id: 'weex-catalog', layoutId: 'project-cover-dark',
    intro: 'Product build · Full-stack catalog',
    title: 'Product Catalog',
    body: 'Add items, upload images and share catalog links with anyone — no external database, no cloud storage service. One server does it all.',
    image: '/img/weexalate/product-catalog.jpg',
    links: [{ text: 'GitHub ↗', url: 'https://github.com/weexalatedev/catalog-vercel' }],
    narration: "Product Catalog — a full-stack catalog where you add items, upload images and share links with anyone. No external database, no cloud storage — one server does it all.",
  },
  {
    id: 'weex-catalog-shot', layoutId: 'full-cover-image',
    image: '/img/weexalate/product-catalog.jpg',
    narration: 'The Product Catalog repository — Next.js fourteen with a zero-dependency storage design.',
  },
  BLANK,
  // — AI services —
  {
    id: 'weex-ai', layoutId: 'project-content',
    intro: 'AI consultation',
    title: 'Where can AI genuinely help your business?',
    body: 'A practical review of your workflow, before you spend on any tool.\n\n01 · Review — we look at how work flows through your team today.\n02 · Recommend — clear advice on where AI helps, and where it does not.\n03 · Pilot — one small, focused test before you invest further.',
    narration: "We also offer AI consultations. Before you spend on any AI tool, we review how work actually flows through your team. We recommend where AI genuinely helps, and where it does not. And we run one small, focused pilot before you invest further.",
  },
  {
    id: 'weex-ai-uses', layoutId: 'project-content',
    intro: 'Where AI helps',
    title: 'Practical uses for everyday business work',
    body: 'Automation — draft quotes, invoices and replies from your own data.\nInsight — spot patterns in sales, stock and orders without building reports by hand.\nSupport — answer common questions quickly, with a person in the loop.\nKnowledge — find answers across manuals, policies and past orders in seconds.',
    narration: "Where does AI actually help? Automation: drafting quotes, invoices and replies from your own data. Insight: spotting patterns in sales, stock and orders. Support: answering common questions quickly, with a person in the loop. And knowledge: finding answers across manuals, policies and past orders in seconds.",
  },
  BLANK,
  // — contact —
  {
    id: 'contact', layoutId: 'contact-layout',
    intro: 'Start a project',
    title: 'hello@weexalate.com',
    body: 'The first call is free. Tell us what you\u2019re trying to grow.',
    links: [
      { text: 'Dhruvil Shah · +91 97257 98316', url: 'tel:+919725798316' },
      { text: 'hello@weexalate.com', url: 'mailto:hello@weexalate.com' },
      { text: 'weexalate.com ↗', url: 'https://weexalate.com' },
      { text: 'github.com/weexalatedev ↗', url: 'https://github.com/weexalatedev' },
    ],
    narration: "That's WeExalate Dev Solutions. The first call is free — tell us what you're trying to grow. Reach Dhruvil Shah on nine seven two five seven nine eight three one six, or at hello at weexalate dot com. You'll find us on weexalate dot com and on GitHub at github dot com slash weexalatedev.",
  },
];

// ---- 4. swap the registry ----
const marker = 'e.s(["f",0,';
const start = src.indexOf(marker);
if (start < 0) throw new Error('registry marker not found in current chunk');
const arrStart = src.indexOf('[', start + marker.length - 1);
let depth = 0, inStr = false, esc = false, end = -1;
for (let i = arrStart; i < src.length; i++) {
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
if (end < 0) throw new Error('current array end not found');
src = src.slice(0, arrStart) + JSON.stringify(SLIDES) + src.slice(end + 1);

fs.writeFileSync(FILE, src);
const nonBlank = SLIDES.filter((s) => s.layoutId !== 'blank').length;
console.log('WeExalate deck installed: ' + nonBlank + ' slides + ' + (SLIDES.length - nonBlank) + ' blanks (was 90 + 25).');
