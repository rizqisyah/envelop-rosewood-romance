"""
Turn the Figma fills, downloaded by hash, into the committed webp set.

    python scripts/assets_to_webp.py <body-fills-dir> <cover-fills-dir>

<body-fills-dir> holds Frame 270's fills as get_design_context names them (`73d06.png`,
`e16f7.svg`, ...): the asset URLs in its output are `<prefix>/<hash>.<ext>`, valid for 7 days.
<cover-fills-dir> holds Frame 271's three (`baca6.png`, `60995.png`, `31bf2.png`).

Each image is sized to 2.4x the largest size it renders at in design px (from
.figma-ref/frame270-layers.json, so run scripts/frame270.py first), never upscaled, and an
alpha plane that is fully opaque is dropped. SVGs are copied as they are.
"""
import json
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCALE = 2.4
QUALITY = 84

# Drawn by the sections, not by the band tables, so they carry their own target size.
EXTRA = {
    '2eccc': ('photo-gallery-1', (900, 1350)),
    'be91f': ('photo-gallery-2', (900, 1350)),
    'c0f62': ('photo-gallery-3', (900, 1350)),
    'ef39e': ('photo-gallery-4', (900, 1350)),
}
COVER = {
    'baca6': ('paper', (736, 1308)),
    '60995': ('envelope', (1024, 1024)),
    '31bf2': ('heart-seal', (260, 260)),
}


def find(d, h):
    for ext in ('.png', '.jpg', '.jpeg', '.webp'):
        p = os.path.join(d, h + ext)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'{h}.* not in {d}')


def open_rgb(path):
    """RGBA or RGB -- never palette: Pillow resizes a "P" image with NEAREST, whatever filter you ask for."""
    im = Image.open(path)
    return im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')


def save(im, out):
    if im.mode == 'RGBA' and im.getchannel('A').getextrema() == (255, 255):
        im = im.convert('RGB')
    im.save(out, 'WEBP', quality=QUALITY, method=6)
    print(f'{os.path.relpath(out, ROOT):40s} {im.size[0]}x{im.size[1]} {os.path.getsize(out):8d}')


def main(body_dir, cover_dir):
    ref = json.load(open(os.path.join(ROOT, '.figma-ref', 'frame270-layers.json'), encoding='utf-8'))
    art_dir = os.path.join(ROOT, 'src', 'assets', 'art')
    cover_out = os.path.join(ROOT, 'src', 'assets', 'cover')

    # The largest render of each fill, design px: the box (or the rotated element's own
    # size), widened by its crop when Figma crops rather than covers.
    need = {}
    for l in ref['layers']:
        if l['kind'] != 'art':
            continue
        w, h = l.get('inner') or l['box'][2:]
        if 'crop' in l:
            w, h = w * l['crop'][2] / 100, h * l['crop'][3] / 100
        uses = [(l['src'], w, h)]
        if 'mask' in l:
            uses.append((l['mask'][0], l['mask'][3], l['mask'][4]))
        for src, uw, uh in uses:
            pw, ph = need.get(src, (0, 0))
            need[src] = (max(pw, uw), max(ph, uh))

    done = set()
    for h, name in sorted(ref['assets'].items(), key=lambda kv: kv[1]):
        if h.endswith('.svg'):
            if name not in done:
                shutil.copyfile(os.path.join(body_dir, h), os.path.join(art_dir, name + '.svg'))
                done.add(name)
            continue
        if h not in need:
            continue
        im = open_rgb(find(body_dir, h))
        rw, rh = need[h]
        s = min(1.0, SCALE * max(rw / im.width, rh / im.height))
        size = (max(1, round(im.width * s)), max(1, round(im.height * s)))
        if size != im.size:
            im = im.resize(size, Image.LANCZOS)
        save(im, os.path.join(art_dir, name + '.webp'))

    for table, src_dir, out_dir in ((EXTRA, body_dir, art_dir), (COVER, cover_dir, cover_out)):
        for h, (name, box) in table.items():
            im = open_rgb(find(src_dir, h))
            im.thumbnail(box, Image.LANCZOS)
            save(im, os.path.join(out_dir, name + '.webp'))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
