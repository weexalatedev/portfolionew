// Captures WeExalate's live properties (agency site + deployed products) as deck imagery.
const { chromium } = require('/workspace/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const OUT = '/workspace/site/img/weexalate';
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { name: 'weexalate-home', url: 'https://weexalate.com', full: false },
  { name: 'weexalate-full', url: 'https://weexalate.com', full: true },
  { name: 'eneros', url: 'https://bill-neon-two.vercel.app', full: false },
  { name: 'window-pms', url: 'https://erp-window-blue.vercel.app', full: false },
  { name: 'image-extractor', url: 'https://image-downloader-three.vercel.app', full: false },
  { name: 'propdesk-crm', url: 'https://realestate-crm-flax.vercel.app', full: false },
  { name: 'product-catalog', url: 'https://product-catalog-five-psi.vercel.app', full: false },
];

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  for (const shot of SHOTS) {
    try {
      await page.goto(shot.url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(3500); // let animations/fonts settle
      if (shot.full) {
        await page.screenshot({ path: path.join(OUT, shot.name + '.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
      } else {
        await page.screenshot({ path: path.join(OUT, shot.name + '.jpg'), type: 'jpeg', quality: 88 });
      }
      const bytes = fs.statSync(path.join(OUT, shot.name + '.jpg')).size;
      console.log('OK', shot.name, (bytes / 1024).toFixed(0) + 'KB');
    } catch (e) {
      console.log('FAIL', shot.name, String(e).slice(0, 120));
    }
  }
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
