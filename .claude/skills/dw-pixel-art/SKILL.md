---
name: dw-pixel-art
description: Draw or change Destination West's pixel art (sprites, tiles, buildings, decorations, props, items, characters, UI images, the pixel font) in the game's realistic, gritty western style. Converts PNGs to text grids and back with tools/pixel-art, and generates bigger pieces with one-off scripts. Use whenever a task needs a new or edited image in public/img or a change to public/fonts.
---

# Pixel art

The PNGs in `public/img/` are the source of truth. Text is only how you read and edit them. The tools are in `tools/pixel-art/`; its README has the commands and the text format.

- `png_to_txt.py <png> <txt>`: turns a PNG into a grid of palette characters, one per art pixel, and records its scale.
- `txt_to_png.py <txt> <png>`: turns the grid back into a PNG.
- `preview_on_ground.py <sprite.png> <ground.png> <out.png> [zoom]`: draws a sprite on a ground tile (`public/img/sand.png`, `path.png`) so you can see how it reads in the game.
- `draw.py`: a toolkit for one-off scripts that generate art: `Grid`, `hash01`, `value_noise`, shading, dithered shadows and outlines.
- `font.txt` and `font_build.py`: the pixel font.

Scripts in `/tmp` import the toolkit with an absolute path: `sys.path.insert(0, "<repo>/tools/pixel-art")`.

## Look and feel

Realistic and gritty, not cartoonish. Think of a dusty frontier town that has seen hard years:

- **Colors:** muted, sun-bleached and earthy. No saturated or candy colors, and no pure black or white. Even reds, greens and blues are dusty and greyed.
- **Wear everywhere:** weathered wood grain, peeling paint, cracks, chipped edges, rust on iron, dirt collecting at the base. Every surface gets texture and a little irregularity. Nothing is clean, flat or perfectly straight.
- **Proportions:** true to life. No chunky or rounded "cute" shapes, no oversized features, no thick bubbly outlines.
- **Shading:** shade with 3 to 5 tones per material and dithering. Don't fill shapes with one flat color.

## Workflow

1. **Look first.** Convert the image you're changing, plus one or two current-style images of the same kind (see below), into `/tmp` with `png_to_txt.py`. Read them. Match their frame size, scale, palette, outline, shading and level of wear.
2. **Choose how to draw.**
   - Small edits and small sprites: edit the text grid directly.
   - Anything big, textured, repetitive or in several sizes (buildings, tiles, variants): write a throwaway script in `/tmp` that uses `draw.py`.
   - [techniques.md](techniques.md) explains how each kind of existing art was made. Reuse those recipes.
3. **Preview and look.**
   - Render at scale 8–10 into `/tmp` and look at it with the Read tool.
   - For anything that stands in the world, also check it with `preview_on_ground.py` on `sand.png` and `path.png`. Lit edges that are close to the ground color disappear.
   - Fix what looks wrong and look again. Expect at least one round of fixes. Thin parts come out too skinny, parts that should touch leave gaps, and small emblems turn into unintended shapes.
4. **Write the final PNG** into `public/img/`, at the scale the art around it uses: 2 for game art, 4 for dialogue UI.
5. **Wire it in and check it in the game.** New images have to be registered in `src/game/imgInfo.ts` or `src/game/items.ts`. Run the game (`vp dev`) and check the image next to the art around it. If you're only asked for a draft outside the repo, skip this step but still do the ground preview.
6. **Clean up.** Leave scripts and `.txt` files in `/tmp`. Only the PNGs, and `font.txt` for font changes, go into the repo.

## Current style vs legacy art

**Current style (match these):**

- `sand.png`, `rocks.png`, `plants.png`
- `house-*.png`, `saloon-*.png`, `sheriff-*.png`
- `gunslinger/*.png`
- the `dialogue-*.png` images
- `town-props.png`, `barrel.png`, `items.png`, `chuck-a-luck-table.png`
- `minigame_assets/*.png`

**Legacy (don't copy their look):**

- `bank-*.png`

## Decorations

Decorations are things placed on the map: rocks, plants, props.

- **Frame:** one 32×32 art-pixel frame each, in a sprite sheet (`rocks.png`, `plants.png`).
- **Viewpoint:** front-on with a slight top-down angle, so the tops of things are visible.
- **Base line:** objects stand on rows 27–29, with a transparent margin around them.
- **Naming:** they're registered as `decoration-<name>-<n>`. Add `_nc` if the player can walk through it (no collisions). Add `_nd` if it's always drawn under everything else (no depth sorting), which suits flat things like pebbles.

## Style rules

- **Light** comes from the top left.
- **Outlines:**
  - Characters and items get a near-black outline all around (`#1e140c`, or `#33231a` on buildings).
  - Things standing in the world (rocks, plants, props) get no outline toward the light. Their right and bottom edges get one or two steps darker: `grid.outline(..., sides=("right", "bottom"))` with each material's darkest shade.
  - `outline` replaces edge pixels, so leave a pixel to spare.
  - Outline before you draw the ground shadow.
- **Ground shadows** fall to the bottom right. Use an opaque, darker sand color, as `rocks.png` (`#b4865b`) and `plants.png` (`#c2966a`) do.
- **Shadows on a surface and gradients** are dithered, never blended.
- **Inner lines:** dark lines inside a shape separate its parts (barrel from cylinder, door from frame).
- **Plan before drawing.** Decide which columns and rows each part takes and where the centre is, and keep symmetric things symmetric. When writing a grid by hand, check that every row adds up to the full width.
- **Emblems:** small emblems easily read as something else. A 4×3 filled block looks like a medical cross, so use a ring or a line instead.
- **Never use AI-generated images.** Every pixel comes from your text or your script.

## Palettes

Take colors from the art the new piece will sit next to. Convert it and reuse its ramps. These are in use now:

- **Weathered building wood**, dark to light: `#33231a #4a3828 #5f4a33 #846847 #9a7f5c #b49a74 #c2a57a`
- **Faded house paint**, one ramp per house:
  - tan `#cdb894 #b09c79 #857559`
  - blue-gray `#9aa3a6 #838c90 #5f666a`
  - rust `#b0735a #945d48 #6a4336`
- **Iron:** `#6b6e76 #9a9ea6`
- **Sand:** `#b78a5e #c89a6b #cfa171 #d4a676 #d8aa7a`, with faint greenery `#c9a46d #b9a06a`
- **Sandstone:** `#643c26 #855436 #95593b #a8714b #bb7a55 #c99367 #e2b688 #f2d9b2`
- **Item palettes:**
  - steel `#3a3d44 #6b7079 #9aa0a8 #d4d9de`
  - brass `#8a6a24 #c9a544`
  - amber `#8e4a12 #c8781e #e8a23a #f5cf6b`
  - paper `#c9b48a #efe2c0`
  - dried-blood red `#6b1a12 #9c2a1e`

For a material that isn't listed, such as water, cloth or leather, make a muted, greyed ramp that sits beside these without standing out.
