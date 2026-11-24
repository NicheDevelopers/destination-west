import { describe, expect, it, vi } from "vite-plus/test";
import "@/lib/utilities";
import { TILE_SIZE } from "@/engine/consts";
import imgInfo from "@/game/imgInfo";
import Building, { buildingImageName, type BuildingType } from "./Building";
import presets from "./townPresets";

vi.mock("@/engine/Browser", () => ({ ctx: {} }));
vi.mock("@/engine/Entity", () => ({
  default: class {
    pos: { x: number; y: number };
    constructor(_typeName: string, pos: { x: number; y: number }) {
      this.pos = pos;
    }
  },
}));

describe("getDoorstep", () => {
  it.each([
    [3, 2, 1],
    [3, 3, 1],
    [4, 2, 1],
    [4, 3, 1],
    [5, 3, 2],
  ])("is in front of the door of a %ix%i building", (xTiles, yTiles, doorOffset) => {
    const building = new Building({ x: 10 * TILE_SIZE, y: 4 * TILE_SIZE }, xTiles, yTiles, "house");
    expect(building.getDoorstep()).toEqual({ x: 10 + doorOffset, y: 4 + yTiles });
  });
});

describe("building images", () => {
  const imageFiles = Object.keys(import.meta.glob("/public/img/*.png"));
  const types: BuildingType[] = ["saloon", "sheriff", "bank", "house"];
  const sizes = new Set(["3x2"]);
  for (const preset of presets) {
    for (const building of preset.buildings) sizes.add(`${building.xTiles}x${building.yTiles}`);
  }

  it.each(types.flatMap((type) => [...sizes].map((size) => [type, size])))(
    "exist for a %s of size %s",
    (type, size) => {
      const [xTiles, yTiles] = size.split("x").map(Number);
      const name = buildingImageName(type as BuildingType, xTiles, yTiles);
      expect(imgInfo.has(name)).toBe(true);
      expect(imageFiles).toContain(`/public/img/${name}.png`);
    },
  );
});
