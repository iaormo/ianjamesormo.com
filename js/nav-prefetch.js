// nav-prefetch.js — buttery-smooth navigation:
//   1. On hover of an internal link, prefetch the destination HTML so click
//      serves from cache.
//   2. On click of an internal link, fade the body to opacity 0 and navigate,
//      eliminating the hard cut between pages.
//   3. On arrival, fade in smoothly.
(function () {
  if (window.__ijNavInit) return;
  window.__ijNavInit = true;
  // Skip click-fade + prefetch inside HoverPeek iframe previews
  if (/[?&]peek=1\b/.test(location.search) || window.self !== window.top) return;

  // ── 1. CLICK-FADE + PAGE-FADE-IN STYLES ─────────────────────────────────
  var style = document.createElement('style');
  style.id = 'ij-nav-css';
  style.textContent = ''+
    'html { scroll-behavior: smooth; }'+
    'body { transition: opacity .28s cubic-bezier(.22,1,.36,1); }'+
    'body.ij-nav-leaving { opacity: 0; }'+
    'body.ij-nav-entering { opacity: 0; }'+
    'body.ij-nav-entered  { opacity: 1; }';
  document.head.appendChild(style);

  // ── 2. FADE-IN ON PAGE LOAD ──────────────────────────────────────────────
  // Only fade if user arrived here via an internal-nav click on the previous
  // page (short timestamp stored in sessionStorage). Otherwise no fade-in so
  // first-visit feels instant.
  try {
    var t = Number(sessionStorage.getItem('__ij_nav_t') || 0);
    if (t && Date.now() - t < 2500) {
      document.body.classList.add('ij-nav-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.body.classList.remove('ij-nav-entering');
          document.body.classList.add('ij-nav-entered');
          sessionStorage.removeItem('__ij_nav_t');
        });
      });
    }
  } catch (e) { /* no session storage — skip */ }

  // ── 3. PREFETCH + CLICK-FADE INTERCEPT ──────────────────────────────────
  var prefetched = Object.create(null);

  function isInternalLink(a) {
    var href = a.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.indexOf('mailto:') === 0) return false;
    if (href.indexOf('tel:') === 0) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    // Cross-origin check
    if (a.origin && a.origin !== location.origin) return false;
    return true;
  }

  function prefetch(href) {
    if (!href || prefetched[href]) return;
    prefetched[href] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }

  // Prefetch on hover (desktop) and on touchstart (mobile)
  function onIntent(e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !isInternalLink(a)) return;
    // Skip same-page anchors
    if (a.pathname === location.pathname && a.hash) return;
    prefetch(a.href);
  }
  document.addEventListener('mouseover',   onIntent, { passive: true });
  document.addEventListener('touchstart',  onIntent, { passive: true });
  document.addEventListener('focusin',     onIntent, { passive: true });

  // Also prefetch visible internal links after idle (nav + footer)
  function prefetchVisible() {
    var links = document.querySelectorAll('nav a[href], footer a[href]');
    links.forEach(function (a) {
      if (!isInternalLink(a)) return;
      if (a.pathname === location.pathname) return;
      prefetch(a.href);
    });
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchVisible, { timeout: 2000 });
  } else {
    setTimeout(prefetchVisible, 1500);
  }

  // Click-fade: intercept internal nav clicks and fade before navigating
  var FADE_MS = 220;
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !isInternalLink(a)) return;
    // Same-page navigation — let the browser handle anchor jump natively
    if (a.pathname === location.pathname) return;
    // Pre-order / verse-popup / newsletter links may call preventDefault themselves
    if (e.defaultPrevented) return;

    e.preventDefault();
    try { sessionStorage.setItem('__ij_nav_t', String(Date.now())); } catch (err) {}
    document.body.classList.add('ij-nav-leaving');
    setTimeout(function () { location.href = a.href; }, FADE_MS);
  });

  // Handle back/forward cache (bfcache): when user hits Back, the body may be
  // stuck at opacity 0 if we just faded out. Reset.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('ij-nav-leaving', 'ij-nav-entering');
      document.body.classList.add('ij-nav-entered');
    }
  });

  // ── 4. AUTO target="_blank" ON EXTERNAL LINKS ────────────────────────────
  // Social links etc. should open in a new tab. Runs on load + MutationObserver
  // so React-rendered anchors also get handled.
  function markExternal(root) {
    (root || document).querySelectorAll('a[href]').forEach(function (a) {
      if (a.__ijExtMarked) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('http') !== 0) return;
      try {
        if (a.origin && a.origin !== location.origin) {
          a.__ijExtMarked = true;
          if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
          if (!a.getAttribute('rel'))    a.setAttribute('rel', 'noopener noreferrer');
        }
      } catch (err) {}
    });
  }
  markExternal();
  if (window.MutationObserver) {
    var moScheduled = false;
    var mo = new MutationObserver(function () {
      if (moScheduled) return;
      moScheduled = true;
      requestAnimationFrame(function () { moScheduled = false; markExternal(); });
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();
