import { describe, expect, it, vi } from "vite-plus/test";
import type { Point } from "@/lib/utilities";
import { TILE_SIZE } from "./consts";
import Direction from "./Direction";
import Pathfinder from "./Pathfinder";
import type Tile from "./Tile";

vi.mock("./Browser", () => ({ ctx: {} }));

const blocker = {} as Tile["entities"][number];

/**
 * Builds a location from rows of text: "#" is a blocked tile,
 * "S" the start, "E" the end and anything else an empty tile.
 */
function parseMap(rows: string[]) {
  const tiles: Tile[][] = [];
  let start = { x: 0, y: 0 };
  let end = { x: 0, y: 0 };

  for (let x = 0; x < rows[0].length; x++) {
    tiles.push([]);
    for (let y = 0; y < rows.length; y++) {
      const char = rows[y][x];
      const entities: Tile["entities"] = char === "#" ? [blocker] : [];
      tiles[x].push({ gridPos: { x, y }, entities } as Tile);
      if (char === "S") start = { x, y };
      if (char === "E") end = { x, y };
    }
  }
  return { tiles, start, end };
}

function tileCenter({ x, y }: Point): Point {
  return { x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 };
}

function makePathfinder(rows: string[], diagonalMovement = false) {
  const { tiles, start, end } = parseMap(rows);
  const pathfinder = new Pathfinder(
    tiles,
    { getCenterPoint: () => tileCenter(start) },
    diagonalMovement,
  );
  pathfinder.changeStartTile();
  const endPoint = tileCenter(end);
  pathfinder.changeEndTile(endPoint.x, endPoint.y);
  return { pathfinder, start, end };
}

function expectValidPath(
  path: ReturnType<Pathfinder["search"]>,
  rows: string[],
  start: Point,
  end: Point,
) {
  expect(path).not.toBeNull();
  let previous = start;
  for (const node of path!) {
    const { x, y } = node.gridPos;
    expect(rows[y][x]).not.toBe("#");
    expect(Math.abs(x - previous.x) + Math.abs(y - previous.y)).toBe(1);

    const expectedDirection = new Direction().fromChangeInXAndY(x - previous.x, y - previous.y);
    expect(node.optimalDirection.toString()).toBe(expectedDirection.toString());
    previous = node.gridPos;
  }
  expect(previous).toEqual(end);
}

const mapWithDeadEnd = [
  "...#.", //
  "S..#E",
  ".###.",
  ".....",
];

const enclosedEnd = [
  "S.#..", //
  "..#E.",
  "..###",
];

describe("Pathfinder", () => {
  it("A* finds the shortest path around walls", () => {
    const { pathfinder, start, end } = makePathfinder(mapWithDeadEnd);
    const path = pathfinder.search();

    expectValidPath(path, mapWithDeadEnd, start, end);
    expect(path).toHaveLength(8);
  });

  it("greedy search backtracks out of dead ends", () => {
    const { pathfinder, start, end } = makePathfinder(mapWithDeadEnd);
    const path = pathfinder.greedySearch();

    expectValidPath(path, mapWithDeadEnd, start, end);
    expect(path!.map((node) => node.gridPos)).not.toContainEqual({ x: 2, y: 0 });
  });

  it("returns null when the end can't be reached", () => {
    const { pathfinder } = makePathfinder(enclosedEnd);
    expect(pathfinder.search()).toBeNull();
    expect(pathfinder.greedySearch()).toBeNull();
  });

  it("marks tiles with entities as not walkable", () => {
    const { pathfinder } = makePathfinder(enclosedEnd);
    expect(pathfinder.nodes[2][0].walkable).toBe(false);
    expect(pathfinder.nodes[1][0].walkable).toBe(true);
  });

  it("only returns neighbors inside the location", () => {
    const rows = ["S..", "...", "..E"];
    const straight = makePathfinder(rows).pathfinder;
    const diagonal = makePathfinder(rows, true).pathfinder;

    expect(straight.neighbors(straight.nodes[0][0])).toHaveLength(2);
    expect(straight.neighbors(straight.nodes[1][1])).toHaveLength(4);
    expect(diagonal.neighbors(diagonal.nodes[0][0])).toHaveLength(3);
    expect(diagonal.neighbors(diagonal.nodes[1][1])).toHaveLength(8);
  });

  it("throws when the end tile is outside the location", () => {
    const { pathfinder } = makePathfinder(["S.E"]);
    expect(() => pathfinder.changeEndTile(3 * TILE_SIZE, 0)).toThrow("Attempt to create endTile");
  });

  it("returns the path one step at a time", () => {
    const { pathfinder } = makePathfinder(["S.E"]);
    pathfinder.path = pathfinder.search();

    expect(pathfinder.getNextMove()?.gridPos).toEqual({ x: 1, y: 0 });
    expect(pathfinder.getNextMove()?.gridPos).toEqual({ x: 2, y: 0 });
    expect(pathfinder.getNextMove()).toBeNull();
  });
});
