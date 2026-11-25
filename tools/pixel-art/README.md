# Pixel art tools

The PNGs in `public/img/` are the source of truth. These scripts turn a PNG into a text grid with one character per art pixel and back, so the art can be read and edited as text. The text is only a temporary file. Don't commit it. Don't use AI image generation.

How to draw, the techniques behind the existing art and the style rules are in the `dw-pixel-art` Claude skill (`.claude/skills/dw-pixel-art/`).

Everything here only needs Python 3 and its standard library. Run the commands from the repo root.

## Editing a PNG

```sh
python3 tools/pixel-art/png_to_txt.py public/img/rocks.png /tmp/rocks.txt
# edit /tmp/rocks.txt
python3 tools/pixel-art/txt_to_png.py /tmp/rocks.txt public/img/rocks.png
```

`png_to_txt.py` works out how many PNG pixels make up one art pixel (game art is drawn at 2×) and writes it as `# scale N`, so `txt_to_png.py` scales it back the same way. For a big preview, raise the scale line to 8 or 10 and write the PNG to `/tmp`.

To see how a sprite reads in the game, draw it on a ground tile:

```sh
python3 tools/pixel-art/preview_on_ground.py /tmp/trough.png public/img/sand.png /tmp/on-sand.png 5
```

New PNGs aren't wired into the game automatically. Register them in `src/game/imgInfo.ts` or `src/game/items.ts`.

## Format

```
# scale 2
. transparent
A #1e140c
B #c8781e
---
................................
.............AAAAAA.............
...
```

- Above `---` is the palette, one `<char> <#rrggbb | #rrggbbaa | transparent>` per line. `png_to_txt.py` sorts it from darkest to lightest. Other lines starting with `#` and empty lines are skipped.
- Below `---` is the grid. Each row has to be the same width, and every character has to be in the palette. `txt_to_png.py` stops with an error that names the row if either is wrong.
- A tile is 32×32 art pixels, drawn at 64×64 in the game.

## Generating art with a script

`draw.py` has a `Grid` with lines, rectangles, ellipses, polygons, stamps, shading along a shade map, dithered shadows and outlines, plus `hash01` and `value_noise` for repeatable randomness. Use it from a throwaway script. If the script isn't run from the repo root, use an absolute path in `sys.path.insert`:

```python
import sys; sys.path.insert(0, "tools/pixel-art")
from draw import Grid

grid = Grid(32, 32)
grid.ellipse(16, 18, 10, 11, "A")
grid.outline(lambda char: "K")
grid.save("/tmp/preview.png", ". transparent\nK #1e140c\nA #b07a42\n", 10)
```

## Font

`font.txt` is the hand-drawn glyph sheet for the game's pixel font. It's the one art source kept as text, because the font is built from it rather than from a PNG:

```sh
python3 tools/pixel-art/font_build.py tools/pixel-art/font.txt public/fonts/destination-west.ttf
```

Each band of 11 rows has 8 rows down to and including the baseline and 3 rows below it. Glyphs are separated by `|` columns in the order the `# glyphs:` lines list them, and a glyph's width is its cell width. Use the font at multiples of 12px (48px = 4 screen pixels per font pixel) so it stays crisp.
