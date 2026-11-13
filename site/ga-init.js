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
