"""Draw a sprite on top of a ground tile, to check how it reads in the game.

The ground's first frame (top-left, the size of one sprite frame) is repeated under the whole
sprite, then the sprite is blended on top and everything is enlarged for viewing.

Usage: python3 tools/pixel-art/preview_on_ground.py <sprite.png> <ground.png> <output.png> [zoom]
Example: python3 tools/pixel-art/preview_on_ground.py /tmp/trough.png public/img/sand.png /tmp/on-sand.png 5
"""

import sys

from png_to_txt import read_png
from txt_to_png import write_png

TILE = 64


def blend(top, bottom):
    alpha = top[3] / 255
    return tuple(round(top[i] * alpha + bottom[i] * (1 - alpha)) for i in range(3)) + (255,)


def main():
    sprite = read_png(sys.argv[1])
    ground = read_png(sys.argv[2])
    zoom = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    height = len(sprite)
    width = len(sprite[0])
    ground_size = min(TILE, len(ground), len(ground[0]))

    pixels = []
    for y in range(height * zoom):
        row = []
        for x in range(width * zoom):
            under = ground[(y // zoom) % ground_size][(x // zoom) % ground_size]
            row.append(blend(sprite[y // zoom][x // zoom], under))
        pixels.append(row)
    write_png(sys.argv[3], pixels, width * zoom, height * zoom)


if __name__ == "__main__":
    main()
