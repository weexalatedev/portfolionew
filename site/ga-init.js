// gtag bootstrap, loaded by components/Analytics.tsx. A file rather than an
// inline <Script> so the CSP needs no 'unsafe-inline' for it.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'G-ZDYE5LK3MR', {
  send_page_view: false,
  anonymize_ip: true,
  cookie_flags: 'SameSite=None;Secure'
});
gtag('event', 'page_view', {
  page_title: document.title,
  page_location: window.location.href
});

// AI Presenter (client-side, no API key): load on every page; the module
// self-activates only on the deck route (/).
(function () {
  var s = document.createElement('script');
  s.src = '/ai-presenter.js';
  s.defer = true;
  document.head.appendChild(s);
})();

// WeExalate branding: the mirror's SSR layer still carries the source site's
// identity. Fix the visible chrome after load, hide the reader-layer article
// list (its content is the SSR snapshot used only for hydration), and drop the
// third-party awards ribbon. NOTE: never touches <script>/<style> text nodes
// (the RSC flight payload lives there and must stay byte-intact).
(function () {
  var apply = function () {
    var ribbons = document.querySelectorAll('#awwwards');
    for (var i = 0; i < ribbons.length; i++) ribbons[i].remove();

    // Flight-payload metadata resets these after hydration — re-assert them.
    document.title = 'WeExalate Dev Solutions | Web + SEO Agency, Valsad';
    var setMeta = function (sel, attr, value) {
      var m = document.querySelector(sel);
      if (m) m.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', 'WeExalate Dev Solutions — web design, development and SEO agency in Valsad, India. Custom software, web apps and websites that actually work. 85+ projects since 2019.');
    setMeta('meta[property="og:title"]', 'content', 'WeExalate Dev Solutions | Web + SEO Agency, Valsad');
    setMeta('meta[property="og:image"]', 'content', 'https://weexalate.com/img/weexalate/weexalate-home.jpg');
    setMeta('meta[name="twitter:title"]', 'content', 'WeExalate Dev Solutions | Web + SEO Agency, Valsad');

    if (!document.getElementById('weex-brand-style')) {
      var style = document.createElement('style');
      style.id = 'weex-brand-style';
      style.textContent = 'article[aria-label^="Slide"]{display:none!important}';
      document.head.appendChild(style);
    }

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return n.nodeValue.indexOf('Tashfeen Ahmed') >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue.split('Tashfeen Ahmed').join('WeExalate Dev Solutions');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  setTimeout(apply, 1500);
  setTimeout(apply, 4000);
})();
