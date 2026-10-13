"""
Figma render | live shot | abs diff x3, side by side, for rows y0..y1, and the band's mean
absolute error (0-255). Both images must be 1 design px per px: the Figma render of Frame 270
(or 271) at scale 1, and scripts/sheet-shot.mjs's shot.

    python scripts/band-diff.py <ref.png> <web.png> <out.png> <y0> <y1> [scale]

e.g. python scripts/band-diff.py .figma-tmp/ref/frame270-1x.png .figma-tmp/web-sheet-1x.png \
         .figma-tmp/diff-akad.png 5830 7030 0.6
"""
import sys

import numpy as np
from PIL import Image, ImageChops

ref_p, web_p, out_p, y0, y1 = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
scale = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
ref = Image.open(ref_p).convert('RGB')
web = Image.open(web_p).convert('RGB')
w = min(ref.width, web.width)
a = ref.crop((0, y0, w, min(y1, ref.height)))
b = web.crop((0, y0, w, min(y1, web.height)))
h = min(a.height, b.height)
a, b = a.crop((0, 0, w, h)), b.crop((0, 0, w, h))
d = ImageChops.difference(a, b)
err = np.asarray(d, dtype=np.float32).mean()
sheet = Image.new('RGB', (w * 3 + 20, h), (30, 30, 30))
sheet.paste(a, (0, 0))
sheet.paste(b, (w + 10, 0))
sheet.paste(Image.eval(d, lambda v: min(255, v * 3)), (2 * w + 20, 0))
if scale != 1.0:
    sheet = sheet.resize((int(sheet.width * scale), int(sheet.height * scale)), Image.LANCZOS)
sheet.save(out_p)
print(f'rows {y0}..{y0 + h}: mean abs err {err:.2f}')
