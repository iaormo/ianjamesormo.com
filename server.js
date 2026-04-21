const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_HTML = 'public, max-age=0, must-revalidate';

function sendFile(res, filePath, status) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const cache = ext === '.html' || ext === '.xml' || ext === '.txt' ? CACHE_HTML : CACHE_LONG;
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send404(res);
    res.writeHead(status || 200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function send404(res) {
  const p = path.join(ROOT, '404.html');
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

const TAG_MAP = {
  devotional: ['devotional'],
  newsletter: ['newsletter'],
  both:       ['devotional', 'newsletter'],
};

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(obj));
}

async function upsertToGHL({ first, last, email, source }) {
  const PIT = process.env.GHL_PIT;
  const LOC = process.env.GHL_LOCATION_ID;
  if (!PIT || !LOC) throw new Error('GHL_PIT / GHL_LOCATION_ID not set');
  const tags = TAG_MAP[source];
  if (!tags) throw new Error('invalid source');

  const r = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PIT}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      locationId: LOC,
      firstName: first,
      lastName:  last,
      email,
      tags,
      source: 'ianjamesormo.com',
    }),
  });

  const body = await r.text();
  if (!r.ok) {
    throw new Error(`GHL ${r.status}: ${body.slice(0, 500)}`);
  }
  try { return JSON.parse(body); } catch { return { ok: true }; }
}

function handleSubscribe(req, res) {
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 10 * 1024) req.destroy(); });
  req.on('end', async () => {
    try {
      const data = JSON.parse(raw || '{}');
      const first  = String(data.first  || '').trim().slice(0, 80);
      const last   = String(data.last   || '').trim().slice(0, 80);
      const email  = String(data.email  || '').trim().toLowerCase().slice(0, 160);
      const source = String(data.source || '').trim();
      if (!first || !last || !email || !TAG_MAP[source]) {
        return sendJson(res, 400, { ok: false, error: 'missing or invalid field' });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return sendJson(res, 400, { ok: false, error: 'invalid email' });
      }
      const result = await upsertToGHL({ first, last, email, source });
      sendJson(res, 200, { ok: true, id: result?.contact?.id || result?.id || null });
    } catch (err) {
      console.error('subscribe error:', err.message);
      sendJson(res, 502, { ok: false, error: 'upstream error' });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/subscribe') {
    return handleSubscribe(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); return res.end('Method not allowed');
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const resolved = path.normalize(path.join(ROOT, urlPath));
  if (!resolved.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.stat(resolved, (err, stat) => {
    if (!err && stat.isFile()) return sendFile(res, resolved);
    // Try appending .html (clean URLs: /about -> /about.html)
    const withHtml = resolved + '.html';
    fs.stat(withHtml, (err2, stat2) => {
      if (!err2 && stat2.isFile()) return sendFile(res, withHtml);
      send404(res);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ianjamesormo.com serving on 0.0.0.0:${PORT}`);
});
