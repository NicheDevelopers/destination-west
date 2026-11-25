"""Turn a pixel-art text file back into a PNG, using only the standard library.

Text format: palette lines "<char> <#rrggbb | #rrggbbaa | transparent>", then a "---" line,
then one line of characters per art pixel row. A "# scale N" line above "---" sets how many
PNG pixels each art pixel becomes (default 1). png_to_txt.py writes that line for you.

Usage: python3 tools/pixel-art/txt_to_png.py <input.txt> <output.png>
"""

import struct
import sys
import zlib


def parse_color(text):
    if text == "transparent":
        return (0, 0, 0, 0)
    hex_digits = text.lstrip("#")
    red = int(hex_digits[0:2], 16)
    green = int(hex_digits[2:4], 16)
    blue = int(hex_digits[4:6], 16)
    alpha = int(hex_digits[6:8], 16) if len(hex_digits) == 8 else 255
    return (red, green, blue, alpha)


def parse_art(text):
    palette = {}
    rows = []
    scale = 1
    in_grid = False
    for line in text.splitlines():
        if not in_grid:
            if line.strip() == "---":
                in_grid = True
                continue
            if line.startswith("# scale "):
                scale = int(line.split()[2])
                continue
            if line.strip() == "" or line.startswith("#"):
                continue
            char, color = line.split()
            palette[char] = parse_color(color)
            continue
        if line.strip() == "":
            continue
        rows.append(line.rstrip("\n"))

    width = len(rows[0])
    for index, row in enumerate(rows):
        if len(row) != width:
            raise ValueError(f"row {index} has {len(row)} pixels, expected {width}")
        for char in row:
            if char not in palette:
                raise ValueError(f"row {index} uses unknown color '{char}'")
    return palette, rows, scale


def png_chunk(kind, data):
    checksum = zlib.crc32(kind + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", checksum)


def write_png(path, pixels, width, height):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixels[y][x])
    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    with open(path, "wb") as file:
        file.write(b"\x89PNG\r\n\x1a\n")
        file.write(png_chunk(b"IHDR", header))
        file.write(png_chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        file.write(png_chunk(b"IEND", b""))


def save_png(path, text, scale=None):
    """Renders art text to a PNG. `scale` overrides the text's "# scale" line."""
    palette, rows, text_scale = parse_art(text)
    if scale is None:
        scale = text_scale

    pixels = []
    for row in rows:
        scaled_row = []
        for char in row:
            scaled_row.extend([palette[char]] * scale)
        for _ in range(scale):
            pixels.append(scaled_row)

    write_png(path, pixels, len(rows[0]) * scale, len(rows) * scale)


if __name__ == "__main__":
    with open(sys.argv[1]) as file:
        save_png(sys.argv[2], file.read())
