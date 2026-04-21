// Shared components for the Ian James website — nav, footer, wordmark, book cover.
const T = window.IJ_TOKENS;

// ───────── Wordmark ─────────
// Primary lockup: copper "I am" eyebrow + black "IAN JAMES" display.
function Wordmark({ size = 'md', onDark = false, eyebrow = true, inline = false }) {
  const scale = size === 'sm' ? 0.4 : size === 'md' ? 0.7 : size === 'lg' ? 1.3 : size === 'xl' ? 2 : size;
  const eyebrowColor = T.color.copper;
  const nameColor = onDark ? T.color.page : T.color.ink;

  if (inline) {
    return (
      <span style={{ fontFamily: T.font.head, fontWeight: 900, fontSize: 28 * scale, letterSpacing: '-0.04em', textTransform: 'uppercase', color: nameColor, lineHeight: 1 }}>
        IAN JAMES
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, gap: 10 * scale }}>
      {eyebrow && (
        <div style={{ fontFamily: T.font.body, fontSize: 13 * scale, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: eyebrowColor }}>
          I am
        </div>
      )}
      <div style={{ fontFamily: T.font.head, fontWeight: 900, fontSize: 96 * scale, letterSpacing: '-0.05em', textTransform: 'uppercase', color: nameColor, lineHeight: .85 }}>
        IAN JAMES
      </div>
    </div>
  );
}

// ───────── Nav ─────────
function Nav({ active, onDark = false }) {
  const items = [
    ['home', 'Home', 'index.html'],
    ['about', 'About', 'About.html'],
    ['books', 'Books', 'Books.html'],
    ['daily', 'Daily', 'Daily.html'],
    ['essays', 'Essays', 'Essays.html'],
    ['contact', 'Contact', 'Contact.html'],
  ];
  const c = onDark ? T.color.page : T.color.ink;
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 56px', borderBottom: `1px solid ${onDark ? 'rgba(255,255,255,.1)' : T.color.mist}` }}>
      <a href="index.html" style={{ textDecoration: 'none', color: c, display: 'inline-flex', flexDirection: 'column', lineHeight: 1, gap: 6, marginRight: 48, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: T.font.body, fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: T.color.copper }}>I am</span>
        <span style={{ fontFamily: T.font.head, fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1 }}>IAN JAMES</span>
      </a>
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {items.map(([k, label, href]) => (
          <a key={k} href={href} style={{
            textDecoration: 'none', color: c,
            fontFamily: T.font.body, fontSize: 12, fontWeight: 600,
            letterSpacing: '.14em', textTransform: 'uppercase',
            opacity: active === k ? 1 : .55,
            borderBottom: active === k ? `2px solid ${T.color.copper}` : '2px solid transparent',
            paddingBottom: 4,
          }}>{label}</a>
        ))}
        <a href="Newsletter.html" style={{
          textDecoration: 'none',
          background: T.color.copper, color: T.color.page,
          fontFamily: T.font.body, fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
          padding: '12px 20px',
        }}>Subscribe →</a>
      </div>
    </nav>
  );
}

// ───────── Footer ─────────
function Footer() {
  return (
    <footer style={{ background: T.color.ink, color: T.color.page, padding: '72px 56px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div>
          <Wordmark size={0.55} onDark />
          <div style={{ fontFamily: T.font.quote, fontStyle: 'italic', fontSize: 18, marginTop: 28, maxWidth: 380, lineHeight: 1.5, opacity: .85 }}>
            Writer of the unglamorous middle — faith, work, and the long way home.
          </div>
        </div>
        {[
          ['Read', [['Books', 'Books.html'], ['Daily devotionals', 'Daily.html'], ['Essays', 'Essays.html']]],
          ['About', [['Story', 'About.html'], ['Press / Media', 'About.html'], ['Contact', 'Contact.html']]],
          ['Follow', [['Newsletter', 'Newsletter.html'], ['Instagram', '#'], ['YouTube', '#']]],
        ].map(([title, links]) => (
          <div key={title}>
            <div style={{ fontFamily: T.font.body, fontSize: 11, fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: T.color.copper, marginBottom: 18 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map(([l, href]) => (
                <a key={l} href={href} style={{ color: T.color.page, textDecoration: 'none', fontFamily: T.font.body, fontSize: 14, fontWeight: 500, opacity: .75 }}>{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 28, fontFamily: T.font.body, fontSize: 12, opacity: .55 }}>
        <span>© 2026 Ian James. All rights reserved.</span>
        <span style={{ letterSpacing: '.2em', textTransform: 'uppercase' }}>Books · Words · Witness</span>
      </div>
    </footer>
  );
}

// ───────── Book Cover ─────────
function BookCover({ title, subtitle, variant = 'ink', w = 280, h = 420, rotate = 0, shadow = true }) {
  const palettes = {
    ink:    { bg: T.color.ink,    fg: T.color.page, accent: T.color.copper },
    copper: { bg: T.color.copper, fg: T.color.page, accent: T.color.ink },
    page:   { bg: T.color.page,   fg: T.color.ink,  accent: T.color.copper },
    bone:   { bg: T.color.bone,   fg: T.color.ink,  accent: T.color.copper },
  };
  const p = palettes[variant];
  return (
    <div style={{
      width: w, height: h, background: p.bg, color: p.fg, position: 'relative',
      boxShadow: shadow ? '0 30px 60px -30px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.15)' : 'none',
      transform: `rotate(${rotate}deg)`, flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 0, padding: '9%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: T.font.head, fontSize: w * .036, fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase' }}>Ian James</div>
        <div>
          <div style={{ fontFamily: T.font.head, fontSize: w * .16, fontWeight: 900, lineHeight: .88, letterSpacing: '-0.035em', textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ width: w * .22, height: 4, background: p.accent, margin: `${w * .04}px 0` }} />
          {subtitle && <div style={{ fontFamily: T.font.body, fontSize: w * .045, fontWeight: 500, lineHeight: 1.35, opacity: .88 }}>{subtitle}</div>}
        </div>
        <div style={{ fontFamily: T.font.body, fontSize: w * .028, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55 }}>
          A book by Ian James
        </div>
      </div>
    </div>
  );
}

// ───────── Button ─────────
function Btn({ children, kind = 'primary', href, dark, onClick }) {
  const styles = {
    primary: { background: T.color.copper, color: T.color.page, border: `2px solid ${T.color.copper}` },
    ghost:   { background: 'transparent', color: dark ? T.color.page : T.color.ink, border: `2px solid ${dark ? 'rgba(255,255,255,.3)' : T.color.ink}` },
    solid:   { background: T.color.ink, color: T.color.page, border: `2px solid ${T.color.ink}` },
  };
  return (
    <a href={href} onClick={onClick} style={{
      ...styles[kind], textDecoration: 'none',
      padding: '16px 30px', display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: T.font.body, fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
      cursor: 'pointer',
    }}>
      {children}
    </a>
  );
}

// ───────── Eyebrow ─────────
function Eyebrow({ children, color, dark }) {
  return (
    <div style={{
      fontFamily: T.font.body, fontSize: 11, fontWeight: 700,
      letterSpacing: '.3em', textTransform: 'uppercase',
      color: color || (dark ? T.color.copper : T.color.copper),
      marginBottom: 20,
    }}>{children}</div>
  );
}

Object.assign(window, { Wordmark, Nav, Footer, BookCover, Btn, Eyebrow });
