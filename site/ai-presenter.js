/**
 * AI Presenter — zero-API-key voice control + narration for the deck.
 *
 * Fully client-side:
 *   - Speech recognition : Web Speech API (webkitSpeechRecognition) — Chrome/Edge, no key
 *   - Narration (TTS)    : speechSynthesis — no key
 *   - Navigation         : dispatches the deck's own `voiceNavigate` CustomEvent(slideId)
 *   - Optional           : paste an OpenAI API key (stored locally) for smarter intent
 *                          matching via Chat Completions; everything works without it.
 *                          (The original site needed a backend /api/voice + OpenAI
 *                          Realtime session; this build does not.)
 */
(function () {
  'use strict';
  if (window.__aiPresenterLoaded) return;
  window.__aiPresenterLoaded = true;

  var NAV_EVENT = 'voiceNavigate';
  var DATA_URL = '/presenter-data.json';
  var KEY_STORE = 'aiPresenter.openaiKey';

  var slides = [];   // full registry incl. blanks
  var order = [];    // navigable (non-blank) slides in deck order
  var byId = {};     // id -> slide
  var currentId = null;
  var listening = false;
  var recognition = null;
  var recognitionWanted = false;
  var tour = null;
  var tourTimer = null;
  var dataReady = false;

  var css = [
    '.ap-root{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:system-ui,sans-serif}',
    '.ap-status{max-width:320px;padding:10px 14px;border-radius:14px;background:var(--ui-bg,#111);color:var(--ui-text,#eee);border:1px solid var(--ui-border,#333);box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:13px;line-height:1.45;backdrop-filter:blur(10px);opacity:0;transform:translateY(6px);transition:all .25s ease;pointer-events:none}',
    '.ap-status.ap-show{opacity:1;transform:translateY(0);pointer-events:auto}',
    '.ap-status .ap-heard{opacity:.75;font-style:italic;display:block;margin-top:4px}',
    '.ap-row{display:flex;align-items:center;gap:8px}',
    '.ap-fab{width:56px;height:56px;border-radius:999px;border:1px solid var(--ui-border,#333);background:var(--ui-bg,#111);color:var(--ui-text,#eee);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35);backdrop-filter:blur(10px);transition:transform .2s ease}',
    '.ap-fab:hover{transform:scale(1.06)}',
    '.ap-fab.ap-on{color:#0a0a0a;background:#7CFCB3;border-color:#7CFCB3}',
    '.ap-fab svg{width:22px;height:22px}',
    '.ap-input{display:none;gap:8px}.ap-input.ap-show{display:flex}',
    '.ap-input input{width:250px;padding:10px 14px;border-radius:999px;border:1px solid var(--ui-border,#333);background:var(--ui-bg,#111);color:var(--ui-text,#eee);font-size:13px;outline:none}',
    '.ap-mini{width:36px;height:36px;border-radius:999px;border:1px solid var(--ui-border,#333);background:var(--ui-bg,#111);color:var(--ui-text,#eee);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px}',
    '.ap-panel{display:none;padding:12px;border-radius:14px;background:var(--ui-bg,#111);color:var(--ui-text,#eee);border:1px solid var(--ui-border,#333);box-shadow:0 10px 30px rgba(0,0,0,.35);width:280px;font-size:12px}',
    '.ap-panel.ap-show{display:block}',
    '.ap-panel input{width:100%;box-sizing:border-box;margin:8px 0;padding:8px 10px;border-radius:8px;border:1px solid var(--ui-border,#333);background:transparent;color:inherit;font-size:12px}',
    '.ap-panel .ap-actions{display:flex;gap:8px;margin-top:6px}',
    '.ap-panel button{flex:1;padding:7px 10px;border-radius:8px;border:1px solid var(--ui-border,#333);background:transparent;color:inherit;cursor:pointer;font-size:12px}',
    '.ap-panel p{margin:4px 0;opacity:.8;line-height:1.4}'
  ].join('\n');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var ui = {};
  var statusTimer = null;
  function status(html, ms) {
    if (!ui.status) return;
    ui.status.innerHTML = html;
    ui.status.classList.add('ap-show');
    if (statusTimer) { clearTimeout(statusTimer); statusTimer = null; }
    if (ms) statusTimer = setTimeout(function () { ui.status.classList.remove('ap-show'); }, ms);
  }
  function buildUI() {
    var style = document.createElement('style');
    style.id = 'ai-presenter-style';
    style.textContent = css;
    document.head.appendChild(style);

    var root = el('div', 'ap-root');
    ui.root = root;
    root.id = 'ai-presenter';

    ui.status = el('div', 'ap-status');
    ui.status.setAttribute('role', 'status');
    ui.status.setAttribute('aria-live', 'polite');

    var row = el('div', 'ap-row');
    ui.fab = el('button', 'ap-fab');
    ui.fab.setAttribute('aria-label', 'Toggle AI Presenter voice control');
    ui.fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
    ui.fab.addEventListener('click', function () { toggleListening(); });

    ui.kbd = el('button', 'ap-mini');
    ui.kbd.title = 'Type a command instead';
    ui.kbd.setAttribute('aria-label', 'Type a command instead');
    ui.kbd.textContent = '⌨';
    ui.kbd.addEventListener('click', function () {
      ui.inputWrap.classList.toggle('ap-show');
      if (ui.inputWrap.classList.contains('ap-show')) ui.text.focus();
    });

    ui.gear = el('button', 'ap-mini');
    ui.gear.title = 'Presenter settings (optional AI key)';
    ui.gear.setAttribute('aria-label', 'Presenter settings');
    ui.gear.textContent = '⚙';
    ui.gear.addEventListener('click', function () { ui.panel.classList.toggle('ap-show'); });

    row.appendChild(ui.kbd);
    row.appendChild(ui.gear);
    row.appendChild(ui.fab);

    ui.inputWrap = el('div', 'ap-input');
    ui.text = el('input');
    ui.text.placeholder = 'Type a command — "go to pricing", "next"…';
    ui.text.setAttribute('aria-label', 'Presenter command');
    ui.text.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && ui.text.value.trim()) { handleCommand(ui.text.value); ui.text.value = ''; }
      if (e.key === 'Escape') ui.inputWrap.classList.remove('ap-show');
    });
    ui.inputWrap.appendChild(ui.text);

    ui.panel = el('div', 'ap-panel');
    ui.panel.innerHTML =
      '<p><b>Optional:</b> paste an OpenAI API key for smarter command understanding. Everything already works without a key (built-in browser speech).</p>' +
      '<input type="password" placeholder="sk-… (stored only in this browser)"/>' +
      '<div class="ap-actions"><button class="ap-save">Save</button><button class="ap-clear">Remove</button></div>';
    var keyInput = ui.panel.querySelector('input');
    keyInput.value = localStorage.getItem(KEY_STORE) || '';
    ui.panel.querySelector('.ap-save').addEventListener('click', function () {
      var v = keyInput.value.trim();
      if (v) { localStorage.setItem(KEY_STORE, v); status('Key saved — AI understanding enabled.', 3200); }
      else status('Key removed — using built-in matching.', 3200);
      ui.panel.classList.remove('ap-show');
    });
    ui.panel.querySelector('.ap-clear').addEventListener('click', function () {
      localStorage.removeItem(KEY_STORE); keyInput.value = '';
      status('Key removed — using built-in matching.', 3200);
    });

    root.appendChild(ui.status);
    root.appendChild(ui.inputWrap);
    root.appendChild(ui.panel);
    root.appendChild(row);
    document.body.appendChild(root);
  }

  // ---------- data ----------
  function loadData() {
    return fetch(DATA_URL).then(function (r) {
      if (!r.ok) throw new Error('presenter-data ' + r.status);
      return r.json();
    }).then(function (data) {
      slides = data.slides || [];
      byId = {};
      order = [];
      slides.forEach(function (s) {
        if (s.id) byId[s.id] = s;
        if (!s.blank) order.push(s);
      });
      dataReady = true;
      syncFromHash();
    });
  }

  function syncFromHash() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (id && byId[id]) currentId = id;
    else if (!currentId && order.length) currentId = order[0].id;
  }

  // ---------- navigation ----------
  function navigateTo(id, label) {
    var slide = byId[id];
    if (!slide) return false;
    var tries = 0;
    var attempt = function () {
      tries++;
      window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { slideId: id, reason: 'voice' } }));
      setTimeout(function () {
        var ok = (window.location.hash || '').replace(/^#/, '') === id;
        if (ok) { currentId = id; return; }
        if (tries < 8) attempt();
      }, 350);
    };
    attempt();
    status('Going to <b>' + (label || id) + '</b>…', 2600);
    return true;
  }

  function neighbor(step) {
    var idx = -1;
    for (var i = 0; i < order.length; i++) if (order[i].id === currentId) { idx = i; break; }
    if (idx < 0) return order.length ? order[step > 0 ? 0 : order.length - 1] : null;
    var next = order[Math.min(order.length - 1, Math.max(0, idx + step))];
    return next || null;
  }
  // ---------- matching ----------
  var STOP = { a: 1, an: 1, the: 1, to: 1, me: 1, my: 1, of: 1, and: 1, for: 1, i: 1, is: 1, it: 1, this: 1, that: 1, please: 1, slide: 1, deck: 1, go: 1, show: 1, open: 1, jump: 1, take: 1, switch: 1, can: 1, you: 1 };
  function tokens(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(function (w) { return w && !STOP[w]; });
  }
  function bestMatch(query) {
    var q = tokens(query);
    if (!q.length) return null;
    var best = null, bestScore = 0;
    order.forEach(function (s) {
      var title = String(s.title || '').toLowerCase();
      var intro = String(s.intro || '').toLowerCase();
      var kw = ' ' + (s.keywords || []).join(' ').toLowerCase() + ' ';
      var idl = String(s.id || '').toLowerCase();
      var score = 0;
      q.forEach(function (w) {
        if (title.indexOf(w) >= 0) score += 5;
        if (intro.indexOf(w) >= 0) score += 4;
        if (kw.indexOf(' ' + w + ' ') >= 0) score += 3;
        if (idl.indexOf(w) >= 0) score += 2;
      });
      var phrase = q.join(' ');
      if (phrase.length > 3 && (title.indexOf(phrase) >= 0 || intro.indexOf(phrase) >= 0)) score += 6;
      if (score > bestScore) { bestScore = score; best = s; }
    });
    return bestScore >= 4 ? best : null;
  }

  // ---------- narration ----------
  function pickVoice() {
    var vs = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < vs.length; i++) if (/en(-|_)?(GB|US|IN)/i.test(vs[i].lang)) return vs[i];
    for (var j = 0; j < vs.length; j++) if (/^en/i.test(vs[j].lang)) return vs[j];
    return null;
  }
  function speak(text, onend) {
    if (!('speechSynthesis' in window)) { if (onend) onend(); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1; u.pitch = 1;
    if (onend) u.onend = onend;
    window.speechSynthesis.speak(u);
  }
  function narrateCurrent(then) {
    var s = byId[currentId];
    if (!s) return;
    if (!s.narration) {
      status('This slide is visual — no narration script for it.', 3200);
      if (then) then();
      return;
    }
    status('Reading <b>' + (s.title || s.id) + '</b>…', 0);
    speak(s.narration, function () {
      status('Done reading.', 1800);
      if (then) then();
    });
  }

  // ---------- tour ----------
  function startTour() {
    stopSpeaking();
    var startIdx = 0;
    for (var i = 0; i < order.length; i++) if (order[i].id === currentId) { startIdx = i; break; }
    tour = { idx: startIdx };
    status('Presenting — say “stop” anytime.', 0);
    tourStep();
  }
  function tourStep() {
    if (!tour) return;
    if (tour.idx >= order.length) { tour = null; status('Tour finished.', 3000); return; }
    var s = order[tour.idx];
    navigateTo(s.id, s.title || s.id);
    tourTimer = setTimeout(function () {
      if (!tour) return;
      if (!s.narration) {
        // visual-only slide: dwell briefly, then continue
        tour.idx++;
        tourTimer = setTimeout(tourStep, 1600);
        return;
      }
      speak(s.narration, function () {
        if (!tour) return;
        tour.idx++;
        tourTimer = setTimeout(tourStep, 700);
      });
    }, 900);
  }
  function stopSpeaking() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; }
    tour = null;
  }
  // ---------- commands ----------
  function handleCommand(raw) {
    var text = String(raw || '').trim();
    if (!text) return;
    status('Heard: <span class="ap-heard">“' + text.replace(/</g, '&lt;') + '”</span>', 0);

    var key = localStorage.getItem(KEY_STORE);
    var resolve = key
      ? aiParse(text, key).then(null, function () { return localParse(text); })
      : Promise.resolve(localParse(text));

    Promise.resolve(resolve).then(function (cmd) {
      if (!cmd) { status('I didn\u2019t catch a slide for that. Try “go to proof” or “next”.', 4200); return; }
      if (cmd.action === 'navigate' && cmd.slide) {
        var s = byId[cmd.slide] || bestMatch(cmd.slide);
        if (s) { stopSpeaking(); navigateTo(s.id, s.title || s.id); }
        else status('No slide matches “' + cmd.slide + '”.', 3600);
      } else if (cmd.action === 'next') {
        stopSpeaking(); var n = neighbor(1); if (n) navigateTo(n.id, n.title || n.id);
      } else if (cmd.action === 'previous') {
        stopSpeaking(); var p = neighbor(-1); if (p) navigateTo(p.id, p.title || p.id);
      } else if (cmd.action === 'read') {
        narrateCurrent();
      } else if (cmd.action === 'tour') {
        startTour();
      } else if (cmd.action === 'stop') {
        stopSpeaking(); status('Stopped.', 2000);
      } else if (cmd.action === 'reply' && cmd.reply) {
        status(cmd.reply, 3600);
      }
    });
  }

  function localParse(text) {
    var t = String(text || '').toLowerCase().replace(/[!,.?]/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^(stop|quiet|cancel|shut up|silence)\b/.test(t)) return { action: 'stop' };
    if (/\b(present|tour|present everything|start the tour|walk me through)\b/.test(t)) return { action: 'tour' };
    if (/\b(read|narrate|tell me about|say)\b/.test(t) && !/\bgo to\b/.test(t)) return { action: 'read' };
    if (/^(next|forward|continue|onwards)\b|\bnext slide\b/.test(t)) return { action: 'next' };
    if (/^(previous|back|go back|last slide)\b/.test(t)) return { action: 'previous' };
    var m = t.match(/\b(?:go to|jump to|take me to|switch to|open|show(?: me)?|find)\s+(?:the\s+)?(.+)$/);
    var q = m ? m[1] : text;
    q = q.replace(/\bslide\b/g, '').replace(/\bplease\b/g, '').trim();
    var hit = bestMatch(q);
    if (hit) return { action: 'navigate', slide: hit.id };
    var hit2 = bestMatch(t);
    if (hit2) return { action: 'navigate', slide: hit2.id };
    return null;
  }

  function aiParse(text, key) {
    var list = order.map(function (s) { return s.id + ' — ' + String(s.title || '').replace(/\n/g, ' '); }).join('\n');
    var sys = 'You translate voice commands for a slide deck into JSON. Respond with JSON only: {"action":"navigate|next|previous|read|tour|stop|reply","slide":"<slide id from the list>","reply":"<short reply when action=reply>"}. Slide ids:\n' + list;
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0, max_tokens: 120,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: text }]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('openai ' + r.status);
      return r.json();
    }).then(function (j) { return JSON.parse(j.choices[0].message.content); });
  }
  // ---------- speech recognition ----------
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  function toggleListening() {
    if (listening) stopListening();
    else startListening();
  }
  function startListening() {
    if (!SR) {
      status('Voice input needs Chrome or Edge. Type your command below instead.', 5000);
      ui.inputWrap.classList.add('ap-show');
      ui.text.focus();
      return;
    }
    stopSpeaking();
    try {
      recognition = new SR();
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = function (e) {
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            var t = e.results[i][0].transcript;
            handleCommand(t);
          }
        }
      };
      recognition.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          listening = false; recognitionWanted = false; ui.fab.classList.remove('ap-on');
          status('Microphone blocked. Type your command below instead.', 0);
          ui.inputWrap.classList.add('ap-show');
          ui.text.focus();
        } else if (e.error === 'no-speech') {
          status('Listening… (say “go to pricing”)', 0);
        }
      };
      recognition.onend = function () {
        if (recognitionWanted) { try { recognition.start(); } catch (e) {} }
      };
      recognitionWanted = true;
      listening = true;
      ui.fab.classList.add('ap-on');
      recognition.start();
      status('Listening… try “go to my ask”, “next”, or “present everything”.', 0);
    } catch (e) {
      status('Could not start the microphone (' + String((e && e.message) || e) + '). Type your command instead.', 6000);
      ui.inputWrap.classList.add('ap-show');
    }
  }
  function stopListening() {
    recognitionWanted = false;
    listening = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    ui.fab.classList.remove('ap-on');
    status('Presenter paused. Click the mic to resume.', 3000);
  }

  // ---------- boot ----------
  function init() {
    if (window.location.pathname !== '/') return;
    buildUI();
    loadData().then(function () {
      if (SR) status('AI Presenter ready — click the mic.', 4000);
      else status('AI Presenter ready — type commands with ⌨.', 4000);
    }).catch(function () {
      if (ui.root) ui.root.remove();
    });
    window.addEventListener('hashchange', syncFromHash);

    // The original "AI Presenter" button talks to a backend (/api/voice) that a
    // static mirror doesn't have — route it into this presenter instead.
    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('button[aria-label="Start AI Presenter"]') : null;
      if (b) { e.preventDefault(); e.stopPropagation(); toggleListening(); }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 700); });
  } else {
    setTimeout(init, 700);
  }

  // test/automation hook
  window.__presenter = {
    handleCommand: handleCommand,
    navigateTo: navigateTo,
    narrateCurrent: narrateCurrent,
    startTour: startTour,
    stop: stopSpeaking,
    toggle: toggleListening,
    state: function () { return { currentId: currentId, ready: dataReady, listening: listening, slides: order.length }; }
  };
})();




