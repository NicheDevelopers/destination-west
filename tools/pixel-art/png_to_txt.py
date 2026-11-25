"""Turn a PNG into pixel-art text that can be read and edited, using only the standard library.

Finds how many PNG pixels make up one art pixel and writes one character per art pixel, with a
palette from darkest to lightest and "." for transparent. txt_to_png.py turns it back.

Usage: python3 tools/pixel-art/png_to_txt.py <input.png> <output.txt>
"""

import math
import struct
import sys
import zlib

CHARACTERS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    "!$%&*+,/:;<=>?@[]^_`{}~'\"()\\|"
)
CHANNELS_BY_COLOR_TYPE = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}


def read_png(path):
    with open(path, "rb") as file:
        data = file.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")

    position = 8
    compressed = b""
    palette = []
    transparency = b""
    while position < len(data):
        length = struct.unpack(">I", data[position : position + 4])[0]
        kind = data[position + 4 : position + 8]
        body = data[position + 8 : position + 8 + length]
        if kind == b"IHDR":
            width, height, bit_depth, color_type, _, _, interlace = struct.unpack(">IIBBBBB", body)
        elif kind == b"PLTE":
            palette = [tuple(body[i : i + 3]) for i in range(0, len(body), 3)]
        elif kind == b"tRNS":
            transparency = body
        elif kind == b"IDAT":
            compressed += body
        position += 12 + length

    if bit_depth != 8 or interlace != 0:
        raise ValueError(f"{path}: only 8-bit, non-interlaced PNGs are supported")

    channels = CHANNELS_BY_COLOR_TYPE[color_type]
    rows = unfilter(zlib.decompress(compressed), width, height, channels)

    pixels = []
    for row in rows:
        pixel_row = []
        for x in range(width):
            values = row[x * channels : (x + 1) * channels]
            pixel_row.append(to_rgba(values, color_type, palette, transparency))
        pixels.append(pixel_row)
    return pixels


def unfilter(raw, width, height, channels):
    stride = width * channels
    rows = []
    previous = bytearray(stride)
    position = 0
    for _ in range(height):
        filter_type = raw[position]
        row = bytearray(raw[position + 1 : position + 1 + stride])
        position += 1 + stride
        for i in range(stride):
            left = row[i - channels] if i >= channels else 0
            up = previous[i]
            up_left = previous[i - channels] if i >= channels else 0
            if filter_type == 1:
                row[i] = (row[i] + left) & 0xFF
            elif filter_type == 2:
                row[i] = (row[i] + up) & 0xFF
            elif filter_type == 3:
                row[i] = (row[i] + (left + up) // 2) & 0xFF
            elif filter_type == 4:
                row[i] = (row[i] + paeth(left, up, up_left)) & 0xFF
        rows.append(row)
        previous = row
    return rows


def paeth(left, up, up_left):
    estimate = left + up - up_left
    left_distance = abs(estimate - left)
    up_distance = abs(estimate - up)
    up_left_distance = abs(estimate - up_left)
    if left_distance <= up_distance and left_distance <= up_left_distance:
        return left
    if up_distance <= up_left_distance:
        return up
    return up_left


def to_rgba(values, color_type, palette, transparency):
    if color_type == 6:
        rgba = tuple(values)
    elif color_type == 2:
        rgba = (*values, 255)
    elif color_type == 3:
        index = values[0]
        alpha = transparency[index] if index < len(transparency) else 255
        rgba = (*palette[index], alpha)
    elif color_type == 4:
        rgba = (values[0], values[0], values[0], values[1])
    else:
        rgba = (values[0], values[0], values[0], 255)

    if rgba[3] == 0:
        return (0, 0, 0, 0)
    return rgba


def find_scale(pixels):
    """The biggest block size that every run of same-colored pixels fits into, both ways."""
    scale = 0
    for line in pixels + [list(column) for column in zip(*pixels)]:
        run = 1
        for index in range(1, len(line) + 1):
            if index < len(line) and line[index] == line[index - 1]:
                run += 1
                continue
            scale = math.gcd(scale, run)
            run = 1
    return scale


def color_text(rgba):
    if rgba[3] == 0:
        return "transparent"
    text = "#{:02x}{:02x}{:02x}".format(*rgba[:3])
    if rgba[3] != 255:
        text += f"{rgba[3]:02x}"
    return text


def brightness(rgba):
    return 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2]


def png_to_text(path):
    pixels = read_png(path)
    scale = find_scale(pixels)
    art = [row[::scale] for row in pixels[::scale]]

    colors = {rgba for row in art for rgba in row if rgba[3] != 0}
    if len(colors) > len(CHARACTERS):
        raise ValueError(f"{path} has {len(colors)} colors, at most {len(CHARACTERS)} fit")

    char_by_color = {(0, 0, 0, 0): "."}
    for char, rgba in zip(CHARACTERS, sorted(colors, key=brightness)):
        char_by_color[rgba] = char

    lines = [f"# scale {scale}"]
    for rgba, char in char_by_color.items():
        lines.append(f"{char} {color_text(rgba)}")
    lines.append("---")
    for row in art:
        lines.append("".join(char_by_color[rgba] for rgba in row))
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    text = png_to_text(sys.argv[1])
    with open(sys.argv[2], "w") as file:
        file.write(text)
