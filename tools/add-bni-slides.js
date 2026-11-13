// Adds the WeExalate BNI deck (data extracted from bni.pdf) as new slides at the
// end of the deck's slide registry in site/_next/static/chunks/3bo5o5jld0gbv.js.
// Idempotent: skips if bni-intro already exists. Each slide carries a `narration`
// script consumed by site/ai-presenter.js.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'site', '_next', 'static', 'chunks', '3bo5o5jld0gbv.js');
let src = fs.readFileSync(FILE, 'utf8');

// Keep the client-side reader layer (article list) identical to SSR output so
// React hydration does not mismatch: the canvas consumes these slides, the
// prerendered article list does not need them.
if (!src.includes('/^bni-/.test')) {
  const arOld = '"blank"===e.layoutId?null:';
  const arNew = '"blank"===e.layoutId||/^bni-/.test(e.id||"")?null:';
  const arIdx = src.indexOf(arOld);
  if (arIdx >= 0) src = src.slice(0, arIdx) + arNew + src.slice(arIdx + arOld.length);
}

if (src.includes('id:"bni-intro"') || src.includes('"id":"bni-intro"')) {
  console.log('BNI slides already present - nothing to do.');
  process.exit(0);
}

const BNI = [
  {
    id: 'bni-intro', layoutId: 'project-intro',
    intro: 'BNI Shreshtha · Vapi–Valsad · November 2026',
    title: 'Custom software built around your business',
    body: 'Web apps, internal tools and APIs for ambitious Indian businesses.',
    links: [{ text: 'weexalate.com ↗', url: 'https://weexalate.com' }],
    narration: "Hi everyone, I'm Dhruvil Shah from WeExalate Dev Solutions. I build custom software, web apps, internal tools and APIs for ambitious Indian businesses. Let me show you what that looks like in practice.",
  },
  {
    id: 'bni-who-i-am', layoutId: 'about-layout-dark',
    intro: 'Who I am',
    title: 'Dhruvil Shah',
    highlightText: '85+ projects delivered since 2019',
    body: 'Custom Software & Web App Developer — WeExalate Dev Solutions, Valsad.',
    paragraphs: [
      'I build web apps, internal tools and APIs for owners and teams that have outgrown spreadsheets, WhatsApp orders, or software no one can maintain.',
    ],
    narration: "A quick intro: I'm a custom software and web app developer based in Valsad. Since 2019 I've delivered more than eighty-five projects for businesses that outgrew their spreadsheets and WhatsApp ordering.",
  },
  {
    id: 'bni-the-problem', layoutId: 'project-content',
    intro: 'The problem',
    title: 'When a business outgrows its tools',
    body: 'Today: orders arrive on WhatsApp, stock lives in Excel, reports are built by hand, follow-ups are kept in someone\u2019s head \u2014 and there is code nobody can maintain.\n\nWith custom software: one system built for you \u2014 orders, stock and team in one place, live dashboards instead of manual reports, and clean code your next developer can follow.',
    narration: "Here's the problem I solve. Growing businesses run on WhatsApp orders, Excel stock and hand-built reports, with code nobody can maintain. Custom software replaces all of that with one system built around how you actually work.",
  },
  {
    id: 'bni-what-i-build', layoutId: 'project-details',
    intro: 'What I build',
    title: 'Software that fits how you work',
    projectDetails: [
      { title: 'Web applications', items: ['Customer portals, SaaS products and platforms built to grow with their users.'] },
      { title: 'Internal tools', items: ['Dashboards that replace spreadsheets and manual workflows.'] },
      { title: 'API-first systems', items: ['Connect your tools through clean, documented APIs.'] },
      { title: 'Stack', items: ['Next.js · React · TypeScript · Node.js · PostgreSQL · MongoDB · AWS · Vercel'] },
    ],
    narration: "I build three things: web applications like customer portals and SaaS products; internal tools that replace spreadsheets with live dashboards; and API-first systems that connect your tools. The stack is modern and maintainable: Next.js, React, TypeScript, Node.js, PostgreSQL and MongoDB, on AWS and Vercel.",
  },
  {
    id: 'bni-proof', layoutId: 'project-details',
    intro: 'Proof',
    title: 'Recent builds, open on GitHub',
    projectDetails: [
      { title: 'EnerOS — weexalatedev/bill', items: ['An energy billing console on web and mobile, backed by one shared API.', 'Next.js · React Native · Node.js · MongoDB'] },
      { title: 'Window PMS — weexalatedev/pms-window', items: ['A production system where orders move through tasks, alerts and a kanban board.', 'Next.js · MongoDB · Clerk · Firebase'] },
      { title: 'Image Extractor — weexalatedev/image-downloader', items: ['An internal tool that pulls images from any page into one gallery and a ZIP.', 'Next.js · TypeScript · Tailwind · Cloudflare R2'] },
    ],
    links: [{ text: 'github.com/weexalatedev ↗', url: 'https://github.com/weexalatedev' }],
    narration: "Don't take my word for it. My recent builds are open on GitHub. EnerOS is an energy billing console on web and mobile. Window PMS is a production system where orders move through tasks, alerts and a kanban board. And Image Extractor pulls images from any page into one gallery and a ZIP file.",
  },
  {
    id: 'bni-how-we-work', layoutId: 'project-details',
    intro: 'How we work',
    title: 'From first call to launch, and beyond',
    projectDetails: [
      { title: '01 · Discovery call', items: ['1–2 hrs — we understand your goals and how the business runs.'] },
      { title: '02 · Strategy and proposal', items: ['2–3 days — stack, timeline, milestones and clear pricing.'] },
      { title: '03 · Design and build', items: ['3–8 weeks — you approve the design before build begins. Weekly check-ins.'] },
      { title: '04 · QA and launch', items: ['1 week — device testing, performance tuning and go-live.'] },
      { title: '05 · Support', items: ['Ongoing — monitoring and maintenance after launch.'] },
      { title: 'Pricing', items: ['Quoted upfront. Scope changes are discussed before any work proceeds.'] },
    ],
    narration: "How do we work? It starts with a one-to-two-hour discovery call. Within two or three days you get strategy, timeline and clear pricing. Design and build runs three to eight weeks with weekly check-ins, then a week of QA and launch, and ongoing support after that. Everything is quoted upfront.",
  },
  {
    id: 'bni-how-it-works', layoutId: 'project-content',
    intro: 'How custom software works',
    title: 'Your workflow, built into one system',
    body: '01 · We map how you work \u2014 orders, stock, approvals and who does what.\n02 · We design it with you \u2014 you approve the screens before any build begins.\n03 · We build and hand over \u2014 weekly check-ins, device testing and clean code your next developer can follow.',
    narration: "Custom software works in three steps. First we map how your business actually runs. Then we design it with you, and you approve every screen before any build begins. Then we build and hand over: weekly check-ins, device testing, and clean code your next developer can follow.",
  },
  {
    id: 'bni-custom-vs-shelf', layoutId: 'project-content',
    intro: 'Custom vs ready-made',
    title: 'Software that adapts to you, not the other way round',
    body: 'Off the shelf: you adapt to its process · features you pay for but never use · limits appear as you grow · your data sits on their platform.\n\nBuilt for you: built around your process · only the features you need · grows with your business · code and data under your control.',
    narration: "Compare ready-made software with custom. Off the shelf, you adapt to its process, you pay for features you never use, you hit limits as you grow, and your data sits on someone else's platform. Built for you, it's the opposite: built around your process, only the features you need, and your code and data stay under your control.",
  },
  {
    id: 'bni-one-order', layoutId: 'project-details',
    intro: 'One order, end to end',
    title: 'What changes when everything is in one place',
    projectDetails: [
      { title: '01 · Order arrives', items: ['From a form, an app or your team, straight into the system.'] },
      { title: '02 · Details saved', items: ['Customer, items and dates recorded once, with no retyping.'] },
      { title: '03 · Team is updated', items: ['Stock adjusts. Tasks and alerts reach the right people.'] },
      { title: '04 · Live dashboard', items: ['The owner sees the numbers without waiting for a report.'] },
    ],
    narration: "Here is one order, end to end. The order arrives from a form, an app or your team. Details are saved once, with no retyping. The team is updated automatically: stock adjusts, and tasks and alerts reach the right people. And the owner watches it all on a live dashboard, instead of waiting for a report. Before: WhatsApp orders, Excel stock, manual reports. After: one system, one live view of the business.",
  },
  {
    id: 'bni-ai-consultation', layoutId: 'project-content',
    intro: 'AI consultation',
    title: 'Where can AI genuinely help your business?',
    body: 'A practical review of your workflow, before you spend on any tool.\n\n01 · Review \u2014 we look at how work flows through your team today.\n02 · Recommend \u2014 clear advice on where AI helps, and where it does not.\n03 · Pilot \u2014 one small, focused test before you invest further.',
    narration: "I also offer AI consultations. Before you spend on any AI tool, we review how work actually flows through your team. I recommend where AI genuinely helps, and where it does not. And we run one small, focused pilot before you invest further.",
  },
  {
    id: 'bni-where-ai-helps', layoutId: 'project-content',
    intro: 'Where AI helps',
    title: 'Practical uses for everyday business work',
    body: 'Automation \u2014 draft quotes, invoices and replies from your own data.\nInsight \u2014 spot patterns in sales, stock and orders without building reports by hand.\nSupport \u2014 answer common questions quickly, with a person in the loop.\nKnowledge \u2014 find answers across manuals, policies and past orders in seconds.',
    narration: "Where does AI actually help? Automation: drafting quotes, invoices and replies from your own data. Insight: spotting patterns in sales, stock and orders. Support: answering common questions quickly, with a person in the loop. And knowledge: finding answers across manuals, policies and past orders in seconds.",
  },
  {
    id: 'bni-ai-process', layoutId: 'project-content',
    intro: 'How an AI consultation works',
    title: 'From first conversation to a small pilot',
    body: '01 · Understand your workflow \u2014 how your business and team work today.\n02 · Identify opportunities \u2014 where AI saves effort, and where it does not.\n03 · Plan the roadmap \u2014 priorities, tools and costs, agreed before anything starts.\n04 · Pilot \u2014 one focused trial, measured, before you scale.\n\nHonest advice first. If AI is not the right answer, I will say so.',
    narration: "An AI consultation runs in four steps: understand your workflow, identify the opportunities, plan the roadmap with priorities and costs, then run a measured pilot. And honest advice first: if AI is not the right answer, I will say so.",
  },
  {
    id: 'bni-recent-project', layoutId: 'project-content',
    intro: 'A recent project',
    title: 'One real problem, solved',
    body: 'The problem \u2014 where the business was stuck.\nThe build \u2014 what I made, in one sentence.\nThe result \u2014 what changed for the owner.\n\nAsk me about the Window PMS build.',
    narration: "I could walk you through a recent project end to end: the problem the business was stuck with, the build in one sentence, and the result for the owner. Ask me about it. I love this part.",
  },
  {
    id: 'bni-my-ask', layoutId: 'project-content',
    intro: 'My ask this week',
    title: 'Who do you know who...',
    body: '\u2026runs orders, stock or staff on Excel and WhatsApp?\n\nListen for:\n01 · Orders, stock or staff tracked in Excel and WhatsApp.\n02 · Software built by a developer who left, with no one able to maintain it.\n03 · A startup that needs its first product built on a solid structure.',
    narration: "My ask this week: who do you know who runs orders, stock or staff on Excel and WhatsApp? Or software built by a developer who left, with no one able to maintain it? Or a startup that needs its first product built on a solid structure? An introduction would mean a lot.",
  },
  {
    id: 'bni-thanks', layoutId: 'contact-layout',
    intro: 'Thank you, BNI Shreshtha',
    title: 'Questions?',
    body: 'Ask me anything about custom software and web apps.',
    links: [
      { text: 'Dhruvil Shah · +91 97257 98316', url: 'tel:+919725798316' },
      { text: 'hello@weexalate.com', url: 'mailto:hello@weexalate.com' },
      { text: 'weexalate.com ↗', url: 'https://weexalate.com' },
      { text: 'github.com/weexalatedev ↗', url: 'https://github.com/weexalatedev' },
    ],
    narration: "Thank you, BNI Shreshtha! I'm Dhruvil Shah from WeExalate Dev Solutions. Call me on nine seven two five seven nine eight three one six, or visit weexalate dot com. The first call is free, so ask me anything about custom software and web apps.",
  },
];

// Locate the end of the slides array: it closes right after the `contact` slide:
//   ...{id:"contact",...}]]  ->  the `]]` terminates the slides array inside e.s(["f",0,[...]])
const contactIdx = src.indexOf('{id:"contact"');
if (contactIdx < 0) throw new Error('contact slide not found');
const endIdx = src.indexOf('}]]', contactIdx);
if (endIdx < 0) throw new Error('slides array terminator not found');

const insertion = '},' + JSON.stringify(BNI).slice(1, -1) + ']]';
src = src.slice(0, endIdx) + insertion + src.slice(endIdx + 3);

fs.writeFileSync(FILE, src);
console.log('Inserted ' + BNI.length + ' BNI slides after the contact slide. New chunk size:', src.length);
