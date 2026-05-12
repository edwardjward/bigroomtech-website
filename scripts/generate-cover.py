#!/usr/bin/env python3
"""Generate a branded 'Big Room Blog' cover image for a new post.

Usage:
  python3 scripts/generate-cover.py "Post Title Here" output-slug

Saves to images/blog/{slug}.png at 1200x800.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 800
BG = (8, 8, 10)
ACCENT = (255, 255, 255)
MUTED = (170, 170, 170)

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

def wrap(text, font, max_w, draw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def main():
    if len(sys.argv) < 3:
        print("Usage: generate-cover.py <title> <slug>")
        sys.exit(1)
    title = sys.argv[1]
    slug = sys.argv[2]

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Try paste the white logo top-left
    logo_path = Path(__file__).resolve().parent.parent / "images" / "full-logo-white.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        # scale to 60px tall
        ratio = 60 / logo.height
        logo = logo.resize((int(logo.width * ratio), 60), Image.LANCZOS)
        img.paste(logo, (80, 80), logo)

    # "BIG ROOM BLOG" label
    label_font = find_font(28, bold=True)
    draw.text((80, 180), "BIG ROOM BLOG", font=label_font, fill=MUTED)

    # Title — large, wrapped
    title_font = find_font(76, bold=True)
    lines = wrap(title, title_font, W - 160, draw)
    # vertical center the block
    line_h = 92
    block_h = line_h * len(lines)
    y = (H - block_h) // 2 + 40
    for line in lines:
        draw.text((80, y), line, font=title_font, fill=ACCENT)
        y += line_h

    # Footer accent line
    draw.rectangle([80, H - 80, 200, H - 76], fill=ACCENT)

    out_dir = Path(__file__).resolve().parent.parent / "images" / "blog"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.png"
    img.save(out_path, "PNG", optimize=True)
    print(out_path)

if __name__ == "__main__":
    main()
