// verse-popup.js — click any [data-verse] element to open an ESV passage modal.
// Also auto-wires common verse reference selectors found across the site.
(function () {
  var BRAND = { ink: '#111111', page: '#FAF7F2', copper: '#B8471C', steel: '#6B6B6B', mist: '#E6E1D8' };

  function injectStyles() {
    if (document.getElementById('verse-popup-css')) return;
    var css = ''+
      '.ij-verse-link{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px;transition:color .15s ease;}'+
      '.ij-verse-link:hover{color:'+BRAND.copper+';}'+
      '.ij-verse-link .ij-rd{color:'+BRAND.copper+';margin-right:.35em;font-weight:700;letter-spacing:.08em;}'+
      '.ij-verse-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(10,10,10,.72);padding:24px;}'+
      '.ij-verse-modal.open{display:flex;animation:ij-fade .18s ease-out;}'+
      '@keyframes ij-fade{from{opacity:0}to{opacity:1}}'+
      '.ij-verse-card{background:'+BRAND.page+';color:'+BRAND.ink+';max-width:600px;width:100%;max-height:82vh;overflow-y:auto;padding:40px 36px 32px;border-radius:4px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.4);font-family:Inter,-apple-system,sans-serif;}'+
      '.ij-verse-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:'+BRAND.steel+';padding:6px 10px;line-height:1;}'+
      '.ij-verse-close:hover{color:'+BRAND.ink+';}'+
      '.ij-verse-eyebrow{font-family:Archivo,Inter,-apple-system,sans-serif;font-weight:900;font-size:26px;letter-spacing:-0.02em;line-height:1.15;text-transform:uppercase;color:'+BRAND.ink+';margin:0 0 22px;}'+
      '.ij-verse-body{font-family:Fraunces,"Source Serif 4",Georgia,serif;font-size:19px;line-height:1.65;color:'+BRAND.ink+';white-space:pre-wrap;}'+
      '.ij-verse-body .v{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;color:'+BRAND.copper+';vertical-align:super;margin-right:2px;}'+
      '.ij-verse-copyright{border-top:1px solid '+BRAND.mist+';margin-top:28px;padding-top:16px;font-size:11px;color:'+BRAND.steel+';letter-spacing:.02em;}'+
      '.ij-verse-loading{font-family:Fraunces,Georgia,serif;font-style:italic;color:'+BRAND.steel+';font-size:16px;}'+
      '.ij-verse-error{color:#a33;font-size:14px;}'+
      '@media (max-width:600px){.ij-verse-card{padding:32px 22px 24px;}.ij-verse-ref{font-size:22px;}.ij-verse-body{font-size:17px;}}';
    var s = document.createElement('style'); s.id = 'verse-popup-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  var modalEl, refEl, bodyEl, copyEl;
  function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'ij-verse-modal';
    modalEl.innerHTML =
      '<div class="ij-verse-card" role="dialog" aria-modal="true">'+
        '<button class="ij-verse-close" aria-label="Close">×</button>'+
        '<div class="ij-verse-eyebrow"></div>'+
        '<div class="ij-verse-body"></div>'+
        '<div class="ij-verse-copyright"></div>'+
      '</div>';
    document.body.appendChild(modalEl);
    refEl = modalEl.querySelector('.ij-verse-eyebrow');
    bodyEl = modalEl.querySelector('.ij-verse-body');
    copyEl = modalEl.querySelector('.ij-verse-copyright');
    modalEl.addEventListener('click', function(e){ if (e.target === modalEl) close(); });
    modalEl.querySelector('.ij-verse-close').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }
  function open() { ensureModal(); modalEl.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { if (modalEl) { modalEl.classList.remove('open'); document.body.style.overflow = ''; } }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function formatPassage(text, ref) {
    if (!text) return { body: '', copyright: '' };
    // Pull out the trailing "(ESV)" and copyright line if present
    var copyright = '';
    var copyMatch = text.match(/\(ESV\)[\s\S]*$/);
    if (copyMatch) { copyright = copyMatch[0].trim(); text = text.slice(0, copyMatch.index); }
    // ESV API returns the passage with the reference title as the first line — strip it
    // (e.g., "Proverbs 4:23\n\n[23] Keep your heart…")
    text = text.replace(/^\s*[1-3]?\s*[A-Z][a-zA-Z]+\s+\d+:\d+(?:-\d+)?\s*\n+/, '');
    // Also handle the case where the full ref passed in shows up verbatim at the top
    if (ref) {
      var esc = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp('^\\s*' + esc + '\\s*\\n+'), '');
    }
    // Defense-in-depth: escape HTML in the upstream text BEFORE we inject our
    // own verse-number markup. ESV's API is trusted today, but treating any
    // upstream string as innerHTML-safe would be a textbook DOM XSS sink if
    // that assumption ever changed.
    text = escapeHtml(text);
    // Now wrap verse numbers like [1] in a small-superscript span. Safe to do
    // after escape since "[N]" contains no HTML-significant characters.
    text = text.replace(/\s*\[(\d+)\]\s*/g, ' <span class="v">$1</span>');
    return { body: text.trim(), copyright: copyright };
  }

  function show(ref) {
    open();
    refEl.textContent = ref;
    bodyEl.innerHTML = '<div class="ij-verse-loading">Loading passage…</div>';
    copyEl.textContent = '';
    fetch('/api/verse?q=' + encodeURIComponent(ref))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data || !data.ok || !data.passages || !data.passages.length) {
          bodyEl.innerHTML = '<div class="ij-verse-error">Could not load passage. Please try again.</div>';
          return;
        }
        refEl.textContent = data.reference || ref;
        var fmt = formatPassage(data.passages.join('\n\n'), data.reference || ref);
        bodyEl.innerHTML = fmt.body;
        copyEl.textContent = fmt.copyright || 'Scripture quotations from the ESV® Bible. Copyright © by Crossway.';
      })
      .catch(function(){
        bodyEl.innerHTML = '<div class="ij-verse-error">Network error. Please try again.</div>';
      });
  }

  // Click delegation — any element with data-verse or .ij-verse-link becomes clickable
  function onClick(e) {
    var el = e.target.closest('[data-verse], .ij-verse-link');
    if (!el) return;
    var ref = el.getAttribute('data-verse') || el.textContent.trim();
    if (!ref) return;
    e.preventDefault();
    show(ref);
  }

  // Auto-wire: find elements that look like verse references and mark them clickable.
  // Pattern: "Book Chapter:Verse" like "Colossians 3:23" or "Proverbs 4:23"
  var VERSE_RE = /^\s*(?:[1-3]\s)?[A-Z][a-zA-Z]+\.?\s+\d+:\d+(?:-\d+)?\s*$/;
  function autoWire(root) {
    var candidates = (root || document).querySelectorAll('span, a, div, [data-verse]');
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      // Skip anything inside the verse modal itself — the modal's own eyebrow
      // displays the reference in plain form and must not get a "Read" prefix.
      if (el.closest && el.closest('.ij-verse-modal')) continue;
      // Re-heal any verse-link whose "Read" span was wiped by a React re-render.
      // Important: after a React re-render the element's textContent holds the
      // FRESH reference (e.g. "James 1:19" for today) while data-verse still
      // carries whatever was set on the very first auto-wire pass (e.g. the
      // hardcoded fallback "Psalm 90:12"). Always prefer textContent so the
      // displayed reference and the popup target stay in sync with React.
      if (el.classList.contains('ij-verse-link') && !el.querySelector('.ij-rd')) {
        var fromText = (el.textContent || '').replace(/^\s*Read\s+/i, '').trim();
        var fromAttr = el.getAttribute('data-verse') || '';
        var vref = fromText || fromAttr;
        if (vref) {
          el.innerHTML = '<span class="ij-rd">Read</span>' + ' ' + escapeHtml(vref);
          // Replace, don't preserve — the attribute may be stale from a prior render.
          el.setAttribute('data-verse', vref);
        }
        continue;
      }
      if (el.__ijVerseChecked) continue;
      el.__ijVerseChecked = true;
      if (el.children.length !== 0) continue; // only leaves
      var txt = (el.textContent || '').trim();
      var stripped = txt.replace(/^\s*Read\s+/i, '').trim();
      if (stripped && stripped.length < 40 && VERSE_RE.test(stripped)) {
        el.classList.add('ij-verse-link');
        if (!el.getAttribute('data-verse')) el.setAttribute('data-verse', stripped);
        if (!/^\s*Read\s+/i.test(txt)) {
          el.innerHTML = '<span class="ij-rd">Read</span>' + ' ' + escapeHtml(stripped);
        }
      }
    }
  }

  function init() {
    injectStyles();
    document.addEventListener('click', onClick);
    autoWire();
    // Re-scan periodically — React apps mount/update after initial load
    var tries = 0;
    var iv = setInterval(function(){ autoWire(); if (++tries > 30) clearInterval(iv); }, 400);
    // Also react to React re-renders that strip the "Read" prefix — repair immediately.
    if (window.MutationObserver) {
      var scheduled = false;
      var mo = new MutationObserver(function(muts){
        // Ignore mutations we caused ourselves (autoWire rewrites .ij-verse-link innerHTML)
        for (var i = 0; i < muts.length; i++) {
          var t = muts[i].target;
          if (t && t.classList && t.classList.contains('ij-verse-link')) return;
          if (t && t.parentElement && t.parentElement.classList && t.parentElement.classList.contains('ij-verse-link')) return;
        }
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function(){ scheduled = false; autoWire(); });
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
