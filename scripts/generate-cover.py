#!/usr/bin/env python3
"""Generate a 'Big Room Blog' cover image in the brand template style.

Design (matches the reference template):
- Dark purple radial gradient background, dot grid overlay
- White Big Room Tech icon centered near top
- "Big Room Blog" wordmark in lime green, centered
- Small white subtitle below

Usage:
  python3 scripts/generate-cover.py "Subtitle Text" output-slug

Saves to images/blog/{slug}.png at 1200x800.
"""
import sys
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 800

# Brand palette
EDGE = (12, 6, 22)          # near-black at the corners
CENTER = (60, 28, 110)      # rich purple in the centre
LIME = (190, 235, 70)       # "Big Room Blog" green
WHITE = (255, 255, 255)
DOT = (255, 255, 255, 22)   # very faint dot grid
DOT_BRIGHT = (255, 255, 255, 48)


def find_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def radial_gradient():
    """Build a radial-ish gradient by blending two solids per-pixel."""
    img = Image.new("RGB", (W, H), EDGE)
    px = img.load()
    cx, cy = W / 2, H / 2
    max_r = math.hypot(cx, cy)
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx, y - cy) / max_r
            # ease curve so the centre stays rich
            t = min(1.0, d ** 1.4)
            r = int(CENTER[0] * (1 - t) + EDGE[0] * t)
            g = int(CENTER[1] * (1 - t) + EDGE[1] * t)
            b = int(CENTER[2] * (1 - t) + EDGE[2] * t)
            px[x, y] = (r, g, b)
    return img


def add_dot_grid(base):
    """Subtle regular dot grid across the whole image."""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    spacing = 22
    r = 1.6
    for y in range(spacing // 2, H, spacing):
        for x in range(spacing // 2, W, spacing):
            # Slightly brighter dots near the centre
            d = math.hypot(x - W / 2, y - H / 2) / math.hypot(W / 2, H / 2)
            fill = DOT_BRIGHT if d < 0.45 else DOT
            od.ellipse([x - r, y - r, x + r, y + r], fill=fill)
    base = base.convert("RGBA")
    base.alpha_composite(overlay)
    return base


def main():
    if len(sys.argv) < 3:
        print("Usage: generate-cover.py <subtitle> <slug>")
        sys.exit(1)
    subtitle = sys.argv[1]
    slug = sys.argv[2]

    img = radial_gradient()
    img = add_dot_grid(img)
    draw = ImageDraw.Draw(img)

    # --- Logo (icon, white) centered near top ---
    logo_path = Path(__file__).resolve().parent.parent / "images" / "logo-white.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        target_h = 180
        ratio = target_h / logo.height
        logo = logo.resize((int(logo.width * ratio), target_h), Image.LANCZOS)
        lx = (W - logo.width) // 2
        ly = 80
        img.alpha_composite(logo, (lx, ly))

    # --- "Big Room Blog" wordmark in lime ---
    wm_font = find_font(120, bold=False)  # not-bold matches the reference's thinner weight
    wm = "Big Room Blog"
    wm_w = draw.textlength(wm, font=wm_font)
    wm_y = 360
    draw.text(((W - wm_w) // 2, wm_y), wm, font=wm_font, fill=LIME)

    # --- Thin divider line ---
    line_y = wm_y + 160
    line_w = 60
    draw.rectangle([
        (W // 2) - line_w // 2, line_y,
        (W // 2) + line_w // 2, line_y + 2,
    ], fill=(255, 255, 255, 180))

    # --- Subtitle in white ---
    sub_font = find_font(38, bold=False)
    if draw.textlength(subtitle, font=sub_font) > W - 160:
        while draw.textlength(subtitle + "…", font=sub_font) > W - 160 and len(subtitle) > 8:
            subtitle = subtitle[:-2]
        subtitle = subtitle + "…"
    sub_w = draw.textlength(subtitle, font=sub_font)
    draw.text(((W - sub_w) // 2, line_y + 22), subtitle, font=sub_font, fill=WHITE)

    out_dir = Path(__file__).resolve().parent.parent / "images" / "blog"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.png"
    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(out_path)


if __name__ == "__main__":
    main()
