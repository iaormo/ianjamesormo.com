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
        look = html[max(0, idx - 80):idx]
        if '<picture' in look and '</picture' not in look:
            return m.group(0)
        webp = re.sub(r'\.png$', '.webp', png)
        webp_local = webp.lstrip('/')
        if not os.path.isfile(os.path.join(HERE, webp_local)):
            return m.group(0)
        attrs_combined = (before_attrs or '') + (after_attrs or '')
        nav_end = html.find('</nav>')
        eager_threshold = nav_end if nav_end != -1 else 1500
        is_logo = 'nav-logo' in attrs_combined or 'logo' == attrs_combined.strip()
        is_above_fold = idx < eager_threshold
        wants_lazy = not is_above_fold and not is_logo
        if wants_lazy and 'loading=' not in attrs_combined:
            after_attrs = (after_attrs or '') + ' loading="lazy"'
        if 'decoding=' not in attrs_combined:
            after_attrs = (after_attrs or '') + ' decoding="async"'
        new_img = f'<img{before_attrs}src="{png}{png_qs}"{after_attrs}>'
        return f'<picture><source srcset="{webp}{png_qs}" type="image/webp">{new_img}</picture>'

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
