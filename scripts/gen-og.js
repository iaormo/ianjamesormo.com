// Generate OG images for every essay and devotional.
// Usage: node scripts/gen-og.js
// Requires: puppeteer-core (system Chrome on macOS).

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Arc.app/Contents/MacOS/Arc',
];

const essays = [
  { num:'014', date:'Apr 19 · 2026', tag:'Presence',  title:'The room you are already in.',      quote:'The room has been there. You just haven\u2019t been in it.' },
  { num:'013', date:'Apr 15 · 2026', tag:'Grace',     title:'A letter to the man rebuilding.',   quote:'Nobody hands you credit for the work you did before anyone was watching. But it still happened.' },
  { num:'012', date:'Apr 08 · 2026', tag:'Work',      title:'Worth and the paycheck ceiling.',   quote:'Your value was never the number. But your nervous system never got that memo.' },
  { num:'011', date:'Apr 05 · 2026', tag:'Body',      title:'The body as witness.',              quote:'My body knew before I did. It was keeping a record I did not know how to read.' },
  { num:'010', date:'Mar 29 · 2026', tag:'Faith',     title:'Faithfulness is not resilience.',   quote:'Resilience is for people who expect the fall. Faithfulness is for people who stay anyway.' },
  { num:'009', date:'Mar 22 · 2026', tag:'Marriage',  title:'On wives who stay.',                quote:'She was not waiting for me to become someone worth staying for. She had already decided.' },
  { num:'008', date:'Mar 15 · 2026', tag:'Grace',     title:'Cost as proof.',                    quote:'If it costs nothing, I do not know what to do with it.' },
  { num:'007', date:'Mar 08 · 2026', tag:'Memoir',    title:'The man you were in the kitchen.',  quote:'Nothing important was happening. That was exactly what made it matter.' },
];

const daily = [
  { num:'047', date:'April 21, 2026', tag:'Proverbs 4:23',     title:'The quiet rebuild',      quote:'Grace does not wait for your readiness. It arrives before you have cleaned up.' },
  { num:'046', date:'April 20, 2026', tag:'Romans 5:8',        title:'Grace before readiness', quote:'God did not wait until you had your life together. He moved while you were still making the mess.' },
  { num:'045', date:'April 19, 2026', tag:'Psalm 139:14',      title:'What the body carried',  quote:'The body remembered what the mind could not yet narrate.' },
  { num:'044', date:'April 18, 2026', tag:'Galatians 6:9',     title:'Faithfulness, not resilience', quote:'Do not grow weary. The harvest comes to the ones who did not leave.' },
  { num:'043', date:'April 17, 2026', tag:'1 Peter 3:7',       title:'Dwell with knowledge',   quote:'To dwell is to be present inside the room, not adjacent to it.' },
  { num:'042', date:'April 16, 2026', tag:'John 15:13',        title:'Cost as evidence',       quote:'The cross is the shape of love because the cross is the shape of maximum cost.' },
  { num:'041', date:'April 15, 2026', tag:'Proverbs 23:7',     title:'The paycheck number',    quote:'As a man thinks in his heart, so is he. The number was in his heart.' },
  { num:'040', date:'April 14, 2026', tag:'Lamentations 3:22', title:'New every morning',      quote:'Every morning is a new landing. His mercies are new, and so are you.' },
];

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
