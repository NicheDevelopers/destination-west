# Pixel-art techniques

How the game's existing art was made. Use these recipes when you generate art with a one-off script, so new art matches the old. Each section names the PNGs that show the result. Convert one to text and read it before starting. The general style rules are in SKILL.md.

## Contents

- [Scripting a piece](#scripting-a-piece): `draw.py`, shade ramps, dithering, noise, outlines
- [Tiles, rocks and plants](#tiles-rocks-and-plants): seamless ground, faceted rocks, shrubs and grass
- [Buildings](#buildings): sizes, 32×32 chunks, wall materials, false fronts, windows, doors, porches, signs
- [UI images](#ui-images): nine-slice frames at scale 4
- [Characters and the logo](#characters-and-the-logo): animation strips, polygon illustrations
- [Fonts](#fonts)

## Scripting a piece

Small sprites can be written by hand. Anything big, repetitive, textured or in several sizes is easier to generate with a throwaway script in `/tmp` that uses `tools/pixel-art/draw.py`:

```python
import sys; sys.path.insert(0, "/Users/<you>/.../destination-west/tools/pixel-art")  # absolute path to the repo
from draw import Grid, hash01, value_noise

PALETTE = """
. transparent
K #1e140c
# wood, light to dark
W #b07a42
A #8a5a2e
a #5a3418
"""
DARKER = {"W": "A", "A": "a", "a": "K"}

grid = Grid(32, 32)
...
grid.save("/tmp/piece-preview.png", PALETTE, 10)  # look at this
grid.save("public/img/piece.png", PALETTE, 2)     # final
```

- **Randomness is always `hash01(x, y, seed)`**, never `random`. Running the script again then gives the same pixels, and you can fix one thing without everything else changing.
- **Give every material a shade ramp** in the palette, light to dark, and a `DARKER` map (and `LIGHTER` if needed) that steps along it. Shading is then `grid.shift_shade(x, y, DARKER)` instead of picking colors by hand.
- **Shading with light from the top left:** lit edges get one step lighter, edges facing right or down get one or two steps darker, and the shadow falls to the bottom right.
- **Soft shadows are dithered**, not blended: `grid.soft_shadow(x0, x1, y, [1, 0.7, 0.4, 0.15], DARKER)` darkens a falling share of pixels in each row. Use this under roofs, sills, signs and porches, and along the base of walls.
- **Smooth gradients are dithered too.** Step between two neighbouring shades with a checkerboard (`(x + y) % 2`) in the band where they meet. Glass that brightens toward the bottom is done this way.
- **Texture comes from `value_noise`** (blotches, `cell` 8–16) plus `hash01` per pixel (grain). Use a few percent of pixels one shade darker or lighter, not more.
- **Outlines** come from `grid.outline(outline_char_for, sides=...)`. They replace edge pixels rather than adding a ring, so shapes lose a pixel on each outlined side. Items and characters get a near-black `K` all around. Things standing in the world only get their right and bottom edges darkened, with `outline_char_for` mapping each material to its own darkest shade. Outline before you draw ground shadows.

## Tiles, rocks and plants

`sand.png`, `rocks.png`, `plants.png`

- **Ground tiles must tile without seams.** Use `value_noise(..., wrap=32)` and `hash01(x % 32, y % 32, ...)` so the left edge continues the right one.
- **Sand:** a base shade with about 10% darker and 7% lighter grain, 1–2% darkest and lightest specks, and a thin spread of faint greenery only slightly greener than the dirt. Variants differ only by seed, plus a few tufts or shrublets. Some are scattered, some clustered around one spot so growth looks clumped.
- **Plants and rocks sit in a 32×32 frame**, standing on a base line near the bottom, with a 1–2 px shadow on the ground to the bottom right.
  - **Rocks** are polygons filled back to front, one shade per facet: lit top, mid front, dark side. Add grain, faint sediment layers on side faces, and a side that gets darker toward the base. Edges facing away from the light get darker, with no outline toward the light.
  - **Shrubs** are a dome of leaf clumps (`hash01(x // 2, y // 2)`), airy toward the edge, shaded by position (top left light), with twigs at the base. Grass is a few leaning blades of random length.

## Buildings

`house-*.png`, `saloon-*.png`, `sheriff-*.png`, `bank-*.png`

Every building type comes in the sizes `3x2, 4x2, 3x3, 4x3, 5x3` (tiles wide × tall, 32 px per tile), plus a sheet (`house.png` etc.) with the separate parts. The game loads `<type>-<w>x<h>.png`.

- **Build from 32×32 chunks.** Each type has a roof (false front) row, an upper-floor row (3-tall sizes only) and a ground row. Each row has a left-edge, a plain and a right-edge chunk, with variants for door and window. A size is a layout of chunks per width:
  - width 3: `edge, door, edge`
  - width 4: `edge, door, window, edge`
  - width 5: `edge, window, door, window, edge`

  Draw each chunk as its own Grid, `paste` them side by side, then draw things that span chunks on top. The main one is the sign, centered on the whole roof row: `x0 = (width * 32 - 32) // 2`.

- **Seamless joins:** wall textures are generated from absolute coordinates with the same seed in every chunk, so neighbouring chunks line up.
- **Making a new size without a script:** convert the nearest size to text, keep its left and right edge columns, and repeat or cut whole 32-px middle columns. Then redraw the sign and anything else that is centered.
- **Wall materials:**
  - _Clapboard_ (house, saloon): horizontal lap boards 3–4 px tall. Each board has its rows in light, mid and shadow shades, the lap line darkest. Butt joints sit at a random x per board (`hash01(board, 0, seed)`). Rare grain specks are one shade off. For a run-down look, peel the paint in patches (`hash01(x // 6, board)`) to show bare wood, knock out a board (dark gap), or leave one loose and skewed.
  - _Adobe/plaster_ (sheriff): two octaves of value noise picking between 3 plaster shades, plus grain. Spalled patches are irregular blobs where the plaster fell off, showing staggered bricks (4 px courses, 8 px bricks, mortar lines). The top and left lip of the hole is shaded and the bottom lip lit. Add hairline cracks from window corners, a damp darker band at the base and rounded corners (lit on the left, shaded on the right).
  - _Brick:_ staggered courses, two brick shades picked per brick by hash, mortar a light gray-tan.
- **False fronts:** the top of the wall is cut by a profile function of the horizontal position: arched, shoulders, stepped, raised or terraced. Give each size its own profile and paint color, so neighbouring houses differ. Add a cornice of trim lines with small dentils under the top, and darken the 2 rows under it.
- **Openings:**
  - **Windows** have a trim frame, a dark sill with a soft shadow under it, and a lintel above. Glass is dark with a diagonal sky reflection band (`(x + y) % 9 < 2`). Saloon windows are lamp-lit and dithered warm toward the bottom, with curtains. Sheriff windows are a deep recess (lit left reveal, shaded right) with iron bars. Boarded windows are planks across the frame.
  - **Doors:** plank doors with a heavy lintel, saloon batwings drawn as a small hand-drawn stamp and mirrored, and brass handles as single light pixels.
- **Porches** span the ground row:
  - roof in 3 shingle courses (5 px shingles, offset each course), with a ragged bottom edge where some shingles hang lower
  - posts at the edges
  - a plank deck
  - steps in front of the door
  - a strong dithered shadow on the wall under the porch roof
- **Signs:** a board with a dark border, light top edge and dark bottom edge. Letters are tiny bitmaps (3×5, `N` 4×5) drawn one shade lighter than the board, with a 1 px drop shadow to the bottom right. Add a few worn pixels in the paint and a shadow under the board.
- **Details that sell it:** a star badge on the sheriff, small vents, blank boards with nail heads, diagonal bracing planks and missing boards. Use them sparingly, one or two per building.

## UI images

`dialogue-frame.png`, `dialogue-sign.png`, `dialogue-bullet.png`, `dialogue-next.png`

- **Drawn small, rendered at scale 4**, and used by CSS `border-image` as a nine-slice. The frame is 36×36 art pixels with a 12 px slice, so the CSS uses `border-image: url(...) 48 fill / 48px round`, because 12 × 4 = 48.
- **Make the middle and edge strips repeat.** The CSS uses `round`, so map positions into the repeating part (`tiled(position)`) when generating texture.
- **Frame:** a wood border built from planks with grain streaks running along them (lit outer edge, shaded inner edge), square corner blocks with a brass nail, and a dark line between frame and parchment. The parchment fill is light with sparse darker flecks.
- **Small icons** (bullet, arrow) are hand-drawn stamps.

## Characters and the logo

`gunslinger/*.png`, logo (64×64)

- **Animation frames** sit side by side in one strip, all the same size, facing right. Keep the feet on the same base line in every frame.
- **For a bigger illustration such as the logo:**
  - Describe each part (hat crown, brim, band, face, hair, collar, scarf, coat) as a polygon.
  - Fill them back to front.
  - Shade each part with its own function of x and y (light from the top left plus a little noise).
  - Add details as stamps (eye, ear, whiskers).
  - Finish with a `K` outline around the whole figure.

## Fonts

`tools/pixel-art/font.txt` → `public/fonts/destination-west.ttf`. See the README. Keep stroke widths even. A thin `s` or `S` stood out before and had to be redrawn with 2 px strokes.
