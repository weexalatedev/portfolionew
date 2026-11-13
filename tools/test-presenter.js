// Verifies the AI Presenter end-to-end in headless Chromium.
// Speech APIs are stubbed; the deck's `voiceNavigate -> location.hash` contract
// (read from the real chunk source) is emulated so slide movement is observable.
const { chromium } = require('/workspace/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 160)));

  await page.addInitScript(() => {
    // --- speech synthesis stub ---
    window.__spoken = [];
    const synth = {
      _voices: [{ lang: 'en-GB', name: 'Test EN-GB' }],
      getVoices() { return this._voices; },
      cancel() {},
      speak(u) {
        window.__spoken.push(String(u.text));
        setTimeout(() => { if (u.onend) u.onend(); }, 25);
      },
    };
    Object.defineProperty(window, 'speechSynthesis', { get: () => synth, configurable: true });
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };

    // --- speech recognition stub ---
    window.SpeechRecognition = function () {
      this.lang = 'en-IN'; this.continuous = false; this.interimResults = false;
      this.started = false;
    };
    const proto = window.SpeechRecognition.prototype;
    proto.start = function () { this.started = true; if (this.onstart) this.onstart(); };
    proto.stop = function () { this.started = false; if (this.onend) this.onend(); };
    proto.abort = function () { this.started = false; };

    // --- emulate the deck's own voiceNavigate contract (from chunk source):
    // window.addEventListener('voiceNavigate', t => { const i = registry.findIndex(s => s.id === t.detail.slideId); ... })
    window.addEventListener('voiceNavigate', (t) => {
      window.__lastNavEvent = { slideId: t.detail.slideId, reason: t.detail.reason, at: Date.now() };
      // the real deck sets location.hash to `#<slideId>` when it navigates
      history.replaceState(null, '', '#' + t.detail.slideId);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__presenter && window.__presenter.state().ready, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  const results = {};
  results.uiPresent = await page.evaluate(() => !!document.querySelector('#ai-presenter .ap-fab'));
  results.initialState = await page.evaluate(() => window.__presenter.state());

  const run = (cmd) => page.evaluate((c) => { window.__presenter.handleCommand(c); }, cmd);
  const waitHash = (id, timeout = 8000) => page.waitForFunction(
    (x) => window.location.hash === '#' + x, id, { timeout }
  ).then(() => true).catch(() => false);

  // 1. voice navigation to a BNI slide by fuzzy name
  await run('go to proof');
  results.navProof = await waitHash('bni-proof');

  // 2. next
  await run('next');
  results.navNext = await waitHash('bni-how-we-work');

  // 3. previous
  await run('previous');
  results.navPrev = await waitHash('bni-proof');

  // 4. read/narrate current slide
  const spokenBefore = await page.evaluate(() => window.__spoken.length);
  await run('read this slide');
  await page.waitForTimeout(400);
  results.narration = await page.evaluate((n) => window.__spoken.slice(n), spokenBefore);

  // 5. navigate to an original (Tashfeen) project slide
  await run('take me to copilot');
  results.navCopilot = await waitHash('copilot-cover') || (await waitHash('copilot-intro', 4000));

  // 6. tour mode: should advance + narrate multiple slides
  await run('go to when a business outgrows its tools');
  results.navProblem = await waitHash('bni-the-problem');
  const beforeTour = await page.evaluate(() => ({ spoken: window.__spoken.length, nav: window.__lastNavEvent && window.__lastNavEvent.slideId }));
  await run('present everything');
  await page.waitForTimeout(3500);
  results.tour = await page.evaluate((b) => ({
    spokenAfterStart: window.__spoken.slice(b.spoken).map((t) => t.slice(0, 48)),
    lastNav: window.__lastNavEvent && window.__lastNavEvent.slideId,
  }), beforeTour);
  await run('stop');

  // 7. original "Start AI Presenter" button hijack -> starts listening
  const clicked = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Start AI Presenter"]');
    if (!b) return 'button not found';
    b.click();
    return 'clicked';
  });
  await page.waitForTimeout(400);
  const diag = await page.evaluate(() => ({
    listening: window.__presenter.state().listening,
    status: (document.querySelector('.ap-status') || {}).textContent || '',
    fabClass: document.querySelector('#ai-presenter .ap-fab').className,
    srType: typeof window.SpeechRecognition,
    loaded: window.__aiPresenterLoaded === true,
  }));
  results.buttonHijackDiag = { clicked, ...diag };
  if (!diag.listening) {
    await page.evaluate(() => window.__presenter.toggle());
    await page.waitForTimeout(300);
  }
  results.buttonHijack = {
    clicked,
    listeningAfterClick: diag.listening,
    listeningAfterDirectToggle: await page.evaluate(() => window.__presenter.state().listening),
    fabActive: await page.evaluate(() => document.querySelector('#ai-presenter .ap-fab').classList.contains('ap-on')),
  };
  await page.evaluate(() => window.__presenter.toggle()); // back off

  // 8. unknown command -> friendly fallback
  await run('order a pizza');
  await page.waitForTimeout(300);
  results.fallbackShown = await page.evaluate(() => (document.querySelector('.ap-status') || {}).textContent || '');

  results.pageErrors = pageErrors;
  results.finalHash = await page.evaluate(() => window.location.hash);

  await page.screenshot({ path: '/tmp/presenter-ui.png' });
  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
