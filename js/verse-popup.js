// verse-popup.js — click any [data-verse] element to open an ESV passage modal.
// Also auto-wires common verse reference selectors found across the site.
(function () {
  var BRAND = { ink: '#111111', page: '#FAF7F2', copper: '#B8471C', steel: '#6B6B6B', mist: '#E6E1D8' };

  function injectStyles() {
    if (document.getElementById('verse-popup-css')) return;
    var css = ''+
      '.ij-verse-link{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1px;text-underline-offset:3px;transition:color .15s ease;}'+
      '.ij-verse-link:hover{color:'+BRAND.copper+';}'+
      '.ij-verse-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(10,10,10,.72);padding:24px;}'+
      '.ij-verse-modal.open{display:flex;animation:ij-fade .18s ease-out;}'+
      '@keyframes ij-fade{from{opacity:0}to{opacity:1}}'+
      '.ij-verse-card{background:'+BRAND.page+';color:'+BRAND.ink+';max-width:600px;width:100%;max-height:82vh;overflow-y:auto;padding:40px 36px 32px;border-radius:4px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.4);font-family:Inter,-apple-system,sans-serif;}'+
      '.ij-verse-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:'+BRAND.steel+';padding:6px 10px;line-height:1;}'+
      '.ij-verse-close:hover{color:'+BRAND.ink+';}'+
      '.ij-verse-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:'+BRAND.copper+';margin-bottom:8px;}'+
      '.ij-verse-ref{font-family:Archivo,Inter,-apple-system,sans-serif;font-weight:900;font-size:28px;letter-spacing:-0.02em;line-height:1.1;margin:0 0 24px;}'+
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
        '<div class="ij-verse-eyebrow">Scripture</div>'+
        '<div class="ij-verse-ref"></div>'+
        '<div class="ij-verse-body"></div>'+
        '<div class="ij-verse-copyright"></div>'+
      '</div>';
    document.body.appendChild(modalEl);
    refEl = modalEl.querySelector('.ij-verse-ref');
    bodyEl = modalEl.querySelector('.ij-verse-body');
    copyEl = modalEl.querySelector('.ij-verse-copyright');
    modalEl.addEventListener('click', function(e){ if (e.target === modalEl) close(); });
    modalEl.querySelector('.ij-verse-close').addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }
  function open() { ensureModal(); modalEl.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { if (modalEl) { modalEl.classList.remove('open'); document.body.style.overflow = ''; } }

  function formatPassage(text) {
    if (!text) return '';
    // Pull out the trailing "(ESV)" and copyright line if present
    var copyright = '';
    var copyMatch = text.match(/\(ESV\)[\s\S]*$/);
    if (copyMatch) { copyright = copyMatch[0].trim(); text = text.slice(0, copyMatch.index); }
    // Wrap verse numbers like [1] in a small-superscript span
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
        var fmt = formatPassage(data.passages.join('\n\n'));
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
    var candidates = (root || document).querySelectorAll('span, a, div');
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.__ijVerseChecked) continue;
      el.__ijVerseChecked = true;
      if (el.children.length !== 0) continue; // only leaves
      var txt = (el.textContent || '').trim();
      if (txt && txt.length < 40 && VERSE_RE.test(txt)) {
        el.classList.add('ij-verse-link');
        if (!el.getAttribute('data-verse')) el.setAttribute('data-verse', txt);
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
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
