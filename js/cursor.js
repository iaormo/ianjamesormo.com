// cursor.js — premium custom cursor: precise copper dot + trailing outlined ring.
// Ring grows on interactive elements. Disabled on touch/coarse-pointer devices.
(function () {
  // Bail on touch / coarse pointer devices
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
  if (window.__ijCursorInit) return;
  window.__ijCursorInit = true;

  var COPPER = '#B8471C';

  function injectStyles() {
    var css = ''+
      'html, body { cursor: none !important; }'+
      'a, button, [data-verse], .ij-verse-link, input, textarea, select, [role="button"], .book-cover, label { cursor: none !important; }'+
      '.ij-cursor-dot, .ij-cursor-ring {'+
        'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 2147483647;'+
        'border-radius: 50%; transform: translate3d(-50%, -50%, 0);'+
        'will-change: transform, width, height, opacity;'+
        'mix-blend-mode: difference;'+
      '}'+
      '.ij-cursor-dot {'+
        'width: 6px; height: 6px; background: '+COPPER+';'+
        'transition: width .18s ease, height .18s ease, opacity .2s ease;'+
      '}'+
      '.ij-cursor-ring {'+
        'width: 34px; height: 34px; border: 1.5px solid '+COPPER+'; background: transparent;'+
        'transition: width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1),'+
                   'border-color .2s ease, opacity .25s ease, border-width .2s ease;'+
      '}'+
      '.ij-cursor-dot.is-hover { width: 10px; height: 10px; }'+
      '.ij-cursor-ring.is-hover { width: 60px; height: 60px; border-width: 2px; }'+
      '.ij-cursor-dot.is-down  { width: 4px; height: 4px; }'+
      '.ij-cursor-ring.is-down { width: 24px; height: 24px; border-width: 2px; }'+
      '.ij-cursor-dot.is-hidden, .ij-cursor-ring.is-hidden { opacity: 0; }'+
      '.ij-cursor-ring.is-text { width: 3px; height: 28px; border-radius: 1px; border-width: 0; background: '+COPPER+'; }'+
      /* Shadow under the dot in light sections to keep it visible */
      '@media (prefers-reduced-motion: reduce) {'+
        '.ij-cursor-ring { transition: opacity .2s ease; }'+
      '}';
    var s = document.createElement('style'); s.id = 'ij-cursor-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  var dot, ring;
  function init() {
    injectStyles();
    dot = document.createElement('div'); dot.className = 'ij-cursor-dot is-hidden';
    ring = document.createElement('div'); ring.className = 'ij-cursor-ring is-hidden';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var tx = -100, ty = -100;  // target
    var rx = -100, ry = -100;  // ring position (eased)
    var dx = -100, dy = -100;  // dot position (direct but rAF-batched)
    var hasMoved = false;

    function onMove(e) {
      tx = e.clientX; ty = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        rx = tx; ry = ty;
        dot.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
      }
    }
    function onEnter() { dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden'); }
    function onLeave() { dot.classList.add('is-hidden'); ring.classList.add('is-hidden'); }
    function onDown() { dot.classList.add('is-down'); ring.classList.add('is-down'); }
    function onUp()   { dot.classList.remove('is-down'); ring.classList.remove('is-down'); }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('blur', onLeave);

    // Hover detection via event delegation — grows ring over interactive elements
    var INTERACTIVE = 'a, button, [role="button"], [data-verse], .ij-verse-link, .book-cover, input[type="submit"], input[type="button"]';
    var TEXT_INPUT  = 'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea';
    var current = null;
    function handleOver(e) {
      var el = e.target.closest(INTERACTIVE + ',' + TEXT_INPUT);
      if (el === current) return;
      current = el;
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover', 'is-text');
      if (!el) return;
      if (el.matches(TEXT_INPUT)) {
        ring.classList.add('is-text');
      } else {
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
      }
    }
    document.addEventListener('mouseover', handleOver);

    // rAF loop: dot snaps, ring eases
    function tick() {
      dx += (tx - dx) * 0.9;
      dy += (ty - dy) * 0.9;
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      dot.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
