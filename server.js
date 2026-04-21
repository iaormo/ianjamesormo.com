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

const server = http.createServer((req, res) => {
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
