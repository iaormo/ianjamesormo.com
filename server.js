const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Auto-load .env at startup (no dependencies) ──────────────────────────
(function loadDotEnv() {
  try {
    var envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    var content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(function (line) {
      var m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) return;
      var key = m[1];
      var val = m[2].replace(/^["'](.*)["']$/, '$1');
      if (!process.env[key]) process.env[key] = val;
    });
    console.log('[env] loaded .env');
  } catch (e) { /* ignore */ }
})();

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;

// ── Content store ─────────────────────────────────────────────────────────────
const CONTENT_DIR = path.join(__dirname, 'content');

function loadContent(file) {
  try { return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')); }
  catch { return []; }
}
function saveContent(file, data) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(path.join(CONTENT_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

let essays      = loadContent('essays.json');
let devotionals = loadContent('daily.json');

// GitHub commit — async, best-effort, persists content across Railway deploys
async function commitToGitHub(filename, data, message) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;
  const repo   = process.env.GITHUB_REPO   || 'iaormo/ianjamesormo.com';
  const branch = process.env.GITHUB_BRANCH || 'main';
  try {
    const filePath = `content/${filename}`;
    const apiBase  = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const headers  = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
    const getRes   = await fetch(`${apiBase}?ref=${branch}`, { headers });
    const current  = getRes.ok ? await getRes.json() : {};
    const content  = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');
    await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify({ message, content, sha: current.sha, branch }) });
  } catch (e) { console.error('GitHub commit failed (non-fatal):', e.message); }
}

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

// Every signup source maps to one or more GHL tags. 'devotional' implicitly
// includes 'newsletter' — anyone on the daily is on the weekly letter list too.
const TAG_MAP = {
  devotional: ['devotional', 'newsletter'],
  newsletter: ['newsletter'],
  both:       ['devotional', 'newsletter'],
  preorder_finished: ['preorder', 'preorder:you-are-not-finished'],
  preorder_paycheck: ['preorder', 'preorder:you-are-not-your-paycheck'],
  contact_form: ['contact-form'],
};

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(obj));
}

async function addTagsToGHLContact(contactId, tags) {
  const PIT = process.env.GHL_PIT;
  if (!PIT || !contactId || !tags || !tags.length) return null;
  const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PIT}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ tags }),
  });
  const text = await r.text();
  if (!r.ok) { console.error(`GHL add-tags ${r.status}: ${text.slice(0, 500)}`); return null; }
  try { return JSON.parse(text); } catch { return null; }
}

async function upsertToGHL({ first, last, email, source }) {
  const PIT = process.env.GHL_PIT;
  const LOC = process.env.GHL_LOCATION_ID;
  if (!PIT || !LOC) throw new Error('GHL_PIT / GHL_LOCATION_ID not set');
  const tags = TAG_MAP[source];
  if (!tags) throw new Error('invalid source');

  // Step 1: upsert without tags — GHL's upsert endpoint REPLACES tags
  // on existing contacts, which would clobber any tags applied from
  // previous signups. Use the dedicated add-tags endpoint below for
  // additive (merge-safe) tag behavior across sessions.
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
      source: 'ianjamesormo.com',
    }),
  });

  const body = await r.text();
  if (!r.ok) {
    throw new Error(`GHL upsert ${r.status}: ${body.slice(0, 500)}`);
  }
  let parsed = {};
  try { parsed = JSON.parse(body); } catch { parsed = { ok: true }; }

  // Step 2: add the source-specific tags additively.
  const contactId = parsed?.contact?.id || parsed?.id;
  if (contactId) {
    await addTagsToGHLContact(contactId, tags);
  }

  return parsed;
}

async function addNoteToGHLContact(contactId, body) {
  const PIT = process.env.GHL_PIT;
  if (!PIT || !contactId || !body) return null;
  const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PIT}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ body: String(body).slice(0, 5000) }),
  });
  const text = await r.text();
  if (!r.ok) { console.error(`GHL note ${r.status}: ${text.slice(0, 500)}`); return null; }
  try { return JSON.parse(text); } catch { return null; }
}

function handleContactForm(req, res) {
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 20 * 1024) req.destroy(); });
  req.on('end', async () => {
    try {
      const data    = JSON.parse(raw || '{}');
      const first   = String(data.first   || '').trim().slice(0, 80);
      const last    = String(data.last    || '').trim().slice(0, 80);
      const email   = String(data.email   || '').trim().toLowerCase().slice(0, 160);
      const reason  = String(data.reason  || '').trim().slice(0, 160);
      const message = String(data.message || '').trim().slice(0, 5000);
      if (!first || !email || !message) {
        return sendJson(res, 400, { ok: false, error: 'missing field' });
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return sendJson(res, 400, { ok: false, error: 'invalid email' });
      }
      const result = await upsertToGHL({ first, last: last || '—', email, source: 'contact_form' });
      const contactId = result?.contact?.id || result?.id;
      if (contactId) {
        const header = reason ? `[${reason}]` : '[Contact form]';
        await addNoteToGHLContact(contactId, `${header}\n\n${message}`);
      }
      sendJson(res, 200, { ok: true, id: contactId || null });
    } catch (err) {
      console.error('contact-form error:', err.message);
      sendJson(res, 502, { ok: false, error: 'upstream error' });
    }
  });
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

// ── Content API ───────────────────────────────────────────────────────────────

function requireApiKey(req, res) {
  const key = process.env.API_KEY;
  if (!key) { sendJson(res, 500, { ok: false, error: 'API_KEY not configured on server' }); return false; }
  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${key}`) { sendJson(res, 401, { ok: false, error: 'Unauthorized' }); return false; }
  return true;
}

function readBody(req, cb) {
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 200 * 1024) req.destroy(); });
  req.on('end', () => { try { cb(null, JSON.parse(raw || '{}')); } catch (e) { cb(e); } });
}

function handleGetMusings(req, res) {
  sendJson(res, 200, essays);
}

// Safeguard: compute which devotional should be "today" based on current date.
// Picks the entry whose parsed date matches today (server time), or failing that,
// the most recent entry whose date is <= today. Mutates `today` flags in-place.
function refreshTodayFlag() {
  if (!Array.isArray(devotionals) || devotionals.length === 0) return;
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const parsed = devotionals.map((d, i) => {
    const t = Date.parse(d.date);
    return { i, key: isNaN(t) ? '' : new Date(t).toISOString().slice(0, 10) };
  });
  let chosen = parsed.find(p => p.key === todayKey);
  if (!chosen) {
    chosen = parsed
      .filter(p => p.key && p.key <= todayKey)
      .sort((a, b) => (a.key < b.key ? 1 : -1))[0];
  }
  const chosenIdx = chosen ? chosen.i : 0;
  devotionals.forEach((d, i) => { d.today = (i === chosenIdx); });
}

function handleGetDaily(req, res) {
  refreshTodayFlag();
  sendJson(res, 200, devotionals);
}

// ESV Bible API proxy — keeps the API key server-side. Usage: /api/verse?q=John+1:1
const verseCache = new Map(); // in-memory LRU-ish cache
function handleGetVerse(req, res) {
  const qMatch = req.url.match(/[?&]q=([^&]+)/);
  if (!qMatch) { sendJson(res, 400, { ok: false, error: 'Missing q' }); return; }
  const q = decodeURIComponent(qMatch[1]).trim();
  if (!q || q.length > 120) { sendJson(res, 400, { ok: false, error: 'Invalid q' }); return; }
  if (verseCache.has(q)) { sendJson(res, 200, verseCache.get(q)); return; }

  const key = process.env.ESV_API_KEY;
  if (!key) { sendJson(res, 500, { ok: false, error: 'ESV_API_KEY not configured' }); return; }

  const https = require('https');
  const params = new URLSearchParams({
    q,
    'include-headings': 'false',
    'include-footnotes': 'false',
    'include-verse-numbers': 'true',
    'include-short-copyright': 'true',
    'include-passage-references': 'true',
    'indent-paragraphs': '0',
    'include-first-verse-numbers': 'false',
  });
  const options = {
    hostname: 'api.esv.org',
    path: '/v3/passage/text/?' + params.toString(),
    headers: { 'Authorization': 'Token ' + key, 'User-Agent': 'ianjamesormo.com' },
  };
  https.get(options, (r) => {
    let raw = '';
    r.on('data', c => { raw += c; });
    r.on('end', () => {
      try {
        const data = JSON.parse(raw);
        const out = {
          ok: true,
          reference: data.canonical || q,
          passages: data.passages || [],
        };
        if (verseCache.size > 200) verseCache.clear();
        verseCache.set(q, out);
        sendJson(res, 200, out);
      } catch (e) {
        sendJson(res, 502, { ok: false, error: 'ESV API bad response' });
      }
    });
  }).on('error', () => {
    sendJson(res, 502, { ok: false, error: 'ESV API request failed' });
  });
}

// Write a /share/<kind>-<num>.html redirect page so social crawlers have a URL
// with proper OG tags to scrape. Falls back to default OG image if per-entry
// image isn't generated yet.
function writeShareRedirect({ kind, num, title, quote, landing }) {
  const SITE = 'https://ianjamesormo.com';
  const escAttr = s => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const imgFile = fs.existsSync(path.join(__dirname, 'og', `${kind}-${num}.png`))
    ? `${kind}-${num}.png`
    : (kind === 'daily' ? 'default-daily.png' : 'default-essays.png');
  const imgUrl = `${SITE}/og/${imgFile}`;
  const headLabel = kind === 'daily' ? `Day ${num}` : `No. ${num}`;
  const metaTitle = `${headLabel}: ${title} — Ian James Ormo`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escAttr(metaTitle)}</title>
<meta name="description" content="${escAttr(quote)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${landing}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ian James Ormo" />
<meta property="og:title" content="${escAttr(metaTitle)}" />
<meta property="og:description" content="${escAttr(quote)}" />
<meta property="og:url" content="${landing}" />
<meta property="og:image" content="${imgUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(metaTitle)}" />
<meta name="twitter:description" content="${escAttr(quote)}" />
<meta name="twitter:image" content="${imgUrl}" />
<meta http-equiv="refresh" content="0; url=${landing}" />
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#FAF7F2;color:#111;padding:40px;}a{color:#B8471C}</style>
</head>
<body>
<p>Redirecting to <a href="${landing}">${escAttr(title)}</a>…</p>
<script>location.replace(${JSON.stringify(landing)});</script>
</body>
</html>
`;
  const file = path.join(__dirname, 'share', `${kind}-${num}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  console.log(`[share] wrote ${file}`);
}

function handlePostMusing(req, res) {
  if (!requireApiKey(req, res)) return;
  readBody(req, (err, data) => {
    if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
    const { num, date, title, sub, time, tag, quote, body } = data;
    if (!num || !date || !title || !body) return sendJson(res, 400, { ok: false, error: 'Missing required fields: num, date, title, body' });
    // Remove any existing entry with same num, then prepend
    essays = [{ num, date, title, sub: sub || '', time: time || '5 min', tag: tag || 'General', quote: quote || '', body: Array.isArray(body) ? body : [body] },
              ...essays.filter(e => e.num !== num)];
    saveContent('essays.json', essays);
    commitToGitHub('essays.json', essays, `content: add musing No.${num} — ${title}`);
    writeShareRedirect({ kind: 'essay', num, title, quote: quote || '', landing: `https://ianjamesormo.com/musings.html#${num}` });
    console.log(`[content] musing added: No.${num} — ${title}`);
    sendJson(res, 200, { ok: true, num, title });
  });
}

function handlePostDaily(req, res) {
  if (!requireApiKey(req, res)) return;
  readBody(req, (err, data) => {
    if (err) return sendJson(res, 400, { ok: false, error: 'Invalid JSON' });
    const { day, date, title, verse, quote, body } = data;
    if (!day || !date || !title || !body) return sendJson(res, 400, { ok: false, error: 'Missing required fields: day, date, title, body' });
    // Mark all others as not today, prepend new one as today
    devotionals = [{ day, date, title, verse: verse || '', today: true, quote: quote || '', body },
                   ...devotionals.filter(d => d.day !== day).map(d => ({ ...d, today: false }))];
    saveContent('daily.json', devotionals);
    commitToGitHub('daily.json', devotionals, `content: add daily Day ${day} — ${title}`);
    writeShareRedirect({ kind: 'daily', num: day, title, quote: quote || '', landing: `https://ianjamesormo.com/daily.html#${day}` });
    console.log(`[content] daily added: Day ${day} — ${title}`);
    sendJson(res, 200, { ok: true, day, title });
  });
}

const server = http.createServer((req, res) => {
  // CORS for API routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET'  && req.url === '/api/content/musings') return handleGetMusings(req, res);
  if (req.method === 'GET'  && req.url === '/api/content/daily')   return handleGetDaily(req, res);
  if (req.method === 'GET'  && req.url.startsWith('/api/verse'))    return handleGetVerse(req, res);
  if (req.method === 'POST' && req.url === '/api/content/musing')  return handlePostMusing(req, res);
  if (req.method === 'POST' && req.url === '/api/content/daily')   return handlePostDaily(req, res);
  if (req.method === 'POST' && req.url === '/api/subscribe') {
    return handleSubscribe(req, res);
  }
  if (req.method === 'POST' && req.url === '/api/contact-form') {
    return handleContactForm(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); return res.end('Method not allowed');
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  // Legacy URL → new slug (preserves backlinks and share cards)
  if (urlPath === '/essays.html' || urlPath === '/essays') {
    const query = req.url.indexOf('?') >= 0 ? req.url.slice(req.url.indexOf('?')) : '';
    res.writeHead(301, { Location: '/musings.html' + query, 'Cache-Control': 'no-store' });
    return res.end();
  }

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
