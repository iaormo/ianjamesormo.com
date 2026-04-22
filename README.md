# ianjamesormo.com

Author site for Ian James Ormo. Static HTML + inline React (via CDN). No build step.

## Pages

- `index.html` — home
- `about.html` — story, stats, timeline
- `books.html` — book list
- `book-you-are-not-finished.html` — book detail
- `daily.html` — devotionals
- `musings.html` — essays
- `newsletter.html` — subscribe
- `contact.html` — contact form
- `404.html` — not found

## Local dev

```sh
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

Pushed to Railway via `railway up`. Serves statically with `serve` on `$PORT`.

## SEO

- `sitemap.xml`, `robots.txt` at root
- OG + Twitter + canonical meta on every page
- JSON-LD `Person` + `WebSite` schemas on homepage

## Social share images

Every essay and devotional has a dedicated 1200×630 PNG share card under `/og/`
and a matching redirect page under `/share/`. When someone shares `https://ianjamesormo-com-production.up.railway.app/share/essay-014.html`, social scrapers read the per-piece
`og:image` tag; clicking the link bounces them to `musings.html#014`.

**Adding a new entry:**

1. Add the essay to the `essays` array in `musings.html` (or the devotional to
   `devotionals` in `daily.html`) as usual.
2. Add a matching object to the `essays` or `daily` array in
   `scripts/gen-og.js`.
3. With the local dev server running (`npm run dev`), regenerate:
   ```sh
   node scripts/gen-og.js
   ```
   This writes `og/essay-{num}.png` + `share/essay-{num}.html` (same for daily).
4. Commit the new PNG + share HTML files alongside the essay/devotional.

**Fallback behavior:** If a per-piece PNG is missing, the page-level `og:image`
on `musings.html` (`/og/default-essays.png`) or `daily.html`
(`/og/default-daily.png`) is still served for any share link pointing at those
pages directly.
