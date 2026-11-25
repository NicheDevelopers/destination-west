"""Build a TrueType font from the hand-drawn glyph sheet in font.txt.

Every pixel becomes a square in the outline, so the font stays crisp when its size is a
multiple of 12px (one pixel per 12th of the font size). Only uses the standard library.

Usage: python3 tools/pixel-art/font_build.py tools/pixel-art/font.txt public/fonts/destination-west.ttf
"""

import struct
import sys

FAMILY = "Destination West"
PIXEL = 100
ROWS = 11
ROWS_ABOVE_BASELINE = 8
UNITS_PER_EM = 12 * PIXEL
ASCENT = 9 * PIXEL
DESCENT = 3 * PIXEL
SPACE_WIDTH = 3
LETTER_SPACING = 1


def read_sheet(path):
    order = []
    rows = []
    in_grid = False
    for line in open(path).read().splitlines():
        if in_grid:
            if line:
                rows.append(line)
            continue
        if line.startswith("# glyphs: "):
            order.extend(line[len("# glyphs: "):])
        if line.strip() == "---":
            in_grid = True

    bitmaps = []
    for band_top in range(0, len(rows), ROWS):
        band = rows[band_top:band_top + ROWS]
        separators = [x for x, char in enumerate(band[0]) if char == "|"]
        for left, right in zip(separators, separators[1:]):
            bitmaps.append([row[left + 1:right] for row in band])

    if len(bitmaps) != len(order):
        raise ValueError(f"sheet has {len(bitmaps)} glyphs, but {len(order)} are listed")
    return dict(zip(order, bitmaps))


def rectangles(bitmap):
    """Horizontal runs of ink, merged downwards while the run below is identical."""
    runs_by_row = []
    for row in bitmap:
        runs = []
        x = 0
        while x < len(row):
            if row[x] != "K":
                x += 1
                continue
            start = x
            while x < len(row) and row[x] == "K":
                x += 1
            runs.append((start, x))
        runs_by_row.append(runs)

    result = []
    for y, runs in enumerate(runs_by_row):
        for run in runs:
            if y > 0 and run in runs_by_row[y - 1]:
                continue
            bottom = y + 1
            while bottom < len(runs_by_row) and run in runs_by_row[bottom]:
                bottom += 1
            result.append((run[0], y, run[1], bottom))
    return result


def glyph_data(bitmap):
    """Encode a glyph as a simple TrueType glyph. Returns (data, x_max, points, contours)."""
    contours = []
    for left, top, right, bottom in rectangles(bitmap):
        x0 = left * PIXEL
        x1 = right * PIXEL
        y_top = (ROWS_ABOVE_BASELINE - top) * PIXEL
        y_bottom = (ROWS_ABOVE_BASELINE - bottom) * PIXEL
        contours.append([(x0, y_top), (x1, y_top), (x1, y_bottom), (x0, y_bottom)])
    if not contours:
        return b"", 0, 0, 0

    points = [point for contour in contours for point in contour]
    xs = [x for x, _ in points]
    ys = [y for _, y in points]
    data = struct.pack(">hhhhh", len(contours), min(xs), min(ys), max(xs), max(ys))
    end_point = -1
    for contour in contours:
        end_point += len(contour)
        data += struct.pack(">H", end_point)
    data += struct.pack(">H", 0)
    data += bytes([1]) * len(points)
    previous = 0
    for x in xs:
        data += struct.pack(">h", x - previous)
        previous = x
    previous = 0
    for y in ys:
        data += struct.pack(">h", y - previous)
        previous = y
    while len(data) % 4:
        data += b"\0"
    return data, max(xs), len(points), len(contours)


def checksum(data):
    data += b"\0" * (-len(data) % 4)
    return sum(struct.unpack(f">{len(data) // 4}I", data)) & 0xFFFFFFFF


def cmap_table(codes_to_glyphs):
    codes = sorted(codes_to_glyphs)
    segments = [(code, code, codes_to_glyphs[code] - code) for code in codes]
    segments.append((0xFFFF, 0xFFFF, 1))
    count = len(segments)
    search_range = 2 ** (count.bit_length() - 1) * 2
    entry_selector = count.bit_length() - 1
    subtable = struct.pack(">HHH", 4, 0, 0)
    subtable += struct.pack(">HHHH", count * 2, search_range, entry_selector, count * 2 - search_range)
    subtable += b"".join(struct.pack(">H", end) for _, end, _ in segments)
    subtable += struct.pack(">H", 0)
    subtable += b"".join(struct.pack(">H", start) for start, _, _ in segments)
    subtable += b"".join(struct.pack(">h", ((delta + 0x8000) % 0x10000) - 0x8000) for _, _, delta in segments)
    subtable += b"".join(struct.pack(">H", 0) for _ in segments)
    subtable = subtable[:2] + struct.pack(">H", len(subtable)) + subtable[4:]
    return struct.pack(">HHHHI", 0, 1, 3, 1, 12) + subtable


def name_table():
    names = {1: FAMILY, 2: "Regular", 3: FAMILY, 4: FAMILY, 5: "Version 1.0", 6: FAMILY.replace(" ", "")}
    records = b""
    strings = b""
    for name_id, text in names.items():
        encoded = text.encode("utf-16-be")
        records += struct.pack(">HHHHHH", 3, 1, 0x409, name_id, len(encoded), len(strings))
        strings += encoded
    return struct.pack(">HHH", 0, len(names), 6 + len(records)) + records + strings


def os2_table(advances, first_char, last_char):
    average_width = sum(advances) // len(advances)
    data = struct.pack(">HhHHH", 4, average_width, 400, 5, 0)
    data += struct.pack(">hhhhhhhh", 600, 600, 0, 150, 600, 600, 0, 350)
    data += struct.pack(">hhh", PIXEL, 4 * PIXEL, 0)
    data += bytes(10)
    data += struct.pack(">IIII", 1, 0, 0, 0)
    data += b"DWst"
    data += struct.pack(">HHH", 0x40, first_char, min(last_char, 0xFFFF))
    data += struct.pack(">hhhHH", ASCENT, -DESCENT, 0, ASCENT, DESCENT)
    data += struct.pack(">II", 1, 0)
    data += struct.pack(">hhHHH", 5 * PIXEL, 8 * PIXEL, 0, 32, 0)
    return data


def build(glyphs):
    characters = sorted(glyphs)
    glyph_bytes = [b""]
    advances = [(SPACE_WIDTH + LETTER_SPACING) * PIXEL]
    left_bearings = [0]
    max_points = 0
    max_contours = 0
    codes_to_glyphs = {ord(" "): 1}
    glyph_bytes.append(b"")
    advances.append((SPACE_WIDTH + LETTER_SPACING) * PIXEL)
    left_bearings.append(0)
    for character in characters:
        bitmap = glyphs[character]
        data, _, points, contours = glyph_data(bitmap)
        codes_to_glyphs[ord(character)] = len(glyph_bytes)
        glyph_bytes.append(data)
        advances.append((len(bitmap[0]) + LETTER_SPACING) * PIXEL)
        left_bearings.append(struct.unpack(">h", data[2:4])[0] if data else 0)
        max_points = max(max_points, points)
        max_contours = max(max_contours, contours)

    glyf = b""
    offsets = []
    for data in glyph_bytes:
        offsets.append(len(glyf))
        glyf += data
    offsets.append(len(glyf))
    loca = b"".join(struct.pack(">I", offset) for offset in offsets)

    glyph_count = len(glyph_bytes)
    x_max = max(advances)
    hmtx = b"".join(struct.pack(">Hh", advance, bearing) for advance, bearing in zip(advances, left_bearings))
    head = struct.pack(
        ">IIIIHHqqhhhhHHhhh",
        0x00010000, 0x00010000, 0, 0x5F0F3CF5, 0x000B, UNITS_PER_EM, 0, 0,
        0, -DESCENT, x_max, ASCENT, 0, 8, 2, 1, 0,
    )
    hhea = struct.pack(
        ">IhhhHhhhhhhhhhhhH",
        0x00010000, ASCENT, -DESCENT, 0, x_max, 0, 0, x_max, 1, 0, 0, 0, 0, 0, 0, 0, glyph_count,
    )
    maxp = struct.pack(">IHHHHHHHHHHHHHH", 0x00010000, glyph_count, max_points, max_contours,
                       0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0)
    post = struct.pack(">IIhhIIIII", 0x00030000, 0, -PIXEL, PIXEL, 0, 0, 0, 0, 0)
    codes = sorted(codes_to_glyphs)
    tables = {
        "OS/2": os2_table(advances, codes[0], codes[-1]),
        "cmap": cmap_table(codes_to_glyphs),
        "glyf": glyf,
        "head": head,
        "hhea": hhea,
        "hmtx": hmtx,
        "loca": loca,
        "maxp": maxp,
        "name": name_table(),
        "post": post,
    }

    count = len(tables)
    search_range = 2 ** (count.bit_length() - 1) * 16
    entry_selector = count.bit_length() - 1
    font = struct.pack(">IHHHH", 0x00010000, count, search_range, entry_selector, count * 16 - search_range)
    offset = len(font) + 16 * count
    directory = b""
    body = b""
    head_offset = 0
    for tag in sorted(tables):
        data = tables[tag]
        if tag == "head":
            head_offset = offset + len(body)
        directory += struct.pack(">4sIII", tag.encode(), checksum(data), offset + len(body), len(data))
        body += data + b"\0" * (-len(data) % 4)
    font += directory + body

    adjustment = (0xB1B0AFBA - checksum(font)) & 0xFFFFFFFF
    return font[:head_offset + 8] + struct.pack(">I", adjustment) + font[head_offset + 12:]


glyphs = read_sheet(sys.argv[1])
with open(sys.argv[2], "wb") as file:
    file.write(build(glyphs))
