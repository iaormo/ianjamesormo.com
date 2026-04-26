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

// 1200x1200 square — universally compatible (FB, LinkedIn, X, WhatsApp,
// iMessage, Instagram) and renders cleanly at any crop ratio.
const SIZE = 1200;

// Mirrors the live homepage hero (index.html → <Hero/>): same dark ink
// background, oversized "IJ" watermark, "You / are not / finished." headline
// with the last word in copper, and the memoir tagline. Anyone seeing this
// share preview should recognize the page they're about to land on.
const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@900&family=Inter:wght@500;700&family=Fraunces:ital,wght@1,400&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background:#0b0b0b; }
  body { width:${SIZE}px; height:${SIZE}px; overflow:hidden; font-family: Inter, sans-serif; color:#FAF7F2; }
  .card {
    width:${SIZE}px; height:${SIZE}px;
    background: #111111;
    position: relative;
    padding: 88px 96px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
  /* Oversized "IJ" watermark — matches the homepage hero exactly */
  .watermark {
    position: absolute;
    top: -60px; right: -80px;
    font-family: Archivo, sans-serif;
    font-weight: 900; font-size: 880px;
    color: #B8471C; opacity: .09;
    line-height: .8; letter-spacing: -.06em;
    pointer-events: none; user-select: none;
  }
  .kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px; color:#B8471C;
    letter-spacing: .35em; text-transform: uppercase;
    z-index: 2; position: relative;
  }
  .middle { z-index: 2; position: relative; }
  .headline {
    font-family: Archivo, sans-serif;
    font-weight: 900; font-size: 200px;
    letter-spacing: -0.05em;
    text-transform: uppercase;
    line-height: .85;
    margin: 0 0 48px;
  }
  .headline .copper { color:#B8471C; }
  .tagline {
    font-family: Fraunces, Georgia, serif;
    font-style: italic; font-weight: 400;
    font-size: 32px; line-height: 1.4;
    color: rgba(250,247,242,.9);
    max-width: 880px;
    margin: 0;
  }
  .bottom {
    display: flex; justify-content: space-between; align-items: flex-end;
    z-index: 2; position: relative;
  }
  .name { font-family: Archivo, sans-serif; font-size: 30px; font-weight: 900; letter-spacing: -.02em; text-transform: uppercase; }
  .url  { font-family: 'JetBrains Mono', monospace; font-size: 18px; color:#B8471C; letter-spacing: .25em; text-transform: uppercase; text-align: right; }
  .pill {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; color:#B8471C;
    letter-spacing: .25em; text-transform: uppercase;
    border: 1px solid rgba(184,71,28,.55);
    padding: 8px 14px;
    margin-bottom: 28px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="watermark">IJ</div>
    <div class="kicker">[ Ian James Ormo · ianjamesormo.com ]</div>
    <div class="middle">
      <div class="pill">[ Memoir · Coming soon ]</div>
      <h1 class="headline">You<br/>are not<br/><span class="copper">finished.</span></h1>
      <p class="tagline">A memoir about the unglamorous daily work of being rebuilt. By grace you didn&rsquo;t earn, a wife who stayed, and a God who keeps no receipts.</p>
    </div>
    <div class="bottom">
      <div class="name">Ian James Ormo</div>
      <div class="url">Pre-order · Read the opening</div>
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
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 2 });
  await page.setContent(HTML, { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Wait up to 8s for webfonts to load — Google Fonts CDN can stall.
  await Promise.race([
    page.evaluateHandle('document.fonts.ready'),
    new Promise(r => setTimeout(r, 8000)),
  ]);
  await new Promise(r => setTimeout(r, 600));

  const outPath = path.join(__dirname, '..', 'og', 'default-site.png');
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('wrote', outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
