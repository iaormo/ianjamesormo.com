# Ian James Ormo — Newsletter Template (Go High Level)

A companion guide to the welcome-email templates. Use this as the master reference for every email sent from Go High Level under the *Ian James Ormo* brand — welcome emails, weekly letters, devotional drops, and broadcasts.

Every email follows the same rule as the website: *does it serve the writing, or compete with it?*

## Three welcome templates — which to use when

| File | When it fires | What's different |
|---|---|---|
| `welcome-newsletter.html` | Someone signs up for the **weekly letter only** (tag `newsletter`, no `daily`/`devotional` tag) | Weekly-letter framing, archive grid for Daily + Musings, soft *"there's also a daily devotional"* invite panel, CTA to the site |
| `welcome-devotional.html` | Someone signs up for the **daily devotional only** (tag `daily` / `devotional`, no `newsletter` tag) | Morning-cadence framing, *"A few lines, most mornings"* body, CTA to today's devotional, soft *"there's also a weekly letter"* invite panel |
| `welcome-combined.html` | Someone signs up for **both** (tags `newsletter` + `daily`, usually from a single combined form) | *"You're all in"* framing, explains both rhythms, Daily + Musings entry points, no cross-promo panel (they already have both) |

**Segmentation logic in GHL:**
- Tag `newsletter` only → `welcome-newsletter.html`
- Tag `daily` (or `devotional`) only → `welcome-devotional.html`
- Both tags → `welcome-combined.html`
- If someone on one list later adds the other, do NOT resend any welcome — just let the next scheduled send land normally

**Recommended workflow in GHL:**
1. Create three separate automations, each keyed to its trigger tag combination.
2. Use a *Wait 1 minute* step at the top so tags from a multi-checkbox form settle before the branch fires.
3. Gate each automation with a *If/Else* on tag membership so only one welcome ever fires per contact.

**Cross-list opt-in (newsletter → daily):**
The `welcome-newsletter.html` template does NOT include a Daily Devotional entry point in the archive grid — newsletter-only subscribers should not be pushed straight to daily content before they opt in. Instead, the soft invite panel near the bottom has a link with tracked parameters:

```
https://ianjamesormo.com/daily.html?add=daily-devotional&utm_source=welcome-newsletter&utm_campaign=add-daily
```

Wire this up in GHL:
1. Create a workflow triggered by *Email Link Clicked* filtered on URL contains `add=daily-devotional`.
2. Action: *Add Tag → `daily`* and *Add to Daily Devotional campaign*.
3. Send a short confirmation email (or trigger a thank-you that matches `welcome-devotional.html` lite).
4. Optional: redirect `/daily.html?add=daily-devotional` to a landing page that confirms the subscription visually.

Same pattern for `welcome-devotional.html`'s weekly-letter invite — use a distinct `?add=weekly-letter` parameter.

All three templates share design tokens, typography, spacing, cinematic hero/footer, and the same sign-off (*With grace and grit,*). The sections below apply to all three unless otherwise noted.

---

## 1. How to install the template in Go High Level

1. Open GHL → **Marketing → Emails → Templates → + New Template**.
2. Choose **Blank → HTML Builder**.
3. Click the **`</>` Code** icon (top-right of the editor).
4. Delete everything in the editor. Paste the full contents of `ghl-welcome-email.html`.
5. Save as **"IJO — Welcome / Thank You"**.
6. Duplicate this template for each new send — never edit the master.

**Automation wiring (welcome):**
- Trigger: *Form Submitted* (Newsletter form) or *Contact Tag Added: `newsletter`*
- Action: *Send Email → Template → IJO — Welcome / Thank You*
- Delay: `0 min` (fire immediately)
- Do NOT wait for double opt-in unless legally required — this email IS the opt-in confirmation.

---

## 2. Merge tags used

| Placeholder in HTML | GHL merge tag | Notes |
|---|---|---|
| `{{contact.first_name}}` | Contact → First Name | Falls back to empty — always greet warmly if missing. Consider a default in GHL: *"friend"*. |
| `{{unsubscribe_url}}` | System → Unsubscribe Link | Required by CAN-SPAM / GDPR. Already wired twice. |
| `{{update_preferences_url}}` | System → Manage Preferences | Optional; remove if unused. |
| `{{location.full_address}}` | Location → Full Address | Physical address required by CAN-SPAM. Set once in GHL Location Settings. |

If a merge tag renders literally in test sends, the GHL location is missing that field — fix at the Location level, not in the template.

---

## 3. Design tokens (match the website exactly)

| Token | Hex | Where it appears in this template |
|---|---|---|
| `ink` | `#111111` | Body text, primary CTA background |
| `page` | `#FAF7F2` | Email canvas, text on dark sections |
| `copper` | `#B8471C` | Links, mono labels, the *one* accent — sparingly |
| `steel` | `#6B6B6B` | Captions, legal text, metadata |
| `mist` | `#E6E1D8` | Horizontal rules and cell borders (1px solid only) |
| `bone` | `#EFEAE0` | Alternate panel background (pull quote, archive grid) |
| `deep` | `#0A0A0A` | Hero section, footer |

**Never introduce a new color.** If a section feels like it needs one, rewrite the section.

---

## 4. Typography (email-safe stacks)

Google Fonts load in Apple Mail, iOS Mail, Gmail Web, and most modern clients. Outlook falls back to the system stack — that is by design.

| Role | Primary | Fallback stack |
|---|---|---|
| Headings / display | Archivo (900 / 700 / 600) | Arial, sans-serif |
| Body | Inter (400 / 500) | -apple-system, Segoe UI, Arial, sans-serif |
| Pull quote | Fraunces Italic (400 / 500) | Georgia, 'Times New Roman', serif |
| Label / mono | JetBrains Mono (400 / 500) | 'Courier New', monospace |

Mono labels and CTAs use `letter-spacing: 0.08em`–`0.12em` and `text-transform: uppercase`.
Display headings tighten to `letter-spacing: -0.01em`–`-0.02em`.

---

## 5. Section anatomy

The template is built from reusable blocks. To create a new email, keep the header + footer and mix these blocks in the middle.

### `HEADER` — wordmark + context label
Light canvas, 1px `mist` bottom border. Right-side mono label is optional.

### `HERO` (deep / cinematic)
- Base color: `#0A0A0A`, layered with:
  - Radial copper light leak, top-right (`rgba(184,71,28,0.55)` → transparent)
  - Warm amber leak, bottom-left (`rgba(255,170,90,0.22)` → transparent)
  - Center-transparent vignette → `rgba(0,0,0,0.62)` at edges
  - SVG `feTurbulence` fractalNoise grain tile (`~28%` luminance alpha) at `240px`
- 6px pure-black letterbox bars, top and bottom
- Film-strip frame ticker: `F.01 · 24 fps · REEL 01` / `• REC` in mono
- Sprocket hairline rows (tight-kerned `■` glyphs at 18% opacity)
- "Scene 01 / You're in" copper mono label
- Archivo 900, 78px (44px mobile), `-0.025em` tracking, line-height `0.94`
- Copper span glows via `text-shadow 0 0 30px rgba(184,71,28,0.35)`
- Short copper hairline (64×2px) beneath the headline
- Subhead in Inter, 18px, 90% opacity, max-width 460px
- Closing "CUT TO —" / "00:00:00" timecode row before the bottom letterbox

**Note on fallbacks.** Apple Mail, iOS Mail, and Gmail Web render all layers. Outlook desktop (Word engine) ignores multi-layer backgrounds and multiple `background-image` values — a VML `<v:rect>` fallback fills the hero with a subtle dark gradient, so the headline still lands on a dark surface.

### `PULL QUOTE` (bone / subtle grain)
- Bone background (`#EFEAE0`) with a light fractalNoise grain (~9% alpha, 200px tile) for paper-like texture
- Oversized copper Fraunces italic `"` glyph as an opening mark
- Fraunces Italic, 30px (22px mobile), tight `-0.01em` tracking
- 40×2px copper hairline separator
- Attribution in mono — one line, uppercase, tight letter-spacing
- One pull quote per email, maximum

### `BODY` (page)
- Mono label → section title (Archivo 900, 40px) → Inter paragraphs at 18px / 1.75
- Links always copper with a subtle underline
- Max 3–4 paragraphs before a break (quote, panel, or CTA)

### `ARCHIVE GRID` (bone, two-column)
- 1px `mist` border around the whole table, 1px between cells
- Collapses to stacked single column below 620px
- Use for "read these next" recommendations — 2 items, not 3

### `CTA` (single)
- One filled button per email. Two **maximum** on a page.
- Background `ink`, text `page`, letter-spaced Archivo
- Hover flips to `copper` (handled by `.ij-btn:hover` in the `<style>` block)

### `SIGN-OFF`
- Fraunces italic closer ("Grace and grit,")
- Archivo 900 name
- Mono location line (*Dauin, Philippines*)

### `FOOTER` (deep / cinematic)
- Layered backgrounds: deep base + copper light leak top-left, amber leak bottom-right, fractalNoise grain (~22% alpha, 220px tile)
- Opening sprocket hairline row (matches the hero)
- "END CREDITS" mono overline above the wordmark
- Tagline in copper mono: *Writer · Freelancer · Homeschooling father · Still building*
- Three link columns (Read / About / Elsewhere) — collapse to stacked on mobile
- Legal block with unsubscribe + address, separated by 1px divider at 12% opacity

---

## 6. Writing voice (for the copy blocks)

This is the part most templates get wrong.

**Do:**
- Write like you're talking to one person, from Dauin, after a long day.
- Keep sentences short. Break every 3rd paragraph.
- Use em-dashes generously. They are a feature, not a bug.
- Name the emotion before the lesson.
- Let silence do work. Not every paragraph needs a point.

**Don't:**
- No "Hi friend!" No exclamation marks. No emoji.
- No "Here are 5 things I learned this week."
- No promotional stacking. If the email has a product link, it earns its place by serving the reader first.
- No stock phrases: *game-changer, leveled up, unpack, deep dive, dropping value.*

**Subject lines** — lowercase, specific, curious, human. Length 30–55 characters.
Examples:
- `you're in.`
- `a quiet letter for a loud week`
- `the thing I almost didn't send`
- `three lines, then go`

**Preheader** — completes the subject line, never repeats it. 50–100 characters.

---

## 7. Spacing (8px rhythm)

Every padding and margin in the template is a multiple of 8. If you add a new section:

| Context | Padding |
|---|---|
| Section top/bottom (desktop) | `56–64px` |
| Section top/bottom (mobile) | `40–48px` |
| Horizontal (desktop) | `40px` |
| Horizontal (mobile) | `24px` |
| Inter-paragraph | `20–24px` |
| Label → heading | `24px` |
| Heading → body | `24–32px` |

Max container width: **600px**. Never exceed this — deliverability and readability both suffer beyond 640.

---

## 8. Image rules

- Always include `width`, `height`, and meaningful `alt`.
- Hosted on a CDN (GHL's native media library or Cloudflare).
- No decorative stock photography. Ever.
- If the email has a featured image, it sits below the hero and above the body, full-width, with a 1px `mist` bottom border.
- OG preview image for social sharing: 1200×630px.

---

## 9. Accessibility checklist

- [ ] Text contrast ≥ 4.5:1 (automatic with the token combos above)
- [ ] Links visually distinguished beyond color (underline or copper + border)
- [ ] All images have `alt` text (decorative → `alt=""`)
- [ ] Logical heading order: one `h1` (hero), then `h2` for sections
- [ ] Preheader text populated (hidden preview div at the top of body)
- [ ] Plain-text version auto-generated in GHL — review it before send

---

## 10. Pre-send checklist

Before every broadcast:

- [ ] Replace `{{contact.first_name}}` fallback in GHL if name data is sparse
- [ ] Preview on desktop, iPhone, and Gmail Web (GHL's *Send Test* → three addresses)
- [ ] Click every link — paste destination URLs into a browser manually
- [ ] Confirm `{{unsubscribe_url}}` and `{{location.full_address}}` render
- [ ] Read it aloud. If you wouldn't say it to a friend, rewrite it.
- [ ] Spam score: run through GHL's deliverability test or Mail-Tester — target 9/10+
- [ ] Schedule for Tuesday or Thursday, 7:00 AM recipient local time

---

## 11. Variants to build from this template

The welcome file is the canonical master. Save additional templates as:

| Template name | Use | What changes |
|---|---|---|
| `IJO — Welcome / Thank You` | New subscriber | Current master file |
| `IJO — Weekly Letter` | Regular send | Replace hero with musing title, body = musing, remove archive grid |
| `IJO — Daily Devotional` | Drip / daily | Shorten hero, Fraunces quote becomes the main body, single CTA to full devotional |
| `IJO — New Book / Launch` | Announcements | Hero swaps to book cover, CTA = "Read the first chapter" |
| `IJO — Broadcast (plain)` | Personal reply-style | Drop hero + footer columns, keep only header / body / sign-off / legal |

Each variant keeps the same tokens, typography, and spacing — only the content blocks change.

---

## 11b. Device & client optimization

All three templates share a responsive layer tuned for modern and legacy mail clients. The key optimizations:

**Responsive breakpoints (from the `<style>` block):**
- `@media (max-width: 1024px)` — container flexes to 100% with 600px max, so tablets never show horizontal scroll
- `@media (max-width: 620px)` — mobile pass:
  - Container goes edge-to-edge, inner padding drops to 20px
  - Hero headline scales 78px → 44px with tighter leading
  - Section headings scale 40px → 28px
  - Pull quote scales 30px → 22px
  - The two-column archive grid stacks to one column via `.ij-stack`
  - Footer link columns stack via `.ij-footer-col`
  - The primary CTA button goes full-width and centers (via `.ij-btn-mobile`), giving a ≥44px tap target per iOS HIG
- `@media (max-width: 380px)` — small phones (iPhone SE 1st gen, older Androids):
  - Container padding tightens to 16px
  - Hero headline drops to 36px
  - Section heading drops to 24px

**Client-specific fixes baked in:**
- `-webkit-text-size-adjust:100%` + `-ms-text-size-adjust:100%` — prevents iOS/WP auto-zoom
- `mso-table-lspace/rspace:0pt` — removes Outlook's mystery 1.5pt table gaps
- VML `<v:rect>` fallback inside `<!--[if mso]>` for the cinematic hero background (Outlook desktop uses Word rendering and strips multi-layer CSS backgrounds)
- `max-width:100%; height:auto` on all `img` — handles retina/2x and arbitrary image inserts
- `word-wrap:break-word` on body + links — long unbroken URLs or merge-tag expansions never overflow the container
- `[data-ogsc]` selector for Outlook.com dark-mode overrides
- `@media (prefers-color-scheme: dark)` forces the light design back to light-mode colors — Apple Mail and Outlook.com both respect this
- `@media (prefers-reduced-motion: reduce)` disables link/button transitions for accessibility

**What still can't be optimized:**
- Outlook desktop 2007–2019 Windows (Word engine) — ignores radial gradients, SVG backgrounds, and multi-layer `background-image`. Falls back to the solid deep `#0A0A0A` + VML gradient. The hero headline and type still render correctly; the cinematic overlay is reserved for modern clients.
- Yahoo Mail and AOL — partial support for radial gradients and SVG data URIs. They render the base color plus one gradient layer; grain is dropped silently.
- GHL's test-send sometimes injects its own `<style>` block above yours. After pasting, save, then re-open the template and *Send Test* from GHL — not from the HTML preview — to see the real rendering.

**Tap-target & accessibility:**
- All CTAs have ≥44×44px touch area (16px vertical + 32px horizontal padding + text)
- Minimum body font size is 15px (archive card body) — never below iOS's comfortable-reading threshold
- All interactive links use color + underline, not color alone (passes WCAG 1.4.1)
- Contrast ratios pass 4.5:1 on all body text, 3:1 on large display text (already enforced by the design tokens)

**Testing order:**
1. Apple Mail on macOS (native render — best baseline)
2. Gmail web in Chrome
3. Gmail iOS/Android app
4. Outlook for Mac
5. Outlook.com in a browser
6. Outlook desktop Windows (if available) — fallback confirmation
7. Mobile Safari Mail on an actual device, not just the simulator

## 12. Cinematic system (email edition)

The website's full cinematic stack — animated light leaks, film-scratch flashes, 45s flare sweeps, 18s color-temperature loops — can't live in email. Email clients strip `@keyframes`, JavaScript, `filter:`, and `mix-blend-mode`. This template approximates the cinematic feel with only the things that *do* survive the pipeline:

| Effect | Website | Email equivalent | Supported in |
|---|---|---|---|
| Vignette | Fixed-position radial overlay | Radial gradient in `background-image` | Apple Mail, iOS, Gmail Web/App, Outlook.com |
| Copper light leak (top-right) | Animated screen-blend overlay | Static `radial-gradient` at 55% opacity | Same as above |
| Amber light leak (bottom-left) | Animated | Static `radial-gradient` at 22% opacity | Same |
| Film grain | `feTurbulence` SVG + flicker | Same SVG, inlined as `utf8` data URI, static | Same (Outlook desktop ignores — falls back to solid deep) |
| Letterbox bars | CSS pseudo-elements | `<td>` rows at 6px, pure black | All clients |
| Sprocket hairline | Decorative SVG | Tight-kerned `■` glyphs in mono at 18% alpha | All clients |
| Frame/timecode ticker | — | `F.01 · 24 fps` / `00:00:00` in mono | All clients |
| Copper glow on hero name | `text-shadow` + `filter` | `text-shadow 0 0 30px rgba(184,71,28,0.35)` | All modern clients (ignored on Outlook — no degradation) |

### Outlook desktop fallback
Outlook for Windows uses the Word rendering engine, which strips most of the above. The template includes a VML `<v:rect>` block inside `<!--[if mso]>` comments that paints a simple dark gradient so the hero never goes blank or white.

### What to do if the grain feels too strong
Grain density is tuned via the SVG's `<feColorMatrix>` alpha value — the last number on the `0 0 0 0 N 0` line. Lower = subtler:
- Hero: `0.28` (current) → try `0.18` for softer, `0.38` for heavier
- Pull quote: `0.09` (current) → already very subtle
- Footer: `0.22` (current)

### What to do if the light leaks feel too strong
The leak opacities are set in the radial-gradient stops directly (e.g., `rgba(184,71,28,0.55)`). Drop the `0.55` to `0.35` for a quieter hero, or raise to `0.75` for a more dramatic one.

### Tone reminder
Cinematic here means *35mm, golden hour, slightly worn* — not *blockbuster trailer*. If something feels loud, it's too loud. The design guide rule still holds: *does it serve the writing, or compete with it?*

---

## 13. Files

- **`welcome-newsletter.html`** — weekly-letter-only welcome (paste into GHL)
- **`welcome-devotional.html`** — daily-devotional-only welcome (paste into GHL)
- **`welcome-combined.html`** — both-lists welcome (paste into GHL)
- **`newsletter-template.md`** — this guide
- **`DESIGN-GUIDE.md`** — the source of truth for all design decisions

If something in this doc and `DESIGN-GUIDE.md` disagree, the Design Guide wins.
