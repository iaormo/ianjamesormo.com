// cursor.js — copper arrow-tip cursor with a highlighter trail.
// Every element the arrow passes over briefly lights up in copper, then fades.
// GPU-composited, smooth. Disabled on touch/coarse-pointer devices.
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
  if (window.__ijCursorInit) return;
  window.__ijCursorInit = true;
  // Skip inside HoverPeek iframe previews
  if (/[?&]peek=1\b/.test(location.search) || window.self !== window.top) return;

  var COPPER = '#B8471C';
  var COPPER_RGB = '184,71,28';

  function injectStyles() {
    var css = ''+
      /* Hide the native cursor everywhere — our arrow takes over */
      'html, body { cursor: none !important; }'+
      'a, button, [data-verse], .ij-verse-link, input, textarea, select, [role="button"], .book-cover, label { cursor: none !important; }'+

      /* The arrow itself — fixed, top-layer, GPU-composited, anchored at its tip */
      '.ij-arrow {'+
        'position: fixed; top: 0; left: 0; width: 22px; height: 28px;'+
        'pointer-events: none; z-index: 2147483647;'+
        'will-change: transform; backface-visibility: hidden;'+
        'transform: translate3d(-9999px,-9999px,0);'+
        'filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)) drop-shadow(0 0 6px rgba('+COPPER_RGB+',.45));'+
        'transition: transform .12s cubic-bezier(.22,1,.36,1), filter .2s ease;'+
      '}'+
      '.ij-arrow svg { width: 100%; height: 100%; display: block; overflow: visible; }'+

      /* Hover state on interactive elements: arrow tilts a touch + glows brighter */
      '.ij-arrow.is-hover { filter: drop-shadow(0 1px 2px rgba(0,0,0,.4)) drop-shadow(0 0 12px rgba('+COPPER_RGB+',.85)); }'+

      /* Mouse-down: arrow contracts slightly */
      '.ij-arrow.is-down  { transform-origin: 2px 2px; }'+

      /* Text-input state: morph to a slim I-beam */
      '.ij-arrow.is-text { width: 4px; height: 22px; filter: drop-shadow(0 0 4px rgba('+COPPER_RGB+',.8)); }'+
      '.ij-arrow.is-text svg { display: none; }'+
      '.ij-arrow.is-text::before {'+
        'content: ""; position: absolute; inset: 0;'+
        'background: linear-gradient(180deg, '+COPPER+', '+COPPER+');'+
        'border-radius: 1px;'+
      '}'+

      /* The highlight that gets stamped onto whatever the arrow passes over.
         Applied via inline outline + box-shadow so we never disturb layout
         and never break inherited backgrounds. Fades out gracefully. */
      '.ij-mark-on {'+
        'background-color: rgba('+COPPER_RGB+',.18) !important;'+
        'box-shadow: inset 0 -0.12em 0 rgba('+COPPER_RGB+',.55), 0 0 0 1px rgba('+COPPER_RGB+',.18) !important;'+
        'transition: background-color .35s ease, box-shadow .45s ease !important;'+
        'border-radius: 2px;'+
      '}'+
      '.ij-mark-fade {'+
        'background-color: rgba('+COPPER_RGB+',0) !important;'+
        'box-shadow: inset 0 -0.12em 0 rgba('+COPPER_RGB+',0), 0 0 0 1px rgba('+COPPER_RGB+',0) !important;'+
        'transition: background-color .9s ease, box-shadow 1.1s ease !important;'+
      '}'+

      /* Reduced motion — drop the glow animation, keep functionality */
      '@media (prefers-reduced-motion: reduce) {'+
        '.ij-arrow { transition: none; }'+
        '.ij-mark-on, .ij-mark-fade { transition: none !important; }'+
      '}';
    var s = document.createElement('style'); s.id = 'ij-cursor-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();

    // Build the arrow — angular, pen-nib styled, copper fill, dark outline
    var arrow = document.createElement('div');
    arrow.className = 'ij-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML =
      '<svg viewBox="0 0 22 28">'+
        '<path d="M2 2 L2 22 L7.5 17.5 L11 25 L14 24 L10.5 16.5 L18 16 Z" '+
          'fill="'+COPPER+'" stroke="#1a0d06" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/>'+
      '</svg>';
    document.body.appendChild(arrow);

    var tx = -9999, ty = -9999;
    var hasMoved = false;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      hasMoved = true;
    }, { passive: true });
    window.addEventListener('mousedown', function () { arrow.classList.add('is-down'); });
    window.addEventListener('mouseup',   function () { arrow.classList.remove('is-down'); });

    // Hover/text-input state for the arrow itself
    var INTERACTIVE = 'a, button, [role="button"], [data-verse], .book-cover, input[type="submit"], input[type="button"]';
    var TEXT_INPUT  = 'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea';
    var current = null;
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest ? e.target.closest(INTERACTIVE + ',' + TEXT_INPUT) : null;
      if (el === current) return;
      current = el;
      arrow.classList.remove('is-hover', 'is-text');
      if (!el) return;
      if (el.matches && el.matches(TEXT_INPUT)) arrow.classList.add('is-text');
      else arrow.classList.add('is-hover');
    });

    // ——— Highlighter trail ———
    // On every animation frame, find the deepest element under the cursor.
    // Apply a copper highlight class. When the cursor leaves that element,
    // swap to a "fade" class so the highlight gracefully transitions back out.
    // Self-cleans after 1.2s so we never accumulate dead state.

    // Tag selectors we never want to highlight (would visually swallow the page).
    var SKIP = { HTML:1, BODY:1, MAIN:1, SECTION:1, HEADER:1, FOOTER:1, NAV:1, ARTICLE:1, ASIDE:1 };

    var lastEl = null;
    var fadeTimers = new WeakMap();

    function fadeOut(el) {
      if (!el) return;
      el.classList.remove('ij-mark-on');
      el.classList.add('ij-mark-fade');
      // Clean up after the transition finishes so we don't leave attributes lying around
      var t = setTimeout(function () {
        el.classList.remove('ij-mark-fade');
        fadeTimers.delete(el);
      }, 1200);
      fadeTimers.set(el, t);
    }

    function highlight(el) {
      if (!el || el === lastEl) return;
      // Skip whole-page containers
      if (SKIP[el.tagName]) {
        if (lastEl) { fadeOut(lastEl); lastEl = null; }
        return;
      }
      // Skip our own cursor element
      if (el.classList && el.classList.contains('ij-arrow')) return;

      // Cancel any pending fade-cleanup on the new target
      var pending = fadeTimers.get(el);
      if (pending) { clearTimeout(pending); fadeTimers.delete(el); }
      el.classList.remove('ij-mark-fade');
      el.classList.add('ij-mark-on');

      // Fade out the previous one
      if (lastEl && lastEl !== el) fadeOut(lastEl);
      lastEl = el;
    }

    // Throttle elementFromPoint to ~30fps — plenty smooth, half the work
    var lastSampleAt = 0;
    function tick(now) {
      arrow.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
      if (hasMoved && now - lastSampleAt > 33) {
        lastSampleAt = now;
        var el = document.elementFromPoint(tx, ty);
        highlight(el);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Clear highlight when the cursor leaves the window entirely
    document.addEventListener('mouseleave', function () {
      if (lastEl) { fadeOut(lastEl); lastEl = null; }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
