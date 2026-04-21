// Three brand direction explorations for Ian James Ormo.
// Each is a self-contained "spread" showing: wordmark/logo, palette,
// type system, and a representative page or collateral preview.
//
// All three artboards are the same W×H so they compare cleanly side-by-side.
// Direction 1 (Classic Editorial) is the recommended winner and will be
// expanded into the full brand guide + website.

const ARTBOARD_W = 1200;
const ARTBOARD_H = 1600;

// ─────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────

function Swatch({ hex, name, role, light }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        height: 80, background: hex,
        border: light ? '1px solid rgba(0,0,0,.08)' : 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', opacity: .7 }}>{name}</div>
        <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', opacity: .55 }}>{hex}</div>
      </div>
      <div style={{ fontSize: 11, opacity: .55, fontStyle: 'italic' }}>{role}</div>
    </div>
  );
}

function TypeSpecimen({ family, label, size, weight, italic, letterSpacing, sample, color }) {
  return (
    <div style={{ borderTop: '1px solid currentColor', opacity: .95, paddingTop: 14, marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .55, marginBottom: 10 }}>
        <span>{label}</span>
        <span>{family.split(',')[0]} · {weight}{italic ? ' italic' : ''} · {size}</span>
      </div>
      <div style={{ fontFamily: family, fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', letterSpacing, lineHeight: 1.1, color }}>
        {sample}
      </div>
    </div>
  );
}

// Reusable book cover — pluggable typography + palette
function BookCover({ title, subtitle, w = 200, h = 300, bg, fg, accent, headFamily, subFamily, layout = 'editorial', rotate = 0 }) {
  const common = { width: w, height: h, background: bg, color: fg, position: 'relative', boxShadow: '0 20px 40px -20px rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.1)', transform: `rotate(${rotate}deg)`, flexShrink: 0 };

  if (layout === 'editorial') {
    return (
      <div style={common}>
        <div style={{ position: 'absolute', inset: 0, padding: '10%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: subFamily, fontSize: w * .038, letterSpacing: '.25em', textTransform: 'uppercase', opacity: .7 }}>
            Ian James Ormo
          </div>
          <div>
            <div style={{ width: w * .35, height: 1, background: accent, marginBottom: w * .06 }} />
            <div style={{ fontFamily: headFamily, fontSize: w * .13, fontWeight: 400, lineHeight: .95, letterSpacing: '-0.01em' }}>
              {title}
            </div>
            {subtitle && <div style={{ fontFamily: subFamily, fontStyle: 'italic', fontSize: w * .05, marginTop: w * .04, opacity: .8, lineHeight: 1.3 }}>{subtitle}</div>}
          </div>
          <div style={{ fontFamily: subFamily, fontSize: w * .03, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .5 }}>
            A book
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'bold') {
    return (
      <div style={common}>
        <div style={{ position: 'absolute', inset: 0, padding: '8%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: headFamily, fontSize: w * .038, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase' }}>Ormo</div>
          <div>
            <div style={{ fontFamily: headFamily, fontSize: w * .18, fontWeight: 900, lineHeight: .9, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
              {title}
            </div>
            <div style={{ width: w * .25, height: 4, background: accent, margin: `${w * .04}px 0` }} />
            {subtitle && <div style={{ fontFamily: subFamily, fontSize: w * .045, lineHeight: 1.3, opacity: .85 }}>{subtitle}</div>}
          </div>
          <div style={{ fontFamily: headFamily, fontSize: w * .028, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .6 }}>Ian James Ormo</div>
        </div>
      </div>
    );
  }

  // warm
  return (
    <div style={common}>
      <div style={{ position: 'absolute', inset: 0, padding: '12%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: subFamily, fontStyle: 'italic', fontSize: w * .045, opacity: .7, marginBottom: w * .1 }}>Ian James Ormo</div>
        <div style={{ width: 40, height: 1, background: accent, marginBottom: w * .08 }} />
        <div style={{ fontFamily: headFamily, fontSize: w * .11, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.005em' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: subFamily, fontStyle: 'italic', fontSize: w * .042, marginTop: w * .08, opacity: .75, lineHeight: 1.4 }}>{subtitle}</div>}
        <div style={{ width: 40, height: 1, background: accent, marginTop: w * .08 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Direction 1 · Classic Editorial
// Deep navy, warm gold, cream. Didone/editorial serif wordmark.
// The "Penguin Press / Knopf" reference; NYT bestseller presence.
// ─────────────────────────────────────────────────────────────
function Direction1_Classic() {
  const P = {
    ink: '#0E1B2C',        // deep navy — primary
    bone: '#F4EEDF',       // warm cream — page
    gilt: '#B8893A',       // warm gold — accent
    claret: '#6E1F24',     // deep red — editorial accent
    smoke: '#4A4038',      // warm charcoal — text
  };
  const headF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
  const bodyF = '"Source Serif 4", "Source Serif Pro", Georgia, serif';
  const microF = '"Inter", -apple-system, sans-serif';

  return (
    <div style={{ width: ARTBOARD_W, height: ARTBOARD_H, background: P.bone, color: P.ink, fontFamily: bodyF, position: 'relative', overflow: 'hidden' }}>
      {/* corner marks */}
      <div style={{ position: 'absolute', top: 40, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6 }}>
        <span>Direction 01</span>
        <span>Classic Editorial</span>
        <span>Ormo / Brand</span>
      </div>

      {/* Wordmark block */}
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: bodyF, fontStyle: 'italic', fontSize: 32, color: P.smoke, letterSpacing: '.02em' }}>Ian James</div>
        <div style={{ fontFamily: headF, fontSize: 220, lineHeight: .9, letterSpacing: '-0.02em', color: P.ink, fontWeight: 400, marginTop: 6 }}>Ormo</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 22 }}>
          <div style={{ width: 80, height: 1, background: P.gilt }} />
          <div style={{ fontFamily: microF, fontSize: 12, letterSpacing: '.4em', textTransform: 'uppercase', color: P.smoke }}>Author · Speaker · Pastor</div>
          <div style={{ width: 80, height: 1, background: P.gilt }} />
        </div>
      </div>

      {/* Palette */}
      <div style={{ position: 'absolute', top: 540, left: 80, right: 80 }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, marginBottom: 18 }}>01 · Palette</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
          <Swatch hex={P.ink} name="Ink Navy" role="Primary · Headlines" />
          <Swatch hex={P.bone} name="Bone" role="Page · Canvas" light />
          <Swatch hex={P.gilt} name="Gilt" role="Accent · Foil" />
          <Swatch hex={P.claret} name="Claret" role="Editorial accent" />
          <Swatch hex={P.smoke} name="Smoke" role="Body text" />
        </div>
      </div>

      {/* Type specimen */}
      <div style={{ position: 'absolute', top: 780, left: 80, width: 520, color: P.ink }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, marginBottom: 8 }}>02 · Type</div>
        <TypeSpecimen family={headF} label="Display / Book titles" size={54} weight={400} sample="Rebuild without a blueprint." letterSpacing="-0.01em" color={P.ink} />
        <TypeSpecimen family={headF} label="Display · Italic" size={38} weight={400} italic sample="The body keeps the record." letterSpacing="-0.01em" color={P.smoke} />
        <TypeSpecimen family={bodyF} label="Long-form body" size={15} weight={400} sample="Grace doesn&rsquo;t wait for readiness. It arrives before you&rsquo;ve cleaned up, before you&rsquo;ve earned the right to receive it." color={P.smoke} />
        <TypeSpecimen family={microF} label="Micro · UI / Eyebrows" size={11} weight={500} sample="DAILY DEVOTIONAL · NO. 014" letterSpacing=".25em" color={P.smoke} />
      </div>

      {/* Book covers */}
      <div style={{ position: 'absolute', top: 820, right: 80, width: 440 }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .6, marginBottom: 18 }}>03 · Cover System</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <BookCover w={180} h={270} bg={P.ink} fg={P.bone} accent={P.gilt} headFamily={headF} subFamily={microF} layout="editorial" title="You Are Not Finished" subtitle="Grace, Grit, and the Long Way Home" />
          <BookCover w={160} h={240} bg={P.bone} fg={P.ink} accent={P.claret} headFamily={headF} subFamily={microF} layout="editorial" title={<>You Are Not<br/>Your Paycheck</>} subtitle="On worth, work, and the ceiling you didn&rsquo;t set" />
        </div>
      </div>

      {/* Sample mini site */}
      <div style={{ position: 'absolute', bottom: 40, left: 80, right: 80, height: 420, background: P.ink, color: P.bone, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: headF, fontSize: 26, letterSpacing: '.02em' }}>Ormo</div>
          <div style={{ display: 'flex', gap: 28, fontFamily: microF, fontSize: 12, letterSpacing: '.15em', textTransform: 'uppercase' }}>
            <span>Books</span><span>Devotionals</span><span>Essays</span><span>About</span><span style={{ opacity: .6 }}>Contact</span>
          </div>
        </div>
        <div style={{ maxWidth: 680 }}>
          <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: P.gilt, marginBottom: 18 }}>— New · Spring 2026</div>
          <div style={{ fontFamily: headF, fontSize: 72, lineHeight: .95, letterSpacing: '-0.02em' }}>
            You Are Not <span style={{ fontStyle: 'italic' }}>Finished.</span>
          </div>
          <div style={{ fontFamily: bodyF, fontSize: 17, marginTop: 18, opacity: .85, lineHeight: 1.5, maxWidth: 540 }}>
            A memoir about the unglamorous daily work of being rebuilt — by grace you didn&rsquo;t earn, a wife who stayed, and a God who keeps no receipts.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ padding: '14px 28px', background: P.gilt, color: P.ink, fontFamily: microF, fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 600 }}>Pre-Order</div>
          <div style={{ padding: '14px 28px', border: `1px solid ${P.bone}`, fontFamily: microF, fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', opacity: .85 }}>Read the first chapter</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Direction 2 · Modern Bold
// Black/cream/copper. Editorial sans, confident slabs of color.
// Closer to Hormozi / Sinek / Ryan Holiday commercial energy.
// ─────────────────────────────────────────────────────────────
function Direction2_Modern() {
  const P = {
    ink: '#111111',        // near black
    page: '#FAF7F2',       // warm off-white
    copper: '#B8471C',     // punchy accent
    steel: '#6B6B6B',      // neutral
    mist: '#E6E1D8',       // soft divider
  };
  const headF = '"Archivo", "Inter", -apple-system, sans-serif';
  const bodyF = '"Inter", -apple-system, sans-serif';
  const quoteF = '"Fraunces", "Source Serif 4", Georgia, serif';

  return (
    <div style={{ width: ARTBOARD_W, height: ARTBOARD_H, background: P.page, color: P.ink, fontFamily: bodyF, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 40, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: bodyF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, fontWeight: 500 }}>
        <span>Direction 02</span>
        <span>Modern Bold</span>
        <span>Ormo / Brand</span>
      </div>

      {/* Wordmark — big and immediate */}
      <div style={{ position: 'absolute', top: 110, left: 80, right: 80 }}>
        <div style={{ fontFamily: bodyF, fontSize: 13, fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: P.copper, marginBottom: 14 }}>I am</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ fontFamily: headF, fontSize: 230, lineHeight: .85, letterSpacing: '-0.05em', fontWeight: 900, textTransform: 'uppercase' }}>IAN JAMES</div>
          <div style={{ fontFamily: bodyF, fontSize: 13, fontWeight: 500, color: P.steel, paddingBottom: 34, lineHeight: 1.4, maxWidth: 220 }}>
            <div style={{ width: 32, height: 3, background: P.copper, marginBottom: 12 }} />
            Writer of the<br/>unglamorous middle.<br/>Faith. Work. Grace.
          </div>
        </div>
      </div>

      {/* Palette */}
      <div style={{ position: 'absolute', top: 570, left: 80, right: 80 }}>
        <div style={{ fontFamily: bodyF, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 18 }}>01 · Palette</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
          <Swatch hex={P.ink} name="Ink" role="Primary · Text" />
          <Swatch hex={P.page} name="Page" role="Canvas" light />
          <Swatch hex={P.copper} name="Copper" role="Accent · CTA" />
          <Swatch hex={P.steel} name="Steel" role="Secondary" />
          <Swatch hex={P.mist} name="Mist" role="Divider · Panel" light />
        </div>
      </div>

      {/* Type */}
      <div style={{ position: 'absolute', top: 820, left: 80, width: 520, color: P.ink }}>
        <div style={{ fontFamily: bodyF, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 8 }}>02 · Type</div>
        <TypeSpecimen family={headF} label="Display / Headline" size={56} weight={900} sample="PRESENCE OVER PERFORMANCE." letterSpacing="-0.03em" color={P.ink} />
        <TypeSpecimen family={quoteF} label="Editorial serif / Pull-quote" size={34} weight={400} italic sample="Cost is the evidence." color={P.ink} />
        <TypeSpecimen family={bodyF} label="Body · 500" size={15} weight={500} sample="Not resilience &mdash; just doing the next small unglamorous thing when you don&rsquo;t know if it matters." color={P.ink} />
        <TypeSpecimen family={bodyF} label="Micro · Caps" size={11} weight={600} sample="ESSAY NO. 014 · 6 MIN READ" letterSpacing=".2em" color={P.steel} />
      </div>

      {/* Book covers */}
      <div style={{ position: 'absolute', top: 820, right: 80, width: 440 }}>
        <div style={{ fontFamily: bodyF, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 18 }}>03 · Cover System</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <BookCover w={180} h={270} bg={P.ink} fg={P.page} accent={P.copper} headFamily={headF} subFamily={bodyF} layout="bold" title={<>You Are Not Finished</>} subtitle="Grace, grit, and the long way home." />
          <BookCover w={160} h={240} bg={P.copper} fg={P.page} accent={P.ink} headFamily={headF} subFamily={bodyF} layout="bold" title={<>You Are Not<br/>Your Paycheck</>} subtitle="Stop letting a number set your ceiling." />
        </div>
      </div>

      {/* Sample site slab */}
      <div style={{ position: 'absolute', bottom: 40, left: 80, right: 80, height: 420, background: P.ink, color: P.page, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: headF, fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>IAN JAMES</div>
          <div style={{ display: 'flex', gap: 28, fontFamily: bodyF, fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            <span>Books</span><span>Daily</span><span>Essays</span><span>About</span><span style={{ color: P.copper }}>Subscribe →</span>
          </div>
        </div>
        <div style={{ maxWidth: 820 }}>
          <div style={{ fontFamily: bodyF, fontSize: 11, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: P.copper, marginBottom: 18 }}>[ New essay · 04.2026 ]</div>
          <div style={{ fontFamily: headF, fontSize: 88, lineHeight: .88, letterSpacing: '-0.04em', fontWeight: 900, textTransform: 'uppercase' }}>
            The body<br/>keeps the record.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ padding: '14px 26px', background: P.copper, color: P.page, fontFamily: bodyF, fontSize: 12, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>Read the essay</div>
          <div style={{ fontFamily: bodyF, fontSize: 12, fontWeight: 500, opacity: .6 }}>9 min · Grace, second chances</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Direction 3 · Warm Devotional
// Cream, pressed-walnut brown, terracotta. Tactile, pastoral,
// letterpress-feeling. "Library of a trusted teacher."
// ─────────────────────────────────────────────────────────────
function Direction3_Warm() {
  const P = {
    walnut: '#3D2817',    // deep warm brown
    linen: '#E8DCC4',     // linen
    milk: '#F5EFDF',      // page
    terra: '#A63D2A',     // terracotta
    moss: '#5A5941',      // aged moss
  };
  const headF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
  const bodyF = '"Lora", "EB Garamond", Georgia, serif';
  const microF = '"Work Sans", -apple-system, sans-serif';

  return (
    <div style={{ width: ARTBOARD_W, height: ARTBOARD_H, background: P.milk, color: P.walnut, fontFamily: bodyF, position: 'relative', overflow: 'hidden' }}>
      {/* subtle paper texture via noise */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 .24 0 0 0 0 .16 0 0 0 0 .09 0 0 0 .08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: .6, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 40, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55 }}>
        <span>Direction 03</span>
        <span>Warm Devotional</span>
        <span>Ormo / Brand</span>
      </div>

      {/* Stacked monogram-ish wordmark */}
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: bodyF, fontStyle: 'italic', fontSize: 34, color: P.moss, letterSpacing: '.01em' }}>Ian James</div>
        <div style={{ fontFamily: headF, fontSize: 200, lineHeight: .95, color: P.walnut, fontWeight: 500, letterSpacing: '-0.005em', marginTop: 4 }}>
          Ormo
        </div>
        {/* Ornament */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24, color: P.terra }}>
          <div style={{ width: 60, height: 1, background: 'currentColor' }} />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z"/></svg>
          <div style={{ width: 60, height: 1, background: 'currentColor' }} />
        </div>
        <div style={{ fontFamily: microF, fontSize: 12, letterSpacing: '.35em', textTransform: 'uppercase', color: P.moss, marginTop: 20 }}>Teacher · Storyteller · Pastor</div>
      </div>

      {/* Palette */}
      <div style={{ position: 'absolute', top: 560, left: 80, right: 80 }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 18 }}>01 · Palette</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }}>
          <Swatch hex={P.walnut} name="Walnut" role="Primary text" />
          <Swatch hex={P.milk} name="Milk" role="Canvas" light />
          <Swatch hex={P.linen} name="Linen" role="Panel · Card" light />
          <Swatch hex={P.terra} name="Terracotta" role="Accent · Foil" />
          <Swatch hex={P.moss} name="Moss" role="Secondary" />
        </div>
      </div>

      {/* Type */}
      <div style={{ position: 'absolute', top: 800, left: 80, width: 520, color: P.walnut }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 8 }}>02 · Type</div>
        <TypeSpecimen family={headF} label="Display / Titles" size={52} weight={500} sample="A long, unhurried work." letterSpacing="-0.005em" color={P.walnut} />
        <TypeSpecimen family={headF} label="Display · Italic" size={36} weight={400} italic sample="Held, carried, kept." color={P.moss} />
        <TypeSpecimen family={bodyF} label="Devotional body" size={15} weight={400} italic sample="And He said: the cost is the evidence. Count it, and go again tomorrow." color={P.walnut} />
        <TypeSpecimen family={microF} label="Micro · Eyebrow" size={11} weight={500} sample="DAY 047 · PROVERBS 4:23" letterSpacing=".3em" color={P.moss} />
      </div>

      {/* Book covers */}
      <div style={{ position: 'absolute', top: 820, right: 80, width: 440 }}>
        <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55, marginBottom: 18 }}>03 · Cover System</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <BookCover w={180} h={270} bg={P.linen} fg={P.walnut} accent={P.terra} headFamily={headF} subFamily={microF} layout="warm" title={<>You Are Not<br/>Finished</>} subtitle="Grace, grit, and the long way home." />
          <BookCover w={160} h={240} bg={P.walnut} fg={P.milk} accent={P.terra} headFamily={headF} subFamily={microF} layout="warm" title={<>Not Your<br/>Paycheck</>} subtitle="A letter about worth." />
        </div>
      </div>

      {/* Sample card — devotional */}
      <div style={{ position: 'absolute', bottom: 40, left: 80, right: 80, height: 420, background: P.linen, color: P.walnut, padding: 50, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${P.walnut}22` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: headF, fontSize: 26, fontStyle: 'italic' }}>Ormo</div>
          <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: P.moss }}>Day 047 · The Quiet Rebuild</div>
        </div>
        <div style={{ maxWidth: 780, textAlign: 'center', alignSelf: 'center' }}>
          <div style={{ fontFamily: headF, fontSize: 56, lineHeight: 1.05, fontStyle: 'italic', fontWeight: 400 }}>
            &ldquo;Grace doesn&rsquo;t wait<br/>for your readiness.&rdquo;
          </div>
          <div style={{ fontFamily: bodyF, fontSize: 15, marginTop: 24, color: P.moss, lineHeight: 1.6, maxWidth: 580, margin: '24px auto 0' }}>
            It arrives before you&rsquo;ve cleaned up, before you&rsquo;ve earned the right to receive it. Let today&rsquo;s small, unglamorous work be enough.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: P.moss }}>
          <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase' }}>— Ian</div>
          <div style={{ fontFamily: microF, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase' }}>Read · Subscribe · Share</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Direction1_Classic, Direction2_Modern, Direction3_Warm, BookCover, Swatch });
