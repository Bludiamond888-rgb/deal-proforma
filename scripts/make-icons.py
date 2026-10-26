"""Generate PWA / iOS icons — navy tile with teal building mark."""
from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
NAVY = (11, 31, 58, 255)
TEAL = (13, 148, 136, 255)
WHITE = (255, 255, 255, 255)

def mark(d, cx, cy, s):
    # simple building silhouette
    w, h = s * 0.55, s * 0.7
    x0, y0 = cx - w / 2, cy - h / 2 + s * 0.05
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=int(s * 0.06), fill=WHITE)
    # teal accent band
    d.rectangle([x0, y0, x0 + w, y0 + h * 0.18], fill=TEAL)
    # windows
    gw, gh, gap = w * 0.16, h * 0.12, w * 0.08
    for row in range(3):
        for col in range(3):
            wx = x0 + gap + col * (gw + gap)
            wy = y0 + h * 0.28 + row * (gh + gap * 0.9)
            d.rounded_rectangle([wx, wy, wx + gw, wy + gh], radius=2, fill=TEAL)

def icon(size, mode):
    S = size * 4
    if mode == 'any':
        im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=NAVY)
        mark(d, S / 2, S / 2, S * 0.62)
    else:
        im = Image.new('RGBA', (S, S), NAVY)
        d = ImageDraw.Draw(im)
        mark(d, S / 2, S / 2, S * (0.5 if mode == 'maskable' else 0.62))
    return im.resize((size, size), Image.LANCZOS)

os.makedirs(OUT, exist_ok=True)
icon(192, 'any').save(f'{OUT}/icon-192.png')
icon(512, 'any').save(f'{OUT}/icon-512.png')
icon(512, 'maskable').save(f'{OUT}/icon-maskable-512.png')
icon(180, 'apple').convert('RGB').save(f'{OUT}/apple-touch-icon.png')
icon(32, 'any').save(f'{OUT}/favicon-32.png')
print('ok')
