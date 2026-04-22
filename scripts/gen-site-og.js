#!/usr/bin/env node
// Generate the homepage social-share image (og/default-site.png).
// Run: node scripts/gen-site-og.js
// Requires puppeteer-core (already installed) and system Chrome.

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Arc.app/Contents/MacOS/Arc',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];

const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@900&family=Inter:wght@500;700&family=Fraunces:ital,wght@1,400&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background:#0b0b0b; }
  body { width:1200px; height:630px; overflow:hidden; font-family: Inter, sans-serif; color:#FAF7F2; }
  .card {
    width:1200px; height:630px;
    background: #111111;
    position: relative;
    padding: 72px 80px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  /* Warm copper glow top-left */
  .card::before {
    content:''; position:absolute; top:-120px; left:-120px;
    width:700px; height:700px;
    background: radial-gradient(circle at center, rgba(210,90,25,.40) 0%, rgba(184,71,28,.15) 35%, transparent 70%);
    pointer-events:none;
  }
  /* Oversized IJ watermark bottom-right */
  .card::after {
    content:'IJ'; position:absolute; right: -60px; bottom: -200px;
    font-family: Archivo, sans-serif; font-weight:900; font-size: 720px;
    color: #B8471C; opacity: .10; line-height: 1; letter-spacing: -.06em;
    pointer-events: none;
  }
  .kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px; color:#B8471C;
    letter-spacing: .35em; text-transform: uppercase;
    z-index: 2; position: relative;
  }
  .middle { z-index: 2; position: relative; }
  .headline {
    font-family: Archivo, sans-serif;
    font-weight: 900; font-size: 108px;
    letter-spacing: -0.048em;
    text-transform: uppercase;
    line-height: .92;
    max-width: 980px;
    margin: 0 0 28px;
  }
  .headline .copper { color:#B8471C; }
  .tagline {
    font-family: Fraunces, Georgia, serif;
    font-style: italic; font-weight: 400;
    font-size: 26px; line-height: 1.35;
    color: rgba(250,247,242,.82);
    max-width: 780px;
    margin: 0;
  }
  .bottom {
    display: flex; justify-content: space-between; align-items: flex-end;
    z-index: 2; position: relative;
  }
  .name { font-family: Archivo, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: -.02em; text-transform: uppercase; }
  .url  { font-family: 'JetBrains Mono', monospace; font-size: 15px; color:#B8471C; letter-spacing: .25em; text-transform: uppercase; text-align: right; }
</style>
</head>
<body>
  <div class="card">
    <div class="kicker">[ Ian James Ormo · ianjamesormo.com ]</div>
    <div class="middle">
      <h1 class="headline">Writer of the<br/><span class="copper">unglamorous middle.</span></h1>
      <p class="tagline">Memoir, daily devotionals, and musings on faith, work, and the long way home.</p>
    </div>
    <div class="bottom">
      <div class="name">Ian James Ormo</div>
      <div class="url">Freelance Writer · Homeschool Father</div>
    </div>
  </div>
</body>
</html>`;

async function main() {
  const chrome = CHROME_PATHS.find(p => fs.existsSync(p));
  if (!chrome) throw new Error('No Chrome/Brave/Chromium found — edit CHROME_PATHS in scripts/gen-site-og.js.');

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 450));

  const outPath = path.join(__dirname, '..', 'og', 'default-site.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('wrote', outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
