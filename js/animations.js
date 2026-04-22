// animations.js — premium 21st.dev-style effects:
//   1. Hero text reveal (word split, stagger fade + slide)
//   2. Magnetic buttons
//   3. Book cover 3D tilt
//   4. Animated underline on nav/footer links
//   5. Cursor-tracking spotlight on cards
//   6. Cinematic film grain + burn on dark sections
//   7. Global cinematic overlay: vignette, light leaks, flare, scratch
(function () {
  if (window.__ijAnimInit) return;
  window.__ijAnimInit = true;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE    = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // ─── 1. STYLES ────────────────────────────────────────────────────────────
  function injectStyles() {
    var css = ''+
      /* ── CURSOR SPOTLIGHT ────────────────────────────────────────────── */
      '.ij-spotlight { position: relative; overflow: hidden; }'+
      '.ij-spotlight::before { content:""; position:absolute; inset:0; pointer-events:none;'+
        'background: radial-gradient(420px circle at var(--ij-mx,50%) var(--ij-my,50%),'+
          'rgba(184,71,28,.22) 0%, rgba(184,71,28,.08) 30%, transparent 55%);'+
        'opacity: 0; transition: opacity .45s ease; z-index: 1; mix-blend-mode: screen; }'+
      '.ij-spotlight:hover::before { opacity: 1; }'+
      '.ij-spotlight > * { position: relative; z-index: 2; }'+
      '.ij-spotlight::after { content:""; position:absolute; inset:-1px; pointer-events:none;'+
        'border-radius: inherit;'+
        'background: radial-gradient(200px circle at var(--ij-mx,50%) var(--ij-my,50%),'+
          'rgba(184,71,28,.45), transparent 60%);'+
        '-webkit-mask: linear-gradient(#000,#000) content-box, linear-gradient(#000,#000);'+
        '-webkit-mask-composite: xor; mask-composite: exclude;'+
        'padding: 1px; opacity: 0; transition: opacity .4s ease; z-index: 3; }'+
      '.ij-spotlight:hover::after { opacity: 1; }'+
      /* ── SHARE ICON HOVER ─────────────────────────────────────────────── */
      '.ij-share-btn { position: relative; overflow: hidden; isolation: isolate;'+
        'transition: color .3s cubic-bezier(.22,1,.36,1), border-color .3s ease, transform .35s cubic-bezier(.22,1,.36,1); }'+
      '.ij-share-btn svg { position: relative; z-index: 2; transition: transform .4s cubic-bezier(.22,1,.36,1); }'+
      '.ij-share-btn::before { content: ""; position: absolute; inset: 0; background: #B8471C;'+
        'transform: translateY(100%); transition: transform .45s cubic-bezier(.22,1,.36,1); z-index: 1; }'+
      '.ij-share-btn:hover { color: #FAF7F2 !important; border-color: #B8471C !important; transform: translateY(-2px); }'+
      '.ij-share-btn:hover::before { transform: translateY(0); }'+
      '.ij-share-btn:hover svg { transform: scale(1.12) rotate(-4deg); }'+
      '.ij-share-btn:active { transform: translateY(0); }'+

      /* ── FILM GRAIN + BURN on dark sections ───────────────────────────── */
      ".ij-grain-host { position: relative; isolation: isolate; }"+
      /* Grain layer: static — the animated translate version caused repaint on every frame */
      ".ij-grain-host::before { content:''; position:absolute; inset:0; pointer-events:none; z-index:1;"+
        "background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.80' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 .92 0 0 0 0 .78 0 0 0 .7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\");"+
        "mix-blend-mode: overlay; opacity:.12; }"+
      /* Burn layer: vignette + warm corner glows + sweeping burn flare (static — filter animations cause paint jank on scroll) */
      ".ij-grain-host::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:1;"+
        "background:"+
          "radial-gradient(ellipse at center, transparent 28%, rgba(8,5,3,.50) 70%, rgba(2,1,0,.88) 100%),"+
          "radial-gradient(1000px circle at 90% 5%,  rgba(210,90,25,.32) 0%, transparent 52%),"+
          "radial-gradient(800px  circle at 8%  92%, rgba(184,71,28,.22) 0%, transparent 48%),"+
          "radial-gradient(600px  circle at 50% 50%, rgba(180,100,30,.06) 0%, transparent 60%),"+
          "linear-gradient(125deg, transparent 38%, rgba(255,175,100,.07) 50%, transparent 62%);"+
        "mix-blend-mode: screen; }"+
      ".ij-grain-host > * { position: relative; z-index: 2; }"+

      /* Grain shake */
      "@keyframes ij-grain {"+
        "0%   { transform: translate(0,0)    scale(1.04); }"+
        "17%  { transform: translate(-5%,3%) scale(1.02); }"+
        "33%  { transform: translate(4%,-4%) scale(1.05); }"+
        "50%  { transform: translate(-3%,5%) scale(1.03); }"+
        "67%  { transform: translate(5%,-2%) scale(1.04); }"+
        "83%  { transform: translate(-2%,4%) scale(1.02); }"+
        "100% { transform: translate(0,0)    scale(1.04); }"+
      "}"+
      /* Opacity flicker — irregular like real film */
      "@keyframes ij-flicker {"+
        "0%,100% { opacity:.13; }"+
        "31%  { opacity:.16; }"+
        "34%  { opacity:.08; }"+
        "37%  { opacity:.18; }"+
        "39%  { opacity:.10; }"+
        "62%  { opacity:.15; }"+
        "65%  { opacity:.06; }"+
        "68%  { opacity:.14; }"+
        "82%  { opacity:.09; }"+
      "}"+
      /* Color temperature breathing: warm → cool → warm */
      "@keyframes ij-burn {"+
        "0%   { filter: brightness(1.00) hue-rotate(0deg)  saturate(1.0); }"+
        "25%  { filter: brightness(1.06) hue-rotate(-4deg) saturate(1.1); }"+
        "50%  { filter: brightness(1.10) hue-rotate(2deg)  saturate(0.95); }"+
        "75%  { filter: brightness(1.04) hue-rotate(-2deg) saturate(1.05); }"+
        "100% { filter: brightness(1.00) hue-rotate(0deg)  saturate(1.0); }"+
      "}"+

      /* ── GLOBAL CINEMATIC OVERLAY ─────────────────────────────────────── */
      /* GPU-promote every fixed overlay so they don't repaint on scroll */
      "#ij-cinema-paper,#ij-cinema-tint,#ij-cinema-vignette,#ij-cinema-leak-a,#ij-cinema-leak-b,#ij-cinema-leak-c,#ij-cinema-flare,#ij-cinema-scratch,#ij-cinema-scratch2,#ij-cinema-noise,#ij-cinema-dust {"+
        "transform: translateZ(0); will-change: transform, opacity; backface-visibility: hidden; contain: layout paint size;"+
      "}"+
      "#ij-cinema-vignette { position:fixed; inset:0; pointer-events:none; z-index:9990;"+
        "background: radial-gradient(ellipse 110% 100% at center, transparent 38%, rgba(30,15,5,.20) 70%, rgba(10,4,1,.48) 100%);"+
      "}"+
      "#ij-cinema-leak-a { position:fixed; pointer-events:none; z-index:9991;"+
        "top:-20%; right:-15%; width:65%; height:70%;"+
        "background: radial-gradient(ellipse at center, rgba(220,100,30,.28) 0%, rgba(184,71,28,.14) 35%, transparent 70%);"+
        "mix-blend-mode:soft-light; border-radius:50%;"+
        "animation: ij-leak-a 24s ease-in-out infinite; }"+
      "#ij-cinema-leak-b { position:fixed; pointer-events:none; z-index:9991;"+
        "bottom:-20%; left:-12%; width:55%; height:60%;"+
        "background: radial-gradient(ellipse at center, rgba(184,71,28,.22) 0%, rgba(140,55,20,.10) 40%, transparent 70%);"+
        "mix-blend-mode:soft-light; border-radius:50%;"+
        "animation: ij-leak-b 30s ease-in-out infinite 8s; }"+
      "#ij-cinema-leak-c { position:fixed; pointer-events:none; z-index:9991;"+
        "top:-15%; left:-8%; width:45%; height:50%;"+
        "background: radial-gradient(ellipse at center, rgba(230,170,70,.16) 0%, rgba(200,140,50,.08) 40%, transparent 70%);"+
        "mix-blend-mode:soft-light; border-radius:50%;"+
        "animation: ij-leak-c 38s ease-in-out infinite 16s; }"+
      "#ij-cinema-flare { position:fixed; top:-20%; left:0; width:55%; height:140%;"+
        "pointer-events:none; z-index:9992;"+
        "background: linear-gradient(105deg, transparent 0%, rgba(255,170,90,.00) 22%,"+
          "rgba(255,190,110,.14) 46%, rgba(255,200,120,.22) 50%, rgba(255,190,110,.14) 54%, rgba(255,170,90,.00) 78%, transparent 100%);"+
        "mix-blend-mode:soft-light;"+
        "animation: ij-flare 42s linear infinite 5s; }"+
      "#ij-cinema-tint { position:fixed; inset:0; pointer-events:none; z-index:9989;"+
        "background: radial-gradient(ellipse at 30% 20%, rgba(220,140,60,.06) 0%, transparent 55%),"+
                   "radial-gradient(ellipse at 80% 90%, rgba(184,71,28,.05) 0%, transparent 60%);"+
        "mix-blend-mode:multiply;"+
      "}"+
      /* Parchment paper texture — fine SVG fiber noise + subtle tint */
      "#ij-cinema-paper { position:fixed; inset:0; pointer-events:none; z-index:9988;"+
        "background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 .42  0 0 0 0 .30  0 0 0 0 .18  0 0 0 .55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>\"),"+
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'><filter id='p2'><feTurbulence type='fractalNoise' baseFrequency='.35' numOctaves='3' seed='11' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 .32  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .30 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p2)'/></svg>\");"+
        "background-size: 420px 420px, 640px 640px;"+
        "background-repeat: repeat, repeat;"+
        "opacity: .22;"+
        "mix-blend-mode: multiply;"+
      "}"+
      /* Floating dust specks — tiny illuminated motes drifting on a light breeze */
      "#ij-cinema-dust { position:fixed; inset:-15%; pointer-events:none; z-index:9995;"+
        "background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><g fill='rgb(255,225,180)'><circle cx='47'  cy='52'  r='.8'/><circle cx='112' cy='91'  r='1.1' opacity='.75'/><circle cx='178' cy='38'  r='.6'/><circle cx='231' cy='134' r='.9' opacity='.65'/><circle cx='289' cy='72'  r='1.3' opacity='.8'/><circle cx='346' cy='182' r='.7'/><circle cx='405' cy='44'  r='.5' opacity='.6'/><circle cx='462' cy='128' r='1'   opacity='.7'/><circle cx='523' cy='61'  r='.8'/><circle cx='574' cy='213' r='.6' opacity='.55'/><circle cx='67'  cy='241' r='1.1' opacity='.7'/><circle cx='143' cy='302' r='.7'/><circle cx='216' cy='267' r='.9' opacity='.65'/><circle cx='274' cy='338' r='.6'/><circle cx='328' cy='289' r='1.2' opacity='.75'/><circle cx='392' cy='361' r='.5' opacity='.5'/><circle cx='451' cy='311' r='.8'/><circle cx='509' cy='384' r='1'   opacity='.7'/><circle cx='559' cy='329' r='.7'/><circle cx='34'  cy='413' r='.9' opacity='.65'/><circle cx='103' cy='471' r='.6'/><circle cx='167' cy='436' r='1.1' opacity='.75'/><circle cx='234' cy='498' r='.7'/><circle cx='297' cy='458' r='.5' opacity='.55'/><circle cx='361' cy='519' r='.9' opacity='.7'/><circle cx='424' cy='481' r='.8'/><circle cx='487' cy='544' r='.6'/><circle cx='546' cy='502' r='1'   opacity='.7'/><circle cx='89'  cy='561' r='.7'/><circle cx='194' cy='578' r='.5' opacity='.55'/></g></svg>\"),"+
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><g fill='rgb(240,210,160)'><circle cx='62'  cy='73'  r='1.4' opacity='.55'/><circle cx='178' cy='149' r='.9' opacity='.45'/><circle cx='287' cy='61'  r='1.8' opacity='.5'/><circle cx='401' cy='218' r='1.1' opacity='.4'/><circle cx='512' cy='94'  r='.8' opacity='.5'/><circle cx='643' cy='181' r='1.5' opacity='.45'/><circle cx='742' cy='272' r='1'  opacity='.4'/><circle cx='93'  cy='338' r='1.3' opacity='.5'/><circle cx='214' cy='411' r='.9' opacity='.45'/><circle cx='341' cy='356' r='1.6' opacity='.5'/><circle cx='471' cy='472' r='1'  opacity='.4'/><circle cx='593' cy='402' r='1.2' opacity='.45'/><circle cx='701' cy='521' r='1.5' opacity='.5'/><circle cx='138' cy='587' r='1'  opacity='.4'/><circle cx='263' cy='643' r='1.3' opacity='.5'/><circle cx='398' cy='611' r='.9' opacity='.45'/><circle cx='522' cy='681' r='1.7' opacity='.5'/><circle cx='648' cy='648' r='1'  opacity='.4'/><circle cx='756' cy='731' r='1.2' opacity='.45'/></g></svg>\");"+
        "background-size: 600px 600px, 800px 800px;"+
        "background-repeat: repeat, repeat;"+
        "opacity: .22;"+
        "mix-blend-mode: screen;"+
        "animation: ij-dust-drift-a 75s linear infinite, ij-dust-drift-b 110s linear infinite;"+
      "}"+
      "@keyframes ij-dust-drift-a {"+
        "0%   { transform: translate3d(0, 0, 0); }"+
        "50%  { transform: translate3d(-30px, -160px, 0); }"+
        "100% { transform: translate3d(-60px, -320px, 0); }"+
      "}"+
      "@keyframes ij-dust-drift-b {"+
        "0%,100% { opacity: .22; }"+
        "50%     { opacity: .32; }"+
      "}"+

      /* Global film noise — static (animated version caused full-viewport repaint jank) */
      "#ij-cinema-noise { position:fixed; inset:0; pointer-events:none; z-index:9994;"+
        "background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='gn'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .72 0'/></filter><rect width='100%25' height='100%25' filter='url(%23gn)'/></svg>\");"+
        "background-size: 280px 280px;"+
        "opacity: .07;"+
        "mix-blend-mode: overlay;"+
      "}"+
      /* Film scratch: rare vertical flash */
      "#ij-cinema-scratch { position:fixed; top:0; left:38%; width:1px; height:100%;"+
        "pointer-events:none; z-index:9993;"+
        "background: linear-gradient(to bottom, transparent, rgba(40,20,10,.75) 15%, rgba(20,10,5,.92) 50%, rgba(40,20,10,.75) 85%, transparent);"+
        "mix-blend-mode:multiply;"+
        "animation: ij-scratch 38s linear infinite 12s; }"+
      /* Second film scratch: lighter, on the right */
      "#ij-cinema-scratch2 { position:fixed; top:0; right:22%; width:1px; height:100%;"+
        "pointer-events:none; z-index:9993;"+
        "background: linear-gradient(to bottom, transparent 10%, rgba(60,30,15,.6) 30%, rgba(30,15,8,.85) 60%, transparent 90%);"+
        "mix-blend-mode:multiply;"+
        "animation: ij-scratch2 52s linear infinite 25s; }"+

      /* Keyframes for global overlay */
      "@keyframes ij-leak-a {"+
        "0%,100% { opacity:0;   transform:translate(0,0)    scale(1); }"+
        "15%     { opacity:0;   }"+
        "30%     { opacity:.55; transform:translate(-3%,2%) scale(1.08); }"+
        "50%     { opacity:.40; transform:translate(2%,4%)  scale(1.05); }"+
        "70%     { opacity:.28; transform:translate(-1%,1%) scale(1.02); }"+
        "85%     { opacity:.10; }"+
      "}"+
      "@keyframes ij-leak-b {"+
        "0%,100% { opacity:0;   transform:translate(0,0)   scale(1); }"+
        "20%     { opacity:0;   }"+
        "40%     { opacity:.48; transform:translate(2%,-3%) scale(1.06); }"+
        "60%     { opacity:.35; transform:translate(-2%,2%) scale(1.04); }"+
        "80%     { opacity:.15; }"+
      "}"+
      "@keyframes ij-leak-c {"+
        "0%,100% { opacity:0; }"+
        "30%     { opacity:0; }"+
        "50%     { opacity:.36; transform:translate(1%,1%) scale(1.04); }"+
        "70%     { opacity:.22; }"+
        "85%     { opacity:0; }"+
      "}"+
      "@keyframes ij-flare {"+
        "0%        { transform:translateX(-120%); opacity:0; }"+
        "5%        { opacity:1; }"+
        "45%,55%   { opacity:1; }"+
        "95%       { opacity:0; }"+
        "100%      { transform:translateX(250%); opacity:0; }"+
      "}"+
      "@keyframes ij-scratch {"+
        "0%,93%,100% { opacity:0; }"+
        "94%  { opacity:.80; }"+
        "95%  { opacity:.20; }"+
        "96%  { opacity:.90; }"+
        "97%  { opacity:.10; }"+
        "98%  { opacity:.70; }"+
        "99%  { opacity:0; }"+
      "}"+
      "@keyframes ij-scratch2 {"+
        "0%,88%,100% { opacity:0; }"+
        "89%  { opacity:.55; }"+
        "91%  { opacity:.15; }"+
        "93%  { opacity:.70; }"+
        "95%  { opacity:.20; }"+
        "97%  { opacity:.50; }"+
      "}"+

      /* ── HOVERPEEK LINK PREVIEW ───────────────────────────────────────── */
      "#ij-peek { position:fixed; pointer-events:none; z-index:10000; width:280px;"+
        "background:#0A0A0A; color:#FAF7F2; border:1px solid rgba(184,71,28,.35);"+
        "border-radius:8px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(250,247,242,.04);"+
        "opacity:0; transform:translateY(10px) scale(.96) rotateX(8deg); transform-origin:center top;"+
        "transition:opacity .25s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1);"+
        "perspective:800px; }"+
      "#ij-peek.is-on { opacity:1; transform:translateY(0) scale(1) rotateX(0deg); }"+
      "#ij-peek .peek-img { width:100%; height:140px; background:#1a1208 center/cover no-repeat;"+
        "border-bottom:1px solid rgba(184,71,28,.2); position:relative; }"+
      "#ij-peek .peek-img::after { content:''; position:absolute; inset:0;"+
        "background:linear-gradient(180deg,transparent 40%, rgba(10,10,10,.7) 100%); }"+
      "#ij-peek .peek-body { padding:14px 16px 16px; }"+
      "#ij-peek .peek-kicker { font:500 10px/1 'JetBrains Mono',monospace; letter-spacing:.14em;"+
        "text-transform:uppercase; color:#B8471C; margin:0 0 8px; }"+
      "#ij-peek .peek-title { font:700 15px/1.25 'Archivo',sans-serif; color:#FAF7F2; margin:0 0 6px; }"+
      "#ij-peek .peek-desc { font:400 12px/1.45 'Inter',sans-serif; color:rgba(250,247,242,.68); margin:0; }"+

      /* ── INTERACTIVE HOVER LINKS (letter stagger) ──────────────────────── */
      ".ij-hoverlink { display:inline-flex; }"+
      ".ij-hoverlink .ij-ltr { display:inline-block; transition:transform .45s cubic-bezier(.34,1.56,.64,1), color .3s ease;"+
        "transform-origin:center bottom; }"+
      ".ij-hoverlink:hover .ij-ltr { animation:ij-letter-bounce .55s cubic-bezier(.34,1.56,.64,1) both; }"+
      "@keyframes ij-letter-bounce {"+
        "0%   { transform:translateY(0) rotate(0); }"+
        "40%  { transform:translateY(-6px) rotate(-4deg); color:#B8471C; }"+
        "70%  { transform:translateY(-2px) rotate(2deg); }"+
        "100% { transform:translateY(0) rotate(0); }"+
      "}"+

      /* ── 3D CARD TILT (extended) ──────────────────────────────────────── */
      ".ij-3d { transform-style:preserve-3d; transition:transform .55s cubic-bezier(.22,1,.36,1), box-shadow .55s ease;"+
        "will-change:transform; }"+
      ".ij-3d-inner { transform-style:preserve-3d; transition:transform .55s cubic-bezier(.22,1,.36,1); }"+
      ".ij-3d-lift { position:relative; transition:transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease; }"+
      ".ij-3d-lift:hover { transform:translateY(-4px) translateZ(10px); box-shadow:0 18px 40px rgba(10,5,3,.35), 0 4px 10px rgba(184,71,28,.15); }"+
      /* 3D button push depth */
      ".ij-3d-btn { transform-style:preserve-3d; transition:transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease; }"+
      ".ij-3d-btn:hover { transform:translateY(-2px) translateZ(6px); box-shadow:0 10px 24px rgba(10,5,3,.35), 0 0 0 1px rgba(184,71,28,.25); }"+
      ".ij-3d-btn:active { transform:translateY(1px) translateZ(0); box-shadow:0 2px 6px rgba(10,5,3,.4); }"+
      /* 3D parallax child layer — use data-depth="0-1" for magnitude */
      ".ij-3d-parallax { transition:transform .5s cubic-bezier(.22,1,.36,1); }"+

      "@media (prefers-reduced-motion: reduce) {"+
        ".ij-grain-host::before,.ij-grain-host::after { animation:none; }"+
        "#ij-cinema-leak-a,#ij-cinema-leak-b,#ij-cinema-leak-c,#ij-cinema-flare,#ij-cinema-scratch,#ij-cinema-scratch2 { animation:none; opacity:0 !important; }"+
        "#ij-cinema-noise,#ij-cinema-dust { animation:none; }"+
        ".ij-hoverlink:hover .ij-ltr { animation:none; }"+
        ".ij-3d,.ij-3d-lift,.ij-3d-btn { transform:none !important; }"+
      "}"+
      /* Hide film scratches on mobile — they read as visual noise at small sizes */
      "@media (max-width: 768px) {"+
        "#ij-cinema-scratch,#ij-cinema-scratch2 { display:none !important; }"+
      "}"+

      /* ── TEXT REVEAL ──────────────────────────────────────────────────── */
      '.ij-reveal-word { display: inline-block; overflow: hidden; vertical-align: bottom; }'+
      '.ij-reveal-word > span { display: inline-block; transform: translateY(110%); opacity: 0;'+
        'transition: transform .9s cubic-bezier(.2,.8,.2,1), opacity .9s ease; }'+
      '.ij-reveal-word.is-in > span { transform: translateY(0); opacity: 1; }'+
      /* Underline draw */
      '.ij-link-u { position: relative; }'+
      '.ij-link-u::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px;'+
        'height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right center;'+
        'transition: transform .45s cubic-bezier(.65,.05,.36,1); }'+
      '.ij-link-u:hover::after, .ij-link-u:focus-visible::after { transform: scaleX(1); transform-origin: left center; }'+
      /* Book tilt + magnetic */
      '.ij-tilt { transform-style: preserve-3d; transition: transform .4s cubic-bezier(.22,1,.36,1); will-change: transform; }'+
      '.ij-magnetic { transition: transform .4s cubic-bezier(.22,1,.36,1); }';

    var s = document.createElement('style');
    s.id = 'ij-anim-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ─── 2. HERO TEXT REVEAL ──────────────────────────────────────────────────
  function splitHeadingWords(el) {
    if (el.__ijSplit) return;
    el.__ijSplit = true;
    function walk(node, host, delayBase) {
      var idx = delayBase || 0;
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) { host.appendChild(document.createTextNode(part)); return; }
            var wrap = document.createElement('span'); wrap.className = 'ij-reveal-word';
            var inner = document.createElement('span'); inner.textContent = part;
            inner.style.transitionDelay = (idx * 70) + 'ms';
            wrap.appendChild(inner); host.appendChild(wrap); idx++;
          });
        } else if (child.nodeType === 1) {
          var clone = child.cloneNode(false); host.appendChild(clone);
          idx = walk(child, clone, idx);
        }
      });
      return idx;
    }
    var wrapDiv = document.createElement('div');
    walk(el, wrapDiv, 0);
    el.innerHTML = '';
    while (wrapDiv.firstChild) el.appendChild(wrapDiv.firstChild);
  }

  function setupReveals() {
    var targets = document.querySelectorAll('.hero-h1, .hero-h, .essays-hero-h, .newsletter-h, .books-hero-h');
    if (!targets.length) return;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        splitHeadingWords(e.target);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          e.target.querySelectorAll('.ij-reveal-word').forEach(function(w){ w.classList.add('is-in'); });
        }); });
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    targets.forEach(function(t){ obs.observe(t); });
  }

  // ─── 3. MAGNETIC BUTTONS ─────────────────────────────────────────────────
  function setupMagnetic() {
    if (!FINE || REDUCED) return;
    document.querySelectorAll('a[href]:not(nav *), button').forEach(function(b){
      var rect = b.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 28) return;
      if (!(b.textContent || '').trim()) return;
      var cs = getComputedStyle(b);
      if (!(cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') && parseFloat(cs.borderTopWidth) < 1) return;
      if (b.__ijMag) return; b.__ijMag = true;
      b.classList.add('ij-magnetic');
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX-(r.left+r.width/2))*.28).toFixed(1) + 'px,' + ((e.clientY-(r.top+r.height/2))*.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  // ─── 4. BOOK COVER 3D TILT ───────────────────────────────────────────────
  function setupTilt() {
    if (!FINE || REDUCED) return;
    document.querySelectorAll('.book-cover').forEach(function(c){
      if (c.__ijTilt) return; c.__ijTilt = true;
      c.classList.add('ij-tilt');
      var base = (getComputedStyle(c).transform !== 'none') ? getComputedStyle(c).transform + ' ' : '';
      c.addEventListener('mousemove', function(e){
        var r = c.getBoundingClientRect();
        c.style.transform = base + 'perspective(1200px) rotateX(' + (-(e.clientY-(r.top+r.height/2))/r.height*10).toFixed(2) + 'deg) rotateY(' + ((e.clientX-(r.left+r.width/2))/r.width*12).toFixed(2) + 'deg) translateZ(4px)';
      });
      c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
    });
  }

  // ─── 5. NAV/FOOTER UNDERLINE DRAW ────────────────────────────────────────
  function setupUnderlines() {
    document.querySelectorAll('nav a, footer a').forEach(function(l){
      if (l.__ijU || !l.textContent.trim() || l.querySelector('svg,img')) return;
      l.__ijU = true; l.classList.add('ij-link-u');
    });
  }

  // ─── 6. CURSOR SPOTLIGHT ──────────────────────────────────────────────────
  function setupSpotlight() {
    if (!FINE || REDUCED) return;
    document.querySelectorAll('.book-cover,.featured-card,.daily-meta-left,.essays-list-row,[data-spotlight]').forEach(function(n){
      if (n.__ijSpot) return; n.__ijSpot = true;
      n.classList.add('ij-spotlight');
      n.addEventListener('mousemove', function(e){
        var r = n.getBoundingClientRect();
        n.style.setProperty('--ij-mx', ((e.clientX-r.left)/r.width*100)+'%');
        n.style.setProperty('--ij-my', ((e.clientY-r.top)/r.height*100)+'%');
      });
    });
  }

  // ─── 7. FILM GRAIN ON DARK SECTIONS ──────────────────────────────────────
  function setupGrain() {
    if (REDUCED) return;
    document.querySelectorAll('section, footer, .ij-grain-candidate').forEach(function(n){
      if (n.__ijGrain) return;
      var bg = getComputedStyle(n).backgroundColor;
      var m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) return;
      var p = m[1].split(',').map(parseFloat);
      if (p.length < 3) return;
      var lum = (0.299*p[0] + 0.587*p[1] + 0.114*p[2]) / 255;
      if (lum < 0.22 && (p[3] === undefined || p[3] > 0.5)) {
        n.__ijGrain = true; n.classList.add('ij-grain-host');
      }
    });
  }

  // ─── 8a. HOVERPEEK LINK PREVIEW ───────────────────────────────────────────
  // Static metadata map — site links → preview card content
  var PEEK_MAP = {
    '/daily.html':    { kicker:'Daily devotional', title:'Three minutes. One question. Every morning.', desc:'Short, honest readings on grace, work, and the unglamorous middle.', img:'/og/daily.png' },
    '/essays.html':   { kicker:'Essays',           title:'Longer reads on faith and work', desc:'Essays on rebuilding, freelancing, and the long way home.', img:'/og/essays.png' },
    '/books.html':    { kicker:'Books',            title:'Two books by Ian James', desc:'A memoir on grace and a freelancing guide on identity beyond your paycheck.', img:'/og/books.png' },
    '/book-you-are-not-finished.html': { kicker:'Memoir', title:'You Are Not Finished', desc:'Grace, grit, and the long way home. A memoir on rebuilding.', img:'/og/book-you-are-not-finished.png' },
    '/book-you-are-not-your-paycheck.html': { kicker:'Freelancing guide', title:'You Are Not Your Paycheck', desc:'On identity, work, and the number that was never yours.', img:'/og/book-you-are-not-your-paycheck.png' },
    '/newsletter.html':{kicker:'Weekly letter',    title:'The Sunday letter', desc:'One honest note a week. Short, honest, hard to fake.', img:'/og/newsletter.png' },
    '/about.html':    { kicker:'About',            title:'Ian James Ormo', desc:'Writer from the Philippines. Memoir, devotionals, essays.', img:'/og/about.png' },
    '/contact.html':  { kicker:'Contact',          title:'Get in touch', desc:'For speaking, press, or a real conversation.', img:'/og/contact.png' },
  };

  function getPeekData(href) {
    if (!href) return null;
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      var path = u.pathname.replace(/\/$/, '') || '/';
      if (path === '/' || path === '/index.html') return { kicker:'Home', title:'Ian James Ormo', desc:'Self-help author and freelance writer from the Philippines.', img:'/og/default-site.png' };
      return PEEK_MAP[path] || PEEK_MAP[path + '.html'] || null;
    } catch (e) { return null; }
  }

  function setupHoverPeek() {
    if (!FINE || REDUCED) return;
    // Build the peek element once
    var peek = document.getElementById('ij-peek');
    if (!peek) {
      peek = document.createElement('div');
      peek.id = 'ij-peek';
      peek.setAttribute('aria-hidden', 'true');
      peek.innerHTML =
        '<div class="peek-img"></div>'+
        '<div class="peek-body">'+
          '<p class="peek-kicker"></p>'+
          '<h4 class="peek-title"></h4>'+
          '<p class="peek-desc"></p>'+
        '</div>';
      document.body.appendChild(peek);
    }
    var imgEl = peek.querySelector('.peek-img');
    var kickerEl = peek.querySelector('.peek-kicker');
    var titleEl = peek.querySelector('.peek-title');
    var descEl  = peek.querySelector('.peek-desc');
    var hideTimer, showTimer;

    function position(e) {
      var pad = 16;
      var w = peek.offsetWidth, h = peek.offsetHeight;
      var x = e.clientX + pad, y = e.clientY + pad;
      if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
      if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
      peek.style.left = Math.max(8, x) + 'px';
      peek.style.top  = Math.max(8, y) + 'px';
    }

    function show(data, e) {
      kickerEl.textContent = data.kicker || '';
      titleEl.textContent  = data.title || '';
      descEl.textContent   = data.desc || '';
      imgEl.style.backgroundImage = data.img ? 'url("' + data.img + '")' : '';
      position(e);
      clearTimeout(hideTimer);
      showTimer = setTimeout(function(){ peek.classList.add('is-on'); }, 180);
    }
    function hide() {
      clearTimeout(showTimer);
      hideTimer = setTimeout(function(){ peek.classList.remove('is-on'); }, 80);
    }

    document.querySelectorAll('a[href]').forEach(function(a){
      if (a.__ijPeek) return;
      // Skip nav/footer anchors (they have letter-hover) and anchors inside buttons
      if (a.closest('nav') || a.closest('footer')) return;
      if (!a.textContent.trim() && !a.querySelector('img')) return;
      var data = getPeekData(a.getAttribute('href'));
      if (!data) return;
      a.__ijPeek = true;
      a.addEventListener('mouseenter', function(e){ show(data, e); });
      a.addEventListener('mousemove', function(e){ position(e); });
      a.addEventListener('mouseleave', hide);
    });
  }

  // ─── 8b. INTERACTIVE HOVER LETTER LINKS ───────────────────────────────────
  function setupHoverLinks() {
    if (REDUCED) return;
    // Apply to nav links, footer links, and hero kickers
    var links = document.querySelectorAll('nav a, footer a, .hero-kicker');
    links.forEach(function(l){
      if (l.__ijHL) return;
      var txt = (l.textContent || '').trim();
      if (!txt || l.querySelector('svg, img')) return;
      l.__ijHL = true;
      l.classList.add('ij-hoverlink');
      // Wrap each char in a span with a stagger delay
      var walkText = function(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function(ch){
          if (ch.nodeType === 3) {
            var frag = document.createDocumentFragment();
            var chars = ch.textContent.split('');
            chars.forEach(function(c, i){
              if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
              var span = document.createElement('span');
              span.className = 'ij-ltr';
              span.textContent = c;
              span.style.animationDelay = (i * 35) + 'ms';
              frag.appendChild(span);
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1 && !ch.classList.contains('ij-ltr')) {
            walkText(ch);
          }
        });
      };
      walkText(l);
    });
  }

  // ─── 8c. EXTENDED 3D EFFECTS ──────────────────────────────────────────────
  function setup3DTilt() {
    if (!FINE || REDUCED) return;
    // Richer tilt on cards, featured sections, theme cells
    var sel = '.featured-card, .themes-cell, .essays-list-row, .daily-meta-left, [data-tilt]';
    document.querySelectorAll(sel).forEach(function(n){
      if (n.__ij3D) return; n.__ij3D = true;
      n.classList.add('ij-3d');
      var inner = n.querySelector('.ij-3d-inner') || n;
      n.addEventListener('mousemove', function(e){
        var r = n.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width/2)) / r.width;   // -0.5..0.5
        var y = (e.clientY - (r.top + r.height/2)) / r.height;
        var rx = (-y * 7).toFixed(2);
        var ry = (x * 9).toFixed(2);
        n.style.transform = 'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
        n.style.boxShadow = '0 ' + (14 + Math.abs(y)*12).toFixed(0) + 'px ' + (34 + Math.abs(x)*12).toFixed(0) + 'px rgba(10,5,3,.22)';
        // Parallax children
        n.querySelectorAll('[data-depth]').forEach(function(c){
          var d = parseFloat(c.getAttribute('data-depth')) || 0.4;
          c.style.transform = 'translate3d(' + (-x*d*20).toFixed(1) + 'px,' + (-y*d*20).toFixed(1) + 'px,0)';
        });
      });
      n.addEventListener('mouseleave', function(){
        n.style.transform = '';
        n.style.boxShadow = '';
        n.querySelectorAll('[data-depth]').forEach(function(c){ c.style.transform = ''; });
      });
    });
  }

  function setup3DButtons() {
    if (REDUCED) return;
    document.querySelectorAll('a[href], button').forEach(function(b){
      if (b.__ij3DB) return;
      var r = b.getBoundingClientRect();
      if (r.width < 80 || r.height < 28) return;
      var cs = getComputedStyle(b);
      var isBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
      var isBorder = parseFloat(cs.borderTopWidth) >= 1;
      if (!isBg && !isBorder) return;
      if (b.closest('nav')) return;
      b.__ij3DB = true;
      b.classList.add('ij-3d-btn');
    });
  }

  // ─── 8. GLOBAL CINEMATIC OVERLAY ──────────────────────────────────────────
  function setupCinemaOverlay() {
    if (REDUCED || document.getElementById('ij-cinema-vignette')) return;

    var els = [
      { id: 'ij-cinema-paper'    },
      { id: 'ij-cinema-tint'     },
      { id: 'ij-cinema-vignette' },
      { id: 'ij-cinema-leak-a'   },
      { id: 'ij-cinema-leak-b'   },
      { id: 'ij-cinema-leak-c'   },
      { id: 'ij-cinema-flare'    },
      { id: 'ij-cinema-scratch'  },
      { id: 'ij-cinema-scratch2' },
      { id: 'ij-cinema-noise'    },
      { id: 'ij-cinema-dust'     },
    ];

    els.forEach(function(e){
      var d = document.createElement('div');
      d.id = e.id;
      d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d);
    });
  }

  // ─── INIT ──────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    setupCinemaOverlay();
    setupReveals();
    // Re-run mount-dependent setups as React hydrates. Most sites stabilize by 3s.
    // Use a MutationObserver to short-circuit the timer once DOM quiets down.
    var tries = 0, MAX = 8, lastCount = -1, stable = 0;
    function run() {
      setupMagnetic();
      setupTilt();
      setupUnderlines();
      setupSpotlight();
      setupGrain();
      setupHoverPeek();
      setupHoverLinks();
      setup3DTilt();
      setup3DButtons();
      // Stop early once DOM is stable (anchor count unchanged for 2 passes)
      var count = document.querySelectorAll('a,button,section').length;
      if (count === lastCount) { if (++stable >= 2) return; } else { stable = 0; lastCount = count; }
      if (++tries < MAX) setTimeout(run, 400);
    }
    run();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
