"""Small drawing toolkit for one-off scripts that generate pixel art.

A script builds a Grid of palette characters, then calls grid.save(path, palette, scale).
Import it from a script anywhere with:

    import sys; sys.path.insert(0, "tools/pixel-art")
    from draw import Grid, hash01, value_noise
"""

from txt_to_png import save_png


def hash01(x, y, seed):
    """A repeatable pseudo-random number in [0, 1] for a cell and a seed."""
    h = ((x * 0x27D4EB2D) ^ (y * 0x165667B1) ^ (seed * 0x9E3779B9)) & 0xFFFFFFFF
    for _ in range(3):
        h ^= h >> 15
        h = (h * 0x2C1B3C6D) & 0xFFFFFFFF
        h ^= h >> 12
        h = (h * 0x297A2D39) & 0xFFFFFFFF
    h ^= h >> 15
    return (h & 0xFFFFFF) / 0xFFFFFF


def value_noise(x, y, seed, cell, wrap=None):
    """Smooth noise in [0, 1]. With `wrap` (the tile size in pixels) it repeats without seams."""
    grid_x, grid_y = x / cell, y / cell
    x0, y0 = int(grid_x), int(grid_y)
    fx, fy = grid_x - x0, grid_y - y0
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    cells = wrap // cell if wrap else None

    def corner(cx, cy):
        if cells:
            cx, cy = cx % cells, cy % cells
        return hash01(cx, cy, seed)

    top = corner(x0, y0) * (1 - fx) + corner(x0 + 1, y0) * fx
    bottom = corner(x0, y0 + 1) * (1 - fx) + corner(x0 + 1, y0 + 1) * fx
    return top * (1 - fy) + bottom * fy


class Grid:
    def __init__(self, width, height, fill="."):
        self.width = width
        self.height = height
        self.cells = [[fill] * width for _ in range(height)]

    def inside(self, x, y):
        return 0 <= x < self.width and 0 <= y < self.height

    def get(self, x, y):
        return self.cells[y][x] if self.inside(x, y) else "."

    def set(self, x, y, char):
        x, y = int(x), int(y)
        if self.inside(x, y):
            self.cells[y][x] = char

    def hline(self, y, x0, x1, char):
        for x in range(x0, x1 + 1):
            self.set(x, y, char)

    def vline(self, x, y0, y1, char):
        for y in range(y0, y1 + 1):
            self.set(x, y, char)

    def rect(self, x0, y0, x1, y1, char):
        for y in range(y0, y1 + 1):
            self.hline(y, x0, x1, char)

    def ellipse(self, center_x, center_y, radius_x, radius_y, char):
        for y in range(self.height):
            for x in range(self.width):
                dx = (x + 0.5 - center_x) / radius_x
                dy = (y + 0.5 - center_y) / radius_y
                if dx * dx + dy * dy <= 1:
                    self.cells[y][x] = char

    def polygon(self, points, char):
        """Fills every pixel whose center is inside the polygon given as (x, y) corners."""
        for y in range(self.height):
            for x in range(self.width):
                if point_in_polygon(x + 0.5, y + 0.5, points):
                    self.cells[y][x] = char

    def stamp(self, rows, x0, y0):
        """Copies a small hand-drawn picture (list of strings, "." skipped) onto the grid."""
        for dy, row in enumerate(rows):
            for dx, char in enumerate(row):
                if char != ".":
                    self.set(x0 + dx, y0 + dy, char)

    def paste(self, other, x0, y0):
        for y in range(other.height):
            for x in range(other.width):
                if other.cells[y][x] != ".":
                    self.set(x0 + x, y0 + y, other.cells[y][x])

    def shift_shade(self, x, y, steps_map, steps=1):
        """Moves a pixel along a shade map such as {"A": "a", "a": "d"}, e.g. to darken it."""
        if not self.inside(x, y):
            return
        for _ in range(steps):
            self.cells[y][x] = steps_map.get(self.cells[y][x], self.cells[y][x])

    def soft_shadow(self, x0, x1, y0, strengths, darker, seed=90):
        """Dithered shadow: strengths[i] (0..1) is how much of row y0 + i gets darkened."""
        for i, strength in enumerate(strengths):
            for x in range(x0, x1 + 1):
                if hash01(x, y0 + i, seed) < strength:
                    self.shift_shade(x, y0 + i, darker)

    def outline(self, outline_char_for, sides=("left", "right", "top", "bottom")):
        """Turns edge pixels of every shape into their outline char, so shapes lose one pixel on
        each outlined side. `outline_char_for(char)` returns e.g. "K" for a black outline, or a
        dark shade of the material for a soft one. Pass sides=("right", "bottom") to outline
        only the edges facing away from the light. Outline before drawing ground shadows, or
        the shadow counts as part of the shape."""
        directions = {"left": (-1, 0), "right": (1, 0), "top": (0, -1), "bottom": (0, 1)}
        edges = []
        for y in range(self.height):
            for x in range(self.width):
                if self.cells[y][x] == ".":
                    continue
                for side in sides:
                    dx, dy = directions[side]
                    if self.get(x + dx, y + dy) == ".":
                        edges.append((x, y))
                        break
        for x, y in edges:
            self.cells[y][x] = outline_char_for(self.cells[y][x])

    def text(self, palette):
        return palette.strip("\n") + "\n---\n" + "\n".join("".join(row) for row in self.cells) + "\n"

    def save(self, path, palette, scale):
        if path.endswith(".txt"):
            with open(path, "w") as file:
                file.write(f"# scale {scale}\n" + self.text(palette))
            return
        save_png(path, self.text(palette), scale)


def point_in_polygon(px, py, points):
    inside = False
    for i in range(len(points)):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % len(points)]
        if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside
