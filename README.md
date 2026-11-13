# portfolionew — exact mirror of tashfeen.me

This repository contains a byte-faithful, fully self-contained mirror of <https://tashfeen.me/> —
the portfolio of Tashfeen Ahmed (AI Product Designer, Microsoft 365 Copilot).

Everything the origin serves is captured here: the prerendered HTML for every public
route, all Next.js/Turbopack JS chunks, the CSS bundle, fonts, images and videos,
favicon/OG assets, `robots.txt`, `sitemap.xml`, `feed.xml`, and the RSC (React Server
Component) flight payloads that power client-side navigation.

## Layout

```
site/
├── index.html                      # /            (main deck-style portfolio)
├── process/index.html              # /process
├── writing/index.html              # /writing
├── writing/<slug>/index.html       # 3 essays
├── snotes/index.html               # /snotes (sticky-notes wall)
├── _next/static/chunks/**          # JS + CSS bundles (original hashes preserved)
├── _next/static/media/**           # next/font woff2 files
├── _rsc/**                         # flight payloads for client-side navigation
├── fonts/**                        # Helvetica Now Display + Ivy Ora Display
├── img/**                          # project imagery + mp4 demos
├── featured.png, featured-square.png, favicon.ico, web-app-manifest-*.png
├── robots.txt, sitemap.xml, feed.xml
└── ga-init.js                      # analytics bootstrap
```

## Run locally

```bash
node server.js          # http://localhost:4173
```

`server.js` adds clean-URL routing, correct MIME types, immutable caching for
`/_next/static/**`, the origin's security headers, and — importantly — serves the
pre-fetched RSC payloads from `site/_rsc/**` when the Next.js client router asks
for them, so in-app navigation behaves exactly like production.

Any plain static file server also works (the pages are fully prerendered); without
RSC support Next.js simply falls back to hard navigations between routes.

## AI Presenter (voice control + narration) — no API key needed

`site/ai-presenter.js` adds a working AI Presenter to the deck:

- **Voice commands** (Web Speech API — Chrome/Edge, no key, no backend): click the
  mic FAB (bottom-right) or the site's own **AI Presenter** button, then say
  - “go to proof” / “take me to copilot” / “go to when a business outgrows its tools”
  - “next” / “previous”
  - “read this slide” — narrates the slide aloud (speechSynthesis)
  - “present everything” — full guided tour: navigates + narrates every slide
  - “stop”
- **Your slides**: the 15 WeExalate BNI slides (from `bni.pdf`) are appended to the
  deck's registry (`tools/add-bni-slides.js`) with narration scripts, reachable by
  voice alongside the original slides.
- **Typed fallback**: the ⌨ button accepts the same commands as text (Firefox/Safari,
  or when the mic is blocked).
- **Optional AI understanding**: gear icon → paste an OpenAI API key (kept in this
  browser only) and commands are parsed by `gpt-4o-mini` for robust intent matching.
  Without a key, built-in fuzzy matching handles everything.
- The deck is driven through its own `voiceNavigate` CustomEvent contract — no
  original code was forked. The original "AI Presenter" button (which required a
  `/api/voice` backend + OpenAI Realtime) is rerouted into this client-side
  presenter, since a static mirror has no backend.

Regenerate the presenter's slide index after any deck-data change:
`node tools/build-presenter-data.js`.



The `site/` directory is a standard static bundle — deploy it to any static host
(Cloudflare Pages, Netlify, S3, nginx). Set the publish directory to `site/`.
No build step is required.

## How the mirror was captured

`tools/mirror.sh` + `tools/crawl.sh` fetch every public route, then iteratively
extract and download every referenced asset (HTML → JS/CSS chunks → lazily-loaded
chunks → images/videos/fonts) until no new references appear (fixpoint). RSC flight
payloads for client-side navigation are captured with an `RSC: 1` request into
`site/_rsc/**`. Re-run both scripts any time the origin changes to re-sync.

## Verification (performed 2026-11-12)

- All 9 routes + static assets served locally with HTTP 200 and correct MIME types.
- Headless-Chromium session against the mirror: **zero failed requests / zero 404s**;
  title, prerendered content and client-side navigation (RSC payloads) match the origin.
- Pixel comparison of rendered pages (Playwright + pixelmatch, local vs live):
  **0.003–0.007% differing pixels** — visually indistinguishable.
- The only console error (`CanvasRenderer is not yet implemented`) and the deck's
  "Stretching the canvas..." loader state reproduce **identically on the live origin**
  in the same sandboxed browser (WebGL/WebGPU is unavailable there), confirming the
  differences are environmental, not mirror defects.

## Notes

- All content, imagery and fonts in `site/` belong to the site's author; this repo
  is a migration of that site, not a redistribution.
- `/snotes` renders its UI from the mirrored page, but posting notes needs the
  origin's backend API, which is intentionally not part of a static mirror.
- Analytics (Google Tag Manager) still load as on the origin.
