#!/usr/bin/env python3
"""Generate a branded 'Big Room Blog' cover image for a new post.

The cover is decorative — large "Big Room Blog" wordmark with a short subtitle.
The post title is rendered separately on the card itself, so the cover should
not repeat it. Keep the subtitle short (category or 2-4 word teaser).

Usage:
  python3 scripts/generate-cover.py "Subtitle Text" output-slug

Saves to images/blog/{slug}.png at 1200x800.
"""
import sys
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 800
BG = (8, 8, 10)
ACCENT = (255, 255, 255)
MUTED = (170, 170, 170)
HALO = (60, 60, 70)


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


def draw_dot_pattern(img, slug):
    """Decorative dot ring in the background, deterministic per slug."""
    rng = random.Random(hash(slug) & 0xFFFFFFFF)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx, cy = W // 2, H // 2
    for i in range(80):
        angle = (i / 80) * math.tau + rng.uniform(-0.05, 0.05)
        radius = rng.choice([260, 290, 320, 350, 380])
        r = rng.choice([4, 6, 8, 12, 16, 22])
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * radius
        alpha = rng.randint(60, 180)
        od.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.6))
    img.alpha_composite(overlay)


def main():
    if len(sys.argv) < 3:
        print("Usage: generate-cover.py <subtitle> <slug>")
        sys.exit(1)
    subtitle = sys.argv[1]
    slug = sys.argv[2]

    img = Image.new("RGBA", (W, H), BG + (255,))
    draw_dot_pattern(img, slug)
    draw = ImageDraw.Draw(img)

    # Wordmark "Big Room Blog" — large, centered
    wm_font = find_font(110, bold=True)
    wm = "Big Room Blog"
    wm_w = draw.textlength(wm, font=wm_font)
    wm_y = H // 2 - 90
    draw.text(((W - wm_w) // 2, wm_y), wm, font=wm_font, fill=ACCENT)

    # Thin underline accent
    line_y = wm_y + 145
    draw.rectangle([(W // 2) - 60, line_y, (W // 2) + 60, line_y + 4], fill=ACCENT)

    # Subtitle
    sub_font = find_font(34, bold=False)
    sub_w = draw.textlength(subtitle, font=sub_font)
    if sub_w > W - 160:
        # truncate gracefully
        while sub_w > W - 160 and len(subtitle) > 8:
            subtitle = subtitle[:-2]
            sub_w = draw.textlength(subtitle + "…", font=sub_font)
        subtitle = subtitle + "…"
        sub_w = draw.textlength(subtitle, font=sub_font)
    draw.text(((W - sub_w) // 2, line_y + 30), subtitle, font=sub_font, fill=MUTED)

    # Small logo in top-left corner
    logo_path = Path(__file__).resolve().parent.parent / "images" / "full-logo-white.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        ratio = 44 / logo.height
        logo = logo.resize((int(logo.width * ratio), 44), Image.LANCZOS)
        img.alpha_composite(logo, (60, 60))

    out_dir = Path(__file__).resolve().parent.parent / "images" / "blog"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.png"
    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(out_path)


if __name__ == "__main__":
    main()
