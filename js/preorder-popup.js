// preorder-popup.js — intercept "Pre-order" button clicks, show form, sync to GHL.
(function () {
  'use strict';
  if (window.__ijPreorderInit) return;
  window.__ijPreorderInit = true;

  var BOOKS = {
    finished: {
      source:  'preorder_finished',
      kicker:  'Pre-order · 2026',
      title:   'You Are Not Finished',
      tagline: "Grace, grit, and the long way home. A memoir on rebuilding.",
      sub:     "Leave your details — you'll be among the first to hear when pre-orders open, and I'll send the opening chapters so you can see if it lands before you commit.",
      cta:     'Reserve my copy →',
      thanks:  "You're on the list. I'll email you the moment pre-orders open, and send the opening in the meantime.",
    },
    paycheck: {
      source:  'preorder_paycheck',
      kicker:  'Pre-order · 2026',
      title:   'You Are Not Your Paycheck',
      tagline: "On identity, work, and the number that was never yours.",
      sub:     "Drop your details and you'll be first to hear when pre-orders go live. I'll also send the opening so you can decide if the book is for you.",
      cta:     'Reserve my copy →',
      thanks:  "You're on the list. I'll email the moment it's available, and send the opening in the meantime.",
    },
  };

  function detectBook(el) {
    // Explicit override via data-book
    if (el && el.closest) {
      var c = el.closest('[data-book]');
      if (c) {
        var b = c.getAttribute('data-book');
        if (b === 'paycheck' || b === 'finished') return b;
      }
    }
    // URL-based detection
    var p = (location.pathname || '').toLowerCase();
    if (p.indexOf('paycheck') !== -1) return 'paycheck';
    if (p.indexOf('finished') !== -1) return 'finished';
    // Homepage default → the featured book is "finished"
    return 'finished';
  }

  function injectStyles() {
    if (document.getElementById('ij-po-style')) return;
    var css =
'#ij-po-overlay { position:fixed; inset:0; background:rgba(8,8,8,.78); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:10002; display:flex; align-items:center; justify-content:center; padding:24px; opacity:0; transition:opacity .4s cubic-bezier(.22,1,.36,1); }\
#ij-po-overlay.open { opacity:1; }\
#ij-po-card { position:relative; width:100%; max-width:540px; background:#111; color:#FAF7F2; padding:56px 44px 40px; font-family:"Inter",-apple-system,sans-serif; box-shadow:0 40px 120px -20px rgba(0,0,0,.8); transform:translateY(16px) scale(.985); transition:transform .5s cubic-bezier(.22,1,.36,1); }\
#ij-po-overlay.open #ij-po-card { transform:translateY(0) scale(1); }\
#ij-po-card::before { content:"IJ"; position:absolute; right:-20px; bottom:-80px; font-family:"Archivo",sans-serif; font-weight:900; font-size:360px; line-height:1; letter-spacing:-.06em; color:#B8471C; opacity:.08; pointer-events:none; }\
#ij-po-close { position:absolute; top:14px; right:14px; width:36px; height:36px; background:transparent; border:none; color:#FAF7F2; font-size:24px; cursor:pointer; opacity:.6; line-height:1; }\
#ij-po-close:hover { opacity:1; }\
.ij-po-kicker { font-size:11px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#B8471C; margin:0 0 22px; position:relative; }\
.ij-po-title  { font-family:"Archivo",sans-serif; font-weight:900; font-size:34px; line-height:1.02; letter-spacing:-.03em; text-transform:uppercase; margin:0 0 10px; position:relative; }\
.ij-po-tag    { font-family:"Fraunces",Georgia,serif; font-style:italic; font-size:16px; line-height:1.4; color:rgba(250,247,242,.80); margin:0 0 20px; position:relative; }\
.ij-po-sub    { font-size:14px; line-height:1.55; color:rgba(250,247,242,.70); margin:0 0 28px; position:relative; }\
#ij-po-form   { position:relative; }\
.ij-po-row    { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; }\
#ij-po-form input { width:100%; box-sizing:border-box; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); color:#FAF7F2; padding:14px 16px; font-family:"Inter",sans-serif; font-size:14px; outline:none; }\
#ij-po-form input:focus { border-color:#B8471C; background:rgba(255,255,255,.08); }\
#ij-po-form input::placeholder { color:rgba(250,247,242,.40); }\
#ij-po-form button[type=submit] { width:100%; margin-top:16px; background:#B8471C; color:#FAF7F2; border:none; padding:16px 20px; font-family:"Inter",sans-serif; font-size:12px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; cursor:pointer; transition:background .2s ease; }\
#ij-po-form button[type=submit]:hover { background:#d4561f; }\
#ij-po-form button[disabled] { opacity:.6; cursor:wait; }\
.ij-po-err    { color:#ff9b7a; font-size:12px; margin-top:10px; }\
.ij-po-thanks-k { font-size:11px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#B8471C; margin-bottom:14px; }\
.ij-po-thanks-h { font-family:"Fraunces",Georgia,serif; font-style:italic; font-size:22px; line-height:1.45; margin:0; position:relative; }\
@media (max-width:520px) {\
  #ij-po-card { padding:40px 24px 28px; }\
  .ij-po-title { font-size:26px; }\
  .ij-po-tag { font-size:15px; }\
  .ij-po-sub { font-size:13px; }\
  .ij-po-row { grid-template-columns:1fr; }\
}';
    var s = document.createElement('style'); s.id = 'ij-po-style'; s.textContent = css;
    document.head.appendChild(s);
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function open(bookKey) {
    if (document.getElementById('ij-po-overlay')) return;
    var book = BOOKS[bookKey] || BOOKS.finished;
    injectStyles();
    var overlay = document.createElement('div');
    overlay.id = 'ij-po-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Pre-order ' + book.title);
    overlay.innerHTML =
      '<div id="ij-po-card">' +
        '<button id="ij-po-close" aria-label="Close">&times;</button>' +
        '<div id="ij-po-body">' +
          '<p class="ij-po-kicker">' + esc(book.kicker) + '</p>' +
          '<h2 class="ij-po-title">' + esc(book.title) + '</h2>' +
          '<p class="ij-po-tag">' + esc(book.tagline) + '</p>' +
          '<p class="ij-po-sub">' + esc(book.sub) + '</p>' +
          '<form id="ij-po-form" novalidate>' +
            '<input type="hidden" name="source" value="' + esc(book.source) + '" />' +
            '<div class="ij-po-row">' +
              '<input type="text" name="first" placeholder="First name" required autocomplete="given-name" />' +
              '<input type="text" name="last"  placeholder="Last name"  required autocomplete="family-name" />' +
            '</div>' +
            '<input type="email" name="email" placeholder="your@email.com" required autocomplete="email" />' +
            '<button type="submit">' + esc(book.cta) + '</button>' +
            '<div class="ij-po-err" id="ij-po-err" hidden></div>' +
          '</form>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('open'); });

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('#ij-po-close').addEventListener('click', close);
    document.addEventListener('keydown', escHandler);

    var form = overlay.querySelector('#ij-po-form');
    var errEl = overlay.querySelector('#ij-po-err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.hidden = true;
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      var payload = {
        first:  form.first.value.trim(),
        last:   form.last.value.trim(),
        email:  form.email.value.trim(),
        source: form.source.value,
      };
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.data && res.data.error || 'server');
          showThanks(book);
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = book.cta;
          errEl.textContent = "Didn't go through. Try again?";
          errEl.hidden = false;
        });
    });

    setTimeout(function () {
      var f = form.querySelector('input[name=first]');
      if (f) f.focus();
    }, 120);
  }

  function showThanks(book) {
    var body = document.getElementById('ij-po-body');
    if (!body) return;
    body.innerHTML =
      '<div class="ij-po-thanks-k">You&rsquo;re in</div>' +
      '<p class="ij-po-thanks-h">' + esc(book.thanks) + '</p>';
  }

  function close() {
    var overlay = document.getElementById('ij-po-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.removeEventListener('keydown', escHandler);
    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 420);
  }
  function escHandler(e) { if (e.key === 'Escape') close(); }

  // Click intercept: any link/button whose text starts with "Pre-order"
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    var el = e.target && e.target.closest && e.target.closest('a, button');
    if (!el) return;
    var txt = (el.textContent || '').trim().toLowerCase();
    if (!txt) return;
    if (txt.indexOf('pre-order') !== 0 && txt.indexOf('preorder') !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    open(detectBook(el));
  }, true); // capture phase so we run before the nav-prefetch fade

  // Expose manual opener
  window.ijOpenPreorder = function (bookKey) { open(bookKey || detectBook(null)); };
})();
