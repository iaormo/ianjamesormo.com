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

  function init() {
    injectStyles();
    setupReveals();
    // React apps mount after initial load; re-run these a few times
    var tries = 0;
    (function rerun(){
      setupMagnetic();
      setupTilt();
      setupUnderlines();
      if (++tries < 20) setTimeout(rerun, 500);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
