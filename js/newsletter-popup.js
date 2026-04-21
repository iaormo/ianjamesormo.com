/* Ian James — newsletter popup. Shows once after 10s on idle pages. */
(function () {
  'use strict';

  // Don't run on the dedicated newsletter page or the share redirect pages.
  var path = location.pathname.toLowerCase();
  if (path.indexOf('newsletter') !== -1) return;
  if (path.indexOf('/share/') === 0 || path.indexOf('/share/') !== -1) return;
  if (path.indexOf('/og/') !== -1) return;
  if (path.indexOf('404') !== -1) return;

  var KEY_SUB = 'ij_popup_subscribed';
  var KEY_DISMISS = 'ij_popup_dismissed_at';
  var DISMISS_COOLDOWN_DAYS = 7;

  function now() { return Date.now(); }
  function days(n) { return n * 24 * 60 * 60 * 1000; }

  try {
    if (localStorage.getItem(KEY_SUB)) return;
    var dismissed = parseInt(localStorage.getItem(KEY_DISMISS) || '0', 10);
    if (dismissed && now() - dismissed < days(DISMISS_COOLDOWN_DAYS)) return;
  } catch (e) { /* private mode — still show once */ }

  var css = '\
#ij-pop-overlay { position:fixed; inset:0; background:rgba(8,8,8,.72); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:24px; opacity:0; transition:opacity .45s cubic-bezier(.22,1,.36,1); }\
#ij-pop-overlay.open { opacity:1; }\
#ij-pop-card { position:relative; width:100%; max-width:520px; background:#111; color:#FAF7F2; padding:56px 48px 44px; font-family:"Inter",-apple-system,sans-serif; box-shadow:0 40px 120px -20px rgba(0,0,0,.8); transform:translateY(16px) scale(.985); transition:transform .5s cubic-bezier(.22,1,.36,1); }\
#ij-pop-overlay.open #ij-pop-card { transform:translateY(0) scale(1); }\
#ij-pop-card::before { content:"IJ"; position:absolute; right:-20px; bottom:-80px; font-family:"Archivo",sans-serif; font-weight:900; font-size:380px; line-height:1; letter-spacing:-.06em; color:#B8471C; opacity:.07; pointer-events:none; }\
#ij-pop-close { position:absolute; top:18px; right:18px; width:36px; height:36px; background:transparent; border:none; color:#FAF7F2; font-size:24px; cursor:pointer; opacity:.55; line-height:1; padding:0; }\
#ij-pop-close:hover { opacity:1; }\
.ij-eyebrow { font-size:11px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#B8471C; margin-bottom:24px; position:relative; }\
.ij-h { font-family:"Archivo",sans-serif; font-weight:900; font-size:36px; line-height:1.02; letter-spacing:-.03em; text-transform:uppercase; margin:0 0 20px; position:relative; }\
.ij-sub { font-family:"Fraunces",Georgia,serif; font-style:italic; font-size:18px; line-height:1.55; color:rgba(250,247,242,.88); margin:0 0 32px; position:relative; }\
#ij-pop-form { position:relative; }\
.ij-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; }\
#ij-pop-form input { width:100%; box-sizing:border-box; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); color:#FAF7F2; padding:14px 16px; font-family:"Inter",sans-serif; font-size:14px; outline:none; }\
#ij-pop-form input:focus { border-color:#B8471C; background:rgba(255,255,255,.08); }\
#ij-pop-form input::placeholder { color:rgba(250,247,242,.45); }\
#ij-pop-form button[type=submit] { width:100%; margin-top:16px; background:#B8471C; color:#FAF7F2; border:none; padding:16px 20px; font-family:"Inter",sans-serif; font-size:12px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; }\
#ij-pop-form button[type=submit]:hover { background:#d4561f; }\
#ij-pop-nothanks { margin-top:18px; width:100%; background:transparent; border:none; color:rgba(250,247,242,.45); font-family:"Inter",sans-serif; font-size:12px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; padding:8px; position:relative; }\
#ij-pop-nothanks:hover { color:rgba(250,247,242,.85); }\
.ij-thanks-eyebrow { font-size:11px; font-weight:700; letter-spacing:.28em; text-transform:uppercase; color:#B8471C; margin-bottom:14px; }\
.ij-thanks-h { font-family:"Fraunces",Georgia,serif; font-style:italic; font-size:26px; line-height:1.35; color:#FAF7F2; margin:0; }\
@media (max-width:520px) { #ij-pop-card { padding:44px 28px 32px; } .ij-h { font-size:28px; } .ij-sub { font-size:16px; } }';

  var overlay = document.createElement('div');
  overlay.id = 'ij-pop-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Newsletter signup');
  overlay.innerHTML = '\
<div id="ij-pop-card">\
  <button id="ij-pop-close" aria-label="Close">&times;</button>\
  <div id="ij-pop-body">\
    <div class="ij-eyebrow">One letter · Sunday morning</div>\
    <h2 class="ij-h">You&rsquo;ve been here a while.</h2>\
    <p class="ij-sub">Most of what you read today will not stay with you. Stay with me. Every Sunday I write one short, honest thing &mdash; the piece I actually meant. Nothing else lands in your inbox. Nothing else earns it.</p>\
    <form id="ij-pop-form" novalidate>\
      <div class="ij-row">\
        <input type="text" name="first" placeholder="First name" required autocomplete="given-name" />\
        <input type="text" name="last" placeholder="Last name" required autocomplete="family-name" />\
      </div>\
      <input type="email" name="email" placeholder="your@email.com" required autocomplete="email" />\
      <button type="submit">Send me the letter &rarr;</button>\
    </form>\
    <button id="ij-pop-nothanks" type="button">No thanks, keep reading</button>\
  </div>\
</div>';

  function show() {
    if (document.getElementById('ij-pop-overlay')) return;
    var style = document.createElement('style');
    style.id = 'ij-pop-style';
    style.textContent = css;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('open'); });

    overlay.querySelector('#ij-pop-close').addEventListener('click', dismiss);
    overlay.querySelector('#ij-pop-nothanks').addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
    document.addEventListener('keydown', onKey);
    overlay.querySelector('#ij-pop-form').addEventListener('submit', onSubmit);

    setTimeout(function () { overlay.querySelector('input[name=first]').focus(); }, 500);
  }

  function onKey(e) { if (e.key === 'Escape') dismiss(); }

  function close() {
    overlay.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.style.overflow = '';
    }, 450);
  }

  function dismiss() {
    try { localStorage.setItem(KEY_DISMISS, String(now())); } catch (e) {}
    close();
  }

  function subscribed() {
    try { localStorage.setItem(KEY_SUB, String(now())); } catch (e) {}
  }

  function onSubmit(e) {
    e.preventDefault();
    var f = e.target;
    var first = f.first.value.trim();
    var last  = f.last.value.trim();
    var email = f.email.value.trim();
    if (!first || !last || !email) return;
    subscribed();
    var body = overlay.querySelector('#ij-pop-body');
    body.innerHTML = '\
<div class="ij-thanks-eyebrow">You&rsquo;re in.</div>\
<h2 class="ij-thanks-h">See you Sunday. I&rsquo;ll write to you like I mean it, because I will.</h2>';
    setTimeout(close, 4200);
  }

  setTimeout(function () {
    if (document.hidden) {
      document.addEventListener('visibilitychange', function fire() {
        if (!document.hidden) { document.removeEventListener('visibilitychange', fire); show(); }
      });
    } else {
      show();
    }
  }, 10000);
})();
