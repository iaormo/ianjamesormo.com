// Generate OG images for every essay and devotional.
// Usage: node scripts/gen-og.js
// Requires: puppeteer-core (system Chrome on macOS) AND a dev server running
// on http://localhost:3000 (npm start) so the renderer can load /og/card.html.

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Arc.app/Contents/MacOS/Arc',
];

// Source of truth: /content/{essays,daily}.json. Reading from there means new
// entries get share cards on the next run without a code change to this file.
// Map each entry into the {num, date, tag, title, quote} shape the renderer
// expects — for daily, we use the verse reference as the tag.
const ROOT = path.join(__dirname, '..');
const essaysJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'essays.json'), 'utf8'));
const dailyJson  = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'daily.json'),  'utf8'));

const essays = essaysJson.map(e => ({
  num:   e.num,
  date:  e.date,
  tag:   e.tag || 'Essay',
  title: e.title,
  quote: e.quote || '',
}));

const daily = dailyJson.map(d => ({
  num:   d.day,
  date:  d.date,
  tag:   d.verse || '',
  title: d.title,
  quote: d.quote || '',
}));

async function main() {
  const chrome = CHROME_PATHS.find(p => fs.existsSync(p));
  if (!chrome) throw new Error('No Chrome/Chromium found. Edit CHROME_PATHS in this script.');

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const outDir = path.join(__dirname, '..', 'og');
  fs.mkdirSync(outDir, { recursive: true });

  const shareDir = path.join(__dirname, '..', 'share');
  fs.mkdirSync(shareDir, { recursive: true });

  const SITE = 'https://ianjamesormo.com';

  function writeSharePage(type, item) {
    const img = `${SITE}/og/${type}-${item.num}.png`;
    const canonical = type === 'essay'
      ? `${SITE}/musings.html#${item.num}`
      : `${SITE}/daily.html#${item.num}`;
    const pageTitle = type === 'essay'
      ? `${item.title} — Ian James Ormo`
      : `Day ${item.num}: ${item.title} — Ian James Ormo`;
    const desc = item.quote;
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${pageTitle}</title>
<meta name="description" content="${desc.replace(/"/g,'&quot;')}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${canonical}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ian James Ormo" />
<meta property="og:title" content="${pageTitle.replace(/"/g,'&quot;')}" />
<meta property="og:description" content="${desc.replace(/"/g,'&quot;')}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${img}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle.replace(/"/g,'&quot;')}" />
<meta name="twitter:description" content="${desc.replace(/"/g,'&quot;')}" />
<meta name="twitter:image" content="${img}" />
<meta http-equiv="refresh" content="0; url=${canonical}" />
<style>body{margin:0;font-family:-apple-system,sans-serif;background:#FAF7F2;color:#111;padding:40px;}a{color:#B8471C}</style>
</head>
<body>
<p>Redirecting to <a href="${canonical}">${item.title}</a>…</p>
<script>location.replace(${JSON.stringify(canonical)});</script>
</body>
</html>
`;
    const outPath = path.join(shareDir, `${type}-${item.num}.html`);
    fs.writeFileSync(outPath, html);
    console.log('wrote', outPath);
  }

  async function render(type, item) {
    const q = new URLSearchParams({ type, num: item.num, date: item.date, title: item.title, quote: item.quote, tag: item.tag });
    const url = `http://localhost:3000/og/card.html?${q.toString()}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 250));
    const outPath = path.join(outDir, `${type}-${item.num}.png`);
    await page.screenshot({ path: outPath, omitBackground: false });
    console.log('wrote', outPath);
    writeSharePage(type, item);
  }

  async function renderDefault(name, title, quote, tag, type) {
    const q = new URLSearchParams({ type, num: '', date: '', title, quote, tag });
    const url = `http://localhost:3000/og/card.html?${q.toString()}`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 250));
    const outPath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: outPath, omitBackground: false });
    console.log('wrote', outPath);
  }

  for (const e of essays) await render('essay', e);
  for (const d of daily)  await render('daily', d);

  // Default fallbacks
  await renderDefault('default-essays', 'Longer than a post. Shorter than a book.', 'Writing on presence, faith, work, and the unglamorous middle.', 'Essays', 'essays');
  await renderDefault('default-daily',  'Three minutes. One question. Every morning.', 'Short, honest readings for people looking for something truer, slower, and harder to fake.', 'Daily', 'daily');
  await renderDefault('default-site',   'Writer of the unglamorous middle.', 'Memoir, devotionals, and essays on faith, work, and the long way home.', 'Ian James', 'essays');

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
