// cursor.js — animated target-reticle cursor. Outer ring + 4 tick marks + center dot.
// GPU-composited, smooth. Disabled on touch/coarse-pointer devices.
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
  if (window.__ijCursorInit) return;
  window.__ijCursorInit = true;

  var COPPER = '#B8471C';

  function injectStyles() {
    var css = ''+
      'html, body { cursor: none !important; }'+
      'a, button, [data-verse], .ij-verse-link, input, textarea, select, [role="button"], .book-cover, label { cursor: none !important; }'+

      /* Shared positioning */
      '.ij-tgt-dot, .ij-tgt-ring {'+
        'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 2147483647;'+
        'will-change: transform, opacity; backface-visibility: hidden;'+
        'transform: translate3d(-9999px,-9999px,0);'+
      '}'+

      /* Center dot — snappy tracker */
      '.ij-tgt-dot {'+
        'width: 6px; height: 6px; border-radius: 50%;'+
        'background: '+COPPER+';'+
        'box-shadow: 0 0 8px rgba(184,71,28,.55), 0 0 2px rgba(255,255,255,.4);'+
        'opacity: 0; transition: opacity .2s ease, width .18s ease, height .18s ease, background .2s ease;'+
      '}'+
      '.ij-tgt-dot.is-on { opacity: 1; }'+

      /* Target ring — outer with 4 tick marks, rotates + pulses */
      '.ij-tgt-ring {'+
        'width: 40px; height: 40px;'+
        'opacity: 0; transition: opacity .25s ease, width .28s cubic-bezier(.22,1,.36,1), height .28s cubic-bezier(.22,1,.36,1);'+
      '}'+
      '.ij-tgt-ring.is-on { opacity: 1; }'+

      /* SVG ring visuals — drawn via inline SVG child */
      '.ij-tgt-ring svg { width:100%; height:100%; overflow:visible;'+
        'animation: ij-tgt-spin 8s linear infinite, ij-tgt-pulse 2.2s ease-in-out infinite; }'+
      '.ij-tgt-ring circle { fill:none; stroke:'+COPPER+'; stroke-width:1.25; }'+
      '.ij-tgt-ring line   { stroke:'+COPPER+'; stroke-width:1.5; stroke-linecap:round; }'+

      '@keyframes ij-tgt-spin {'+
        '0%   { transform: rotate(0deg); }'+
        '100% { transform: rotate(360deg); }'+
      '}'+
      '@keyframes ij-tgt-pulse {'+
        '0%,100% { opacity: .85; }'+
        '50%     { opacity: 1; }'+
      '}'+

      /* Hover state: ring expands, dot grows */
      '.ij-tgt-ring.is-hover { width: 70px; height: 70px; }'+
      '.ij-tgt-ring.is-hover circle { stroke-width: 1.75; }'+
      '.ij-tgt-dot.is-hover  { width: 10px; height: 10px; }'+

      /* Mouse-down: contract */
      '.ij-tgt-ring.is-down { width: 28px; height: 28px; }'+
      '.ij-tgt-dot.is-down  { width: 4px; height: 4px; }'+

      /* Text-input state: thin vertical bar instead of circle */
      '.ij-tgt-ring.is-text { width: 3px; height: 26px; opacity: 0; }'+
      '.ij-tgt-dot.is-text  { width: 3px; height: 26px; border-radius: 1px; }'+

      /* Reduced motion: stop spin/pulse */
      '@media (prefers-reduced-motion: reduce) {'+
        '.ij-tgt-ring svg { animation: none; }'+
      '}';
    var s = document.createElement('style'); s.id = 'ij-cursor-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();

    var dot = document.createElement('div');
    dot.className = 'ij-tgt-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);

    var ring = document.createElement('div');
    ring.className = 'ij-tgt-ring';
    ring.setAttribute('aria-hidden', 'true');
    // Inline SVG: full circle + 4 tick marks at N/E/S/W
    ring.innerHTML =
      '<svg viewBox="-25 -25 50 50">'+
        '<circle cx="0" cy="0" r="19"/>'+
        '<line x1="0"  y1="-24" x2="0"  y2="-16"/>'+
        '<line x1="24" y1="0"   x2="16" y2="0"/>'+
        '<line x1="0"  y1="24"  x2="0"  y2="16"/>'+
        '<line x1="-24" y1="0"  x2="-16" y2="0"/>'+
      '</svg>';
    document.body.appendChild(ring);

    var tx = -9999, ty = -9999;
    var rx = -9999, ry = -9999;
    var dx = -9999, dy = -9999;
    var hasMoved = false;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        rx = tx; ry = ty;
        dx = tx; dy = ty;
        dot.classList.add('is-on');
        ring.classList.add('is-on');
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      dot.classList.remove('is-on'); ring.classList.remove('is-on');
    });
    window.addEventListener('mouseenter', function () {
      if (hasMoved) { dot.classList.add('is-on'); ring.classList.add('is-on'); }
    });
    window.addEventListener('mousedown', function () { dot.classList.add('is-down'); ring.classList.add('is-down'); });
    window.addEventListener('mouseup',   function () { dot.classList.remove('is-down'); ring.classList.remove('is-down'); });

    var INTERACTIVE = 'a, button, [role="button"], [data-verse], .book-cover, input[type="submit"], input[type="button"]';
    var TEXT_INPUT  = 'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea';
    var current = null;
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest ? e.target.closest(INTERACTIVE + ',' + TEXT_INPUT) : null;
      if (el === current) return;
      current = el;
      dot.classList.remove('is-hover', 'is-text');
      ring.classList.remove('is-hover', 'is-text');
      if (!el) return;
      if (el.matches && el.matches(TEXT_INPUT)) {
        dot.classList.add('is-text');
        ring.classList.add('is-text');
      } else {
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
      }
    });

    function tick() {
      // Dot snaps to cursor position directly (one-frame latency, feels instant)
      dx = tx; dy = ty;
      // Ring eases — snappier than before for "reticle acquiring" feel
      rx += (tx - rx) * 0.35;
      ry += (ty - ry) * 0.35;
      dot.style.transform  = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
