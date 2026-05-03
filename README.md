# ianjamesormo.com

Author site for Ian James Ormo. Static HTML + inline React (via CDN, JSX
compiled in-browser by Babel standalone). Backed by a small Node http server
(`server.js`, no framework) for content APIs and form proxying. No build step.

## Pages

- `index.html` — home (homepage hero + today's devotional + latest musings)
- `about.html` — story, stats, timeline
- `books.html` — book list
- `book-you-are-not-finished.html`, `book-you-are-not-your-paycheck.html` — book detail pages
- `daily.html` — devotionals
- `musings.html` — essays
- `travels.html` — slow-travel notebook
- `newsletter.html` — subscribe
- `contact.html` — contact form
- `welcome-*.html`, `ghl-welcome-*.html` — post-signup landings (used as GHL paste targets)
- `404.html` — not found

## Local dev

```sh
npm install
npm start          # node server.js → http://localhost:3000
```

The server reads `content/{daily,essays}.json` once at startup, so restart
after editing JSON locally if you want the API to reflect the change.

## Deploy

Pushed to Railway from `main`. Railway runs `npm start` (which is
`node server.js`). The server serves static files from the repo root and
exposes the APIs below.

## APIs

| Method | Path                          | Purpose                                         |
| ------ | ----------------------------- | ----------------------------------------------- |
| GET    | `/api/content/daily`          | List of devotionals visible today (date ≤ now). |
| GET    | `/api/content/musings`        | All essays.                                     |
| GET    | `/api/verse?q=<ref>`          | ESV-API proxy (cached). Requires `ESV_API_KEY`. |
| POST   | `/api/content/daily`          | Add a daily entry. Requires `Authorization: Bearer $API_KEY`. Writes JSON + share/og redirect. |
| POST   | `/api/content/musing`         | Add a musing. Same auth. Writes JSON + share/og redirect. |
| POST   | `/api/subscribe`              | Newsletter / devotional signup → GHL upsert.    |
| POST   | `/api/contact-form`           | Contact form → GHL upsert + tag.                |

## SEO

- `sitemap.xml`, `robots.txt` at root
- OG + Twitter + canonical meta on every page
- JSON-LD `Person` + `WebSite` schemas on homepage

## Social share images

Every essay and devotional has a dedicated 1200×630 PNG share card under
`/og/` and a matching redirect page under `/share/`. When someone shares
`https://ianjamesormo.com/share/essay-014.html`, social scrapers read the
per-piece `og:image` tag; clicking the link bounces them to
`musings.html#014`.

**Adding a new entry:**

1. **Preferred (auto-generates share assets):** POST to `/api/content/daily`
   or `/api/content/musing` with the `Authorization: Bearer $API_KEY` header.
   The server appends to the JSON, commits to GitHub if configured, and
   writes the matching `share/<kind>-<num>.html` redirect page.
2. **Manual JSON edit** (e.g. bulk import): edit `content/daily.json` or
   `content/essays.json` directly, then run:
   ```sh
   node scripts/gen-og.js   # requires Chrome + dev server on :3000
   ```
   `gen-og.js` reads from `content/{daily,essays}.json`, so anything in those
   files gets a PNG card + share page — no separate code change needed.
3. Commit the JSON change, the new PNGs (`og/<kind>-<num>.png`), and the
   share pages (`share/<kind>-<num>.html`).

**Fallback behavior:** If a per-piece PNG is missing, the page-level
`og:image` on `musings.html` (`/og/default-essays.png`) or `daily.html`
(`/og/default-daily.png`) is still served for any share link pointing at
those pages directly.

## Environment

Server reads from `.env` (gitignored). Variables:

- `PORT` — server port (Railway sets this).
- `API_KEY` — required for the POST content endpoints.
- `ESV_API_KEY` — for `/api/verse` (ESV Bible API).
- `GHL_LOCATION_ID`, `GHL_PIT_TOKEN`, `GHL_API_BASE` — GoHighLevel credentials
  used by the subscribe + contact-form endpoints.
- `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH` — optional; lets the server
  commit JSON edits back to the repo when content is added via the POST APIs.
