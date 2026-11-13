#!/usr/bin/env node
/**
 * Static preview server for the mirrored tashfeen.me site.
 *
 * Serves ./site with:
 *  - clean URLs (/process -> process/index.html)
 *  - correct MIME types (webp, mp4, woff2, ...)
 *  - immutable caching for /_next/static/**
 *  - Next.js App Router client-navigation support: requests carrying the
 *    `RSC` header (or `?_rsc=`) are answered with the pre-fetched flight
 *    payload from ./site/_rsc/**  (Content-Type: text/x-component)
 *  - the same security headers the origin sends (CSP, etc.)
 *
 * Usage: node server.js [port]   (default 4173)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'site');
const PORT = Number(process.argv[2]) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.rsc': 'text/x-component; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const SECURITY_HEADERS = {
  'permissions-policy': 'camera=(), microphone=(self), geolocation=(), payment=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
};

function send(res, code, headers, streamPath) {
  const stat = fs.statSync(streamPath);
  res.writeHead(code, {
    ...headers,
    'Content-Length': stat.size,
    'Last-Modified': stat.mtime.toUTCString(),
  });
  fs.createReadStream(streamPath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);

    // ---- RSC (client-side navigation) support -----------------------------
    const wantsRsc = req.headers['rsc'] === '1' || url.searchParams.has('_rsc');
    if (wantsRsc) {
      const rscName = (pathname === '/' ? 'index' : pathname.replace(/^\/+/, '').replace(/\/+$/, '')).replace(/\//g, '_');
      const rscFile = path.join(ROOT, '_rsc', `${rscName}.rsc`);
      if (fs.existsSync(rscFile)) {
        return send(res, 200, {
          'Content-Type': MIME['.rsc'],
          'Cache-Control': 'private, no-store',
          ...SECURITY_HEADERS,
        }, rscFile);
      }
      // fall through to HTML; Next.js will hard-navigate as a fallback
    }

    // ---- normal static resolution -----------------------------------------
    if (pathname.endsWith('/')) pathname += 'index.html';
    let filePath = path.join(ROOT, pathname);
    if (!path.resolve(filePath).startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // clean URL fallback: /process -> process/index.html
      const withIndex = path.join(ROOT, pathname, 'index.html');
      if (fs.existsSync(withIndex)) filePath = withIndex;
      else if (fs.existsSync(filePath + '.html')) filePath += '.html';
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not found');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      ...SECURITY_HEADERS,
    };
    if (pathname.startsWith('/_next/static/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'public, s-maxage=31536000';
      headers['X-Nextjs-Cache'] = 'HIT';
      headers['X-Nextjs-Prerender'] = '1';
    }
    return send(res, 200, headers, filePath);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Mirror of tashfeen.me serving http://localhost:${PORT} from ${ROOT}`);
});
