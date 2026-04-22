// animations.js — curated 21st.dev-style premium animations:
//   1. Hero text reveal (split into words, fade + slide up, stagger)
//   2. Magnetic buttons (subtle pull toward cursor)
//   3. Book cover 3D tilt following pointer
//   4. Animated underline draw on nav + footer links
// All are no-op on prefers-reduced-motion or coarse pointer for items that need pointer.
(function () {
  if (window.__ijAnimInit) return;
  window.__ijAnimInit = true;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // ─── 1. TEXT REVEAL ON HERO HEADINGS ─────────────────────────────────────
  function injectStyles() {
    var css = ''+
      /* ── CURSOR-FOLLOWING SPOTLIGHT on cards & sections ──────────────── */
      '.ij-spotlight { position: relative; overflow: hidden; }'+
      '.ij-spotlight::before { content:""; position:absolute; inset:0; pointer-events:none;'+
        'background: radial-gradient(420px circle at var(--ij-mx,50%) var(--ij-my,50%),'+
          'rgba(184,71,28,.22) 0%, rgba(184,71,28,.08) 30%, transparent 55%);'+
        'opacity: 0; transition: opacity .45s ease; z-index: 1; mix-blend-mode: screen; }'+
      '.ij-spotlight:hover::before { opacity: 1; }'+
      '.ij-spotlight > * { position: relative; z-index: 2; }'+
      /* Subtle border highlight that tracks the cursor — a thin copper ring */
      '.ij-spotlight::after { content:""; position:absolute; inset:-1px; pointer-events:none;'+
        'border-radius: inherit;'+
        'background: radial-gradient(200px circle at var(--ij-mx,50%) var(--ij-my,50%),'+
          'rgba(184,71,28,.45), transparent 60%);'+
        '-webkit-mask: linear-gradient(#000,#000) content-box, linear-gradient(#000,#000);'+
        '-webkit-mask-composite: xor; mask-composite: exclude;'+
        'padding: 1px; opacity: 0; transition: opacity .4s ease; z-index: 3; }'+
      '.ij-spotlight:hover::after { opacity: 1; }'+
      /* ── SHARE ICON HOVER ANIMATIONS ─────────────────────────────────── */
      '.ij-share-btn { position: relative; overflow: hidden; isolation: isolate;'+
        'transition: color .3s cubic-bezier(.22,1,.36,1), border-color .3s ease, transform .35s cubic-bezier(.22,1,.36,1); }'+
      '.ij-share-btn svg { position: relative; z-index: 2; transition: transform .4s cubic-bezier(.22,1,.36,1); }'+
      '.ij-share-btn::before { content: ""; position: absolute; inset: 0; background: #B8471C;'+
        'transform: translateY(100%); transition: transform .45s cubic-bezier(.22,1,.36,1); z-index: 1; }'+
      '.ij-share-btn:hover { color: #FAF7F2 !important; border-color: #B8471C !important; transform: translateY(-2px); }'+
      '.ij-share-btn:hover::before { transform: translateY(0); }'+
      '.ij-share-btn:hover svg { transform: scale(1.12) rotate(-4deg); }'+
      '.ij-share-btn:active { transform: translateY(0); }'+
      /* ── FILM GRAIN + CINEMATIC BURN on dark sections ─────────────────── */
      ".ij-grain-host { position: relative; isolation: isolate; }"+
      /* Animated film grain */
      ".ij-grain-host::before { content:''; position:absolute; inset:-10%; pointer-events:none; z-index:1; opacity:.10;"+
        "background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .65 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\");"+
        "mix-blend-mode: overlay; animation: ij-grain 1.05s steps(5) infinite, ij-flicker 6s ease-in-out infinite; }"+
      /* Cinematic burn: warm vignette + edge glow + sweeping burn flare */
      ".ij-grain-host::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:1;"+
        "background: radial-gradient(ellipse at center, transparent 32%, rgba(10,6,4,.45) 75%, rgba(3,2,1,.82) 100%),"+
                    "radial-gradient(900px circle at 85% 8%, rgba(184,71,28,.28) 0%, transparent 55%),"+
                    "radial-gradient(700px circle at 15% 95%, rgba(184,71,28,.15) 0%, transparent 50%),"+
                    "linear-gradient(115deg, transparent 45%, rgba(255,180,120,.06) 52%, transparent 58%);"+
        "mix-blend-mode: screen; animation: ij-burn 14s ease-in-out infinite; }"+
      ".ij-grain-host > * { position: relative; z-index: 2; }"+
      "@keyframes ij-grain {"+
        "0%   { transform: translate(0,0); }"+
        "20%  { transform: translate(-4%,2%); }"+
        "40%  { transform: translate(3%,-3%); }"+
        "60%  { transform: translate(-2%,4%); }"+
        "80%  { transform: translate(4%,-1%); }"+
        "100% { transform: translate(0,0); }"+
      "}"+
      "@keyframes ij-flicker {"+
        "0%,100% { opacity: .10; }"+
        "43% { opacity: .13; }"+
        "47% { opacity: .08; }"+
        "50% { opacity: .15; }"+
        "53% { opacity: .09; }"+
        "72% { opacity: .12; }"+
        "75% { opacity: .07; }"+
      "}"+
      "@keyframes ij-burn {"+
        "0%,100% { filter: brightness(1) hue-rotate(0deg); }"+
        "45%     { filter: brightness(1.08) hue-rotate(-3deg); }"+
      "}"+
      "@media (prefers-reduced-motion: reduce) {"+
        ".ij-grain-host::before, .ij-grain-host::after { animation: none; }"+
      "}"+
      /* ── EXISTING ANIMATIONS ─────────────────────────────────────────── */
      '.ij-reveal-word { display: inline-block; overflow: hidden; vertical-align: bottom; }'+
      '.ij-reveal-word > span { display: inline-block; transform: translateY(110%); opacity: 0;'+
        'transition: transform .9s cubic-bezier(.2,.8,.2,1), opacity .9s ease; }'+
      '.ij-reveal-word.is-in > span { transform: translateY(0); opacity: 1; }'+
      /* Animated underline for nav + footer links */
      '.ij-link-u { position: relative; }'+
      '.ij-link-u::after { content: ""; position: absolute; left: 0; right: 0; bottom: -4px;'+
        'height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right center;'+
        'transition: transform .45s cubic-bezier(.65,.05,.36,1); }'+
      '.ij-link-u:hover::after, .ij-link-u:focus-visible::after { transform: scaleX(1); transform-origin: left center; }'+
      /* Book cover tilt wrapper */
      '.ij-tilt { transform-style: preserve-3d; transition: transform .4s cubic-bezier(.22,1,.36,1); will-change: transform; }'+
      /* Magnetic buttons keep a transition so the release is smooth */
      '.ij-magnetic { transition: transform .4s cubic-bezier(.22,1,.36,1); }';
    var s = document.createElement('style'); s.id = 'ij-anim-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  function splitHeadingWords(el) {
    if (el.__ijSplit) return;
    el.__ijSplit = true;
    // Recursive word-split that preserves nested spans and their styles
    function walk(node, host, delayBase) {
      var idx = delayBase || 0;
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if (child.nodeType === 3) {
          var txt = child.textContent;
          var parts = txt.split(/(\s+)/);
          parts.forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) {
              host.appendChild(document.createTextNode(part));
            } else {
              var wrap = document.createElement('span');
              wrap.className = 'ij-reveal-word';
              var inner = document.createElement('span');
              inner.textContent = part;
              inner.style.transitionDelay = (idx * 70) + 'ms';
              wrap.appendChild(inner);
              host.appendChild(wrap);
              idx++;
            }
          });
        } else if (child.nodeType === 1) {
          // Clone the element shell (preserve class + inline style), recurse its children
          var clone = child.cloneNode(false);
          host.appendChild(clone);
          idx = walk(child, clone, idx);
        }
      });
      return idx;
    }
    var holder = document.createDocumentFragment();
    var wrapDiv = document.createElement('div');
    walk(el, wrapDiv, 0);
    holder.appendChild(wrapDiv);
    el.innerHTML = '';
    while (wrapDiv.firstChild) el.appendChild(wrapDiv.firstChild);
  }

  function activateReveal(el) {
    var words = el.querySelectorAll('.ij-reveal-word');
    words.forEach(function(w){ w.classList.add('is-in'); });
  }

  function setupReveals() {
    // Target the big hero headings across pages
    var targets = document.querySelectorAll('.hero-h1, .hero-h, .essays-hero-h, .newsletter-h, .books-hero-h');
    if (!targets.length) return;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          splitHeadingWords(e.target);
          // Next frame so the split DOM gets its initial off-state applied
          requestAnimationFrame(function(){ requestAnimationFrame(function(){ activateReveal(e.target); }); });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach(function(t){ obs.observe(t); });
  }

  // ─── 2. MAGNETIC BUTTONS ─────────────────────────────────────────────────
  function setupMagnetic() {
    if (!FINE || REDUCED) return;
    var btns = document.querySelectorAll('a[href]:not(nav *), button');
    btns.forEach(function(b){
      // Skip tiny or non-primary elements. Only apply to .btn-like candidates:
      // buttons with padding (solid/ghost CTAs)
      var rect = b.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 28) return;
      var text = (b.textContent || '').trim();
      if (!text) return;
      // Only treat as magnetic if it has visible background or border styling (CTA-like)
      var cs = getComputedStyle(b);
      var bg = cs.backgroundColor;
      var border = cs.borderTopWidth;
      var isCta = (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || parseFloat(border) >= 1;
      if (!isCta) return;
      if (b.__ijMag) return; b.__ijMag = true;
      b.classList.add('ij-magnetic');
      var strength = 0.28;
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width/2);
        var y = e.clientY - (r.top + r.height/2);
        b.style.transform = 'translate(' + (x*strength).toFixed(1) + 'px,' + (y*strength).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  // ─── 3. BOOK COVER 3D TILT ───────────────────────────────────────────────
  function setupTilt() {
    if (!FINE || REDUCED) return;
    var covers = document.querySelectorAll('.book-cover');
    covers.forEach(function(c){
      if (c.__ijTilt) return; c.__ijTilt = true;
      c.classList.add('ij-tilt');
      var baseTransform = getComputedStyle(c).transform;
      var base = (baseTransform && baseTransform !== 'none') ? baseTransform + ' ' : '';
      c.addEventListener('mousemove', function(e){
        var r = c.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width/2)) / r.width;   // -0.5..0.5
        var y = (e.clientY - (r.top + r.height/2)) / r.height;
        var rx = (-y * 10).toFixed(2);
        var ry = (x * 12).toFixed(2);
        c.style.transform = base + 'perspective(1200px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(4px)';
      });
      c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
    });
  }

  // ─── 4. NAV / FOOTER LINK UNDERLINE DRAW ─────────────────────────────────
  function setupUnderlines() {
    var links = document.querySelectorAll('nav a, footer a');
    links.forEach(function(l){
      if (l.__ijU) return; l.__ijU = true;
      // Skip hamburger, logos, icon-only links
      if (!l.textContent || !l.textContent.trim()) return;
      if (l.querySelector('svg, img')) return;
      l.classList.add('ij-link-u');
    });
  }

  // ─── 5. CURSOR-TRACKING SPOTLIGHT on cards / covers / interactive panels ──
  function setupSpotlight() {
    if (!FINE || REDUCED) return;
    // Candidates: book covers, featured card, filter buttons, share buttons, daily card, CTA buttons
    var sel = '.book-cover, .featured-card, .daily-meta-left, .essays-list-row, [data-spotlight]';
    var nodes = document.querySelectorAll(sel);
    nodes.forEach(function(n){
      if (n.__ijSpot) return;
      n.__ijSpot = true;
      n.classList.add('ij-spotlight');
      n.addEventListener('mousemove', function(e){
        var r = n.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        n.style.setProperty('--ij-mx', x + '%');
        n.style.setProperty('--ij-my', y + '%');
      });
    });
  }

  // ─── 6. CINEMATIC FILM GRAIN ON DARK SECTIONS ─────────────────────────────
  function setupGrain() {
    if (REDUCED) return;
    // Find sections/footers whose computed background is dark (luminance < 0.22)
    var nodes = document.querySelectorAll('section, footer, .ij-grain-candidate');
    nodes.forEach(function(n){
      if (n.__ijGrain) return;
      var bg = getComputedStyle(n).backgroundColor;
      var m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) return;
      var parts = m[1].split(',').map(function(x){ return parseFloat(x); });
      if (parts.length < 3) return;
      var lum = (0.299*parts[0] + 0.587*parts[1] + 0.114*parts[2]) / 255;
      if (lum < 0.22 && (parts[3] === undefined || parts[3] > 0.5)) {
        n.__ijGrain = true;
        n.classList.add('ij-grain-host');
      }
    });
  }

  function init() {
    injectStyles();
    setupReveals();
    // React apps mount after initial load; re-run these a few times
    var tries = 0;
    (function rerun(){
      setupMagnetic();
      setupTilt();
      setupUnderlines();
      setupSpotlight();
      setupGrain();
      if (++tries < 20) setTimeout(rerun, 500);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
