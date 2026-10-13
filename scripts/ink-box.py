"""
Ink bounding box of the pixels near one colour, inside a region, in the Figma render and in
the live shot -- and how far the live ink sits from the render's. This is how every text
offset in the sections was measured: key on the node's own fill colour.

    python scripts/ink-box.py <ref.png> <web.png> <hex> <x0> <y0> <x1> <y1> [tolerance]

e.g. python scripts/ink-box.py .figma-tmp/ref/frame270-1x.png .figma-tmp/web-sheet-1x.png \
         822617 40 136 560 238 80        # the hero's couple name
A region that also holds art of the same colour (a pink flower beside pink text) measures the
art too -- check the box against a zoom before trusting a large offset.
"""
import sys

import numpy as np
from PIL import Image

ref_p, web_p, hexc = sys.argv[1], sys.argv[2], sys.argv[3]
x0, y0, x1, y1 = map(int, sys.argv[4:8])
tol = float(sys.argv[8]) if len(sys.argv) > 8 else 60
c = np.array([int(hexc[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def box(path):
    a = np.asarray(Image.open(path).convert('RGB').crop((x0, y0, x1, y1)), dtype=np.float32)
    m = np.sqrt(((a - c) ** 2).sum(-1)) < tol
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return None
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1, int(m.sum()))


r, w = box(ref_p), box(web_p)
print('ref', r)
print('web', w)
if r and w:
    print(f'dx0 {w[0] - r[0]:+d} dy0 {w[1] - r[1]:+d} dx1 {w[2] - r[2]:+d} dy1 {w[3] - r[3]:+d}  '
          f'w {r[2] - r[0]}->{w[2] - w[0]} h {r[3] - r[1]}->{w[3] - w[1]}  ink {r[4]}->{w[4]}')
