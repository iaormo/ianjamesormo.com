# Ian James Ormo — Design Guide & System

## Philosophy

The design says: *serious work, honest craft, nothing to prove.* It is warm without being cozy, bold without being loud. Think a well-worn hardback left open on a desk — not a lifestyle brand, not a startup.

Every design decision should pass this test: **Does it serve the writing, or compete with it?**

---

## Design Tokens

These are the single source of truth. Defined in `lib/tokens.js` as `window.IJ_TOKENS`.

### Color

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | `#111111` | Primary text, dark surfaces, buttons |
| `page` | `#FAF7F2` | Canvas / background — warm off-white |
| `copper` | `#B8471C` | Accent, CTA, heat, hover states, links |
| `steel` | `#6B6B6B` | Secondary text, metadata, captions |
| `mist` | `#E6E1D8` | Dividers, borders, panels |
| `bone` | `#EFEAE0` | Alternate panel background |
| `deep` | `#0A0A0A` | Near-black — hero sections, footers |

**Copper** (`#B8471C`) is the only accent. It represents heat, urgency, and honest warmth — not celebration. Use sparingly: links, one CTA per section, active nav states, key labels.

**Never introduce new colors.** If something feels like it needs a new color, reconsider the element.

### Color Combinations

| Background | Text | Use |
|------------|------|-----|
| `page` | `ink` | All standard content sections |
| `deep` | `page` | Hero sections, footers, featured cards |
| `bone` | `ink` | Alternate panels, callout sections |
| `deep` | `copper` | Labels, metadata on dark sections |
| `page` | `copper` | CTA buttons on light backgrounds |
| `ink` | `page` | Filled buttons |

---

## Typography

### Typefaces

| Role | Family | Token |
|------|--------|-------|
| Headings / Display | Archivo | `font.head` |
| Body text | Inter | `font.body` |
| Pull quotes / Block quotes | Fraunces (serif, italic) | `font.quote` |
| Labels / Metadata / Mono | JetBrains Mono | `font.mono` |

All loaded from Google Fonts. Archivo is the primary display workhorse — Black weight (900) for hero headings, Bold (700) for section headers, Medium (500) for subheadings.

### Type Scale

| Usage | Size | Weight | Font |
|-------|------|--------|------|
| Hero display | `clamp(72px, 14vw, 168px)` | 900 | Archivo |
| Section heading | `clamp(40px, 6vw, 80px)` | 900 | Archivo |
| Subheading | `24–32px` | 700 | Archivo |
| Pull quote | `clamp(24px, 3.5vw, 44px)` | 400–500, italic | Fraunces |
| Body text | `18–20px` | 400 | Inter |
| Small body | `15–16px` | 400 | Inter |
| Label / meta | `11–12px` | 400–500 | JetBrains Mono |
| CTA button | `13–14px` | 500–600 | Archivo, letter-spaced |

### Letter Spacing
- Mono labels, nav items, uppercase tags: `0.08em` to `0.12em`
- Headings at display sizes: `−0.01em` to `−0.03em` (tight)
- Body text: `0` (default)

### Line Height
- Display headings: `0.92–1.0`
- Body text: `1.65–1.75`
- Pull quotes: `1.3–1.45`
- Mono labels: `1.0`

---

## Spacing

The spacing system is based on an **8px base unit**. All margins, padding, and gaps should be multiples of 8.

| Token | Value | Usage |
|-------|-------|-------|
| `4px` | 0.5× | Tight internal spacing |
| `8px` | 1× | Inline gaps |
| `16px` | 2× | Small component padding |
| `24px` | 3× | Default component padding |
| `32px` | 4× | Section internal spacing |
| `48px` | 6× | Inter-component spacing |
| `64px` | 8× | Section top/bottom padding (mobile) |
| `96px` | 12× | Section padding (tablet) |
| `120–160px` | 15–20× | Section padding (desktop) |

### Horizontal Rhythm
All content sections use inline padding via `.section-pad`:
- Desktop: `80px` left/right
- Tablet (901–1024px): `40px`
- Mobile (≤900px): `24px`

Max content width: `1280px`, centered.

---

## Grid

### Layout Grids

| Context | Columns | Gap |
|---------|---------|-----|
| Two-column hero | `1fr 1fr` | `80px` |
| Three-column themes | `1fr 1fr 1fr` | `0` (bordered cells) |
| Two-column books | `auto 1fr` | `80px` |
| Daily archive | `1fr 1fr` | `32px` |
| Footer | `1fr 1fr 1fr 1fr` | `48px` |

All grids collapse to single column at `≤900px`.

---

## Components

### Buttons

**Filled (Primary CTA)**
```css
background: ink (#111);
color: page (#FAF7F2);
font: 13px/500 Archivo, letter-spacing: 0.08em;
padding: 14px 28px;
border: 1px solid ink;
hover: background shifts to copper (#B8471C), border copper
```

**Ghost (Secondary CTA)**
```css
background: transparent;
color: ink;
border: 1px solid ink;
same padding/font as filled;
hover: fill with ink, text becomes page
```

**On dark backgrounds**
```css
border-color: page (#FAF7F2) or copper;
color: page or copper;
hover: fill with copper or page
```

**Rules:**
- One filled CTA per section. Two maximum on a page.
- All-caps or mixed case, never title case for generic labels
- Letter-space all button text at least `0.06em`

### Navigation

- Fixed top, `48–56px` tall
- Background: `page` with subtle bottom border (`mist`)
- Logo/wordmark: left
- Links: right, `12px` Archivo, letter-spaced, `ij-link-u` underline draw on hover
- Active page: copper color
- Mobile: hamburger at `≤900px`, full-width dropdown

### Cards

**Featured/hero card** (daily devotional featured)
- Background: `deep` with film grain overlay
- Large italic Fraunces quote
- Mono meta labels in copper
- No border — dark surface is the container

**Archive card / essay row**
- Light surface (`page` or `bone`)
- Clear typographic hierarchy: title, date, excerpt
- Hover: subtle background shift or copper accent reveal

### Dividers
Always `1px solid mist (#E6E1D8)`. Never decorative rules that are thicker or have color.

### Labels / Tags
```
font: 11px JetBrains Mono, letter-spacing: 0.10em
color: copper (on dark) or steel (on light)
UPPERCASE
no background — label text only
```

---

## Cinematic Effects System

Defined in `js/animations.js`. Applied automatically — do not duplicate in inline styles.

### Global Overlay (`#ij-cinema-*`)
Fixed-position overlays over the entire page:

| Element | Effect | Blend Mode | Opacity Range |
|---------|--------|-----------|---------------|
| `vignette` | Dark edge radial gradient, always on | multiply | 0.40–0.72 at edges |
| `leak-a` | Warm amber light leak, top-right | screen | 0–0.90 (20s loop) |
| `leak-b` | Copper leak, bottom-left | screen | 0–0.80 (26s loop, 7s delay) |
| `leak-c` | Gold-tinted leak, top-left | screen | 0–0.60 (34s loop, 14s delay) |
| `flare` | Horizontal burn sweep | screen | slow 45s pass |
| `scratch` | Vertical film scratch flash | — | appears at 93–99% of 38s loop |

### Section-Level Grain (`.ij-grain-host`)
Auto-applied to any `section` or `footer` with computed luminance below 0.22.

- `::before` — SVG fractalNoise grain, overlay blend, opacity 0.08–0.18 with flicker
- `::after` — Vignette + warm corner glows + horizontal flare gradient, screen blend, 18s color-temperature animation

### What Not to Do
- Do not add `z-index > 9990` to page content — it will appear above the cinematic overlay
- Do not use `overflow: hidden` on a section that should receive grain without also adding `position: relative; isolation: isolate`
- Do not add background effects manually — extend the system in `animations.js` instead

### Prefers-Reduced-Motion
All animations are disabled automatically when the user has set `prefers-reduced-motion: reduce`. Static states are preserved (vignette stays, leaks/scratch/flare hidden).

---

## Iconography

No icon libraries. SVG only, inline where possible.
- Stroke-based, `1.5–2px` stroke weight
- Sized to `20px` or `24px` default
- Color inherits from parent (`currentColor`)
- Social icons: only X (Twitter), Facebook, LinkedIn, WhatsApp, Copy Link

---

## Motion & Animation

All animation logic lives in `js/animations.js`. Do not add `animation` or `transition` in inline styles unless it's a one-off that cannot be in the sheet.

### Principles
- **Ease in, ease out — never linear for UI.** Use `cubic-bezier(.22,1,.36,1)` (fast-out) for exits, `cubic-bezier(.2,.8,.2,1)` for entrances.
- **Stagger reveals** — hero words stagger at 70ms per word.
- **Nothing flashes.** Every transition ≥ 200ms unless it's a deliberate flicker effect.
- **Subtle is correct.** The animations serve the content. They should be noticed only if missing.

### Standard Durations
| Action | Duration |
|--------|----------|
| Button hover | 300–350ms |
| Link underline draw | 450ms |
| Card hover | 400ms |
| Section scroll reveal | 650ms |
| Word-by-word heading reveal | 900ms per word, 70ms stagger |
| Tilt / magnetic release | 400ms |

### Scroll-Triggered Reveals
Sections fade up via IntersectionObserver:
```css
section { opacity: 0; transform: translateY(28px); transition: opacity .65s, transform .65s; }
section.in-view { opacity: 1; transform: none; }
```

---

## Images

### Style
- Author photos: candid, natural light, minimal post-processing
- Book covers: displayed with subtle 3D tilt on hover
- No stock photography. No flat icons used as illustrations.

### Technical
- Always include `width` and `height` attributes
- Use `loading="lazy"` for below-the-fold images
- Provide WebP with appropriate fallback
- OG images: 1200×630px, always include one per page

---

## Accessibility

- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text
- All interactive elements must have visible focus states
- Cinematic overlays: `aria-hidden="true"`, `pointer-events: none`
- Do not rely on color alone to communicate meaning
- All images: meaningful `alt` text or `alt=""` if decorative

---

## Do / Don't Summary

| Do | Don't |
|----|-------|
| Use copper sparingly as the single accent | Add a second accent color |
| Keep hierarchy clear: Archivo for headings, Inter for body | Mix Fraunces into body text |
| Use the 8px spacing grid | Use arbitrary pixel values |
| Keep CTAs to one per section | Stack multiple CTAs |
| Let the film grain/burn system run automatically | Layer manual background effects on top |
| Use `mist` borders, never decorative flourishes | Add drop shadows or glow effects to content elements |
| Match typography size to importance | Use large type to fill space |
| Let sections breathe with generous vertical padding | Compress content to fit more on screen |
