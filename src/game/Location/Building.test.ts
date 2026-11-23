import { describe, expect, it, vi } from "vite-plus/test";
import { TILE_SIZE } from "@/engine/consts";
import Building from "./Building";

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
