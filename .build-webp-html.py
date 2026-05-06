#!/usr/bin/env python3
"""
<img> -> <picture> wrapper for ianjamesormo.com.
Idempotent. Run after WebP files exist as siblings of PNGs.
"""
import os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
IMG_RE = re.compile(r'<img\b([^>]*?)\bsrc="([^"]+\.png)([^"]*)"([^>]*)>', re.I)


def transform(html):
    count = 0
    def replace(m):
        nonlocal count
        before_attrs = m.group(1)
        png = m.group(2)
        png_qs = m.group(3)
        after_attrs = m.group(4)
        idx = m.start()
        # Wide look-behind so multi-line <picture>...<img></picture> blocks
        # also count as "already wrapped" — the previous 80-char window was
        # too small once we started formatting wrappers across lines, and the
        # script ended up nesting <picture> inside <picture>.
        look = html[max(0, idx - 1000):idx]
        last_open = look.rfind('<picture')
        last_close = look.rfind('</picture')
        if last_open != -1 and last_open > last_close:
            return m.group(0)
        webp = re.sub(r'\.png$', '.webp', png)
        webp_local = webp.lstrip('/')
        if not os.path.isfile(os.path.join(HERE, webp_local)):
            return m.group(0)
        # Strip a trailing self-closing slash (and any surrounding whitespace)
        # from after_attrs before we append more attributes — otherwise we end
        # up with broken tokens like  style={{...}} / loading="lazy"  which
        # crash Babel's JSX parser and blank the page (yes, this happened).
        after_attrs = re.sub(r'\s*/\s*$', '', after_attrs or '')
        attrs_combined = (before_attrs or '') + after_attrs
        nav_end = html.find('</nav>')
        eager_threshold = nav_end if nav_end != -1 else 1500
        is_logo = 'nav-logo' in attrs_combined or 'logo' == attrs_combined.strip()
        is_above_fold = idx < eager_threshold
        wants_lazy = not is_above_fold and not is_logo
        if wants_lazy and 'loading=' not in attrs_combined:
            after_attrs += ' loading="lazy"'
        if 'decoding=' not in attrs_combined:
            after_attrs += ' decoding="async"'
        # Always emit self-closing tags (valid HTML5 + required by JSX).
        new_img = f'<img{before_attrs}src="{png}{png_qs}"{after_attrs} />'
        return f'<picture><source srcset="{webp}{png_qs}" type="image/webp" />{new_img}</picture>'

    new_html = IMG_RE.sub(replace, html)
    return new_html, count


total = 0
for fn in sorted(glob.glob(os.path.join(HERE, '*.html'))):
    with open(fn, encoding='utf-8') as f:
        html = f.read()
    new_html, count = transform(html)
    # Recount via diff
    if new_html != html:
        diff_count = new_html.count('<picture>') - html.count('<picture>')
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'  {os.path.basename(fn)}: +{diff_count} <picture>')
        total += diff_count
print(f'total: {total}')
