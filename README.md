# ianjamesormo.com

Author site for Ian James Ormo. Static HTML + inline React (via CDN). No build step.

## Pages

- `index.html` — home
- `about.html` — story, stats, timeline
- `books.html` — book list
- `book-you-are-not-finished.html` — book detail
- `daily.html` — devotionals
- `essays.html` — essays
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
