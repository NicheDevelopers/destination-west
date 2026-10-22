import { describe, expect, it, vi } from "vite-plus/test";
import type { Point } from "@/lib/utilities";
import { DIRECTIONS } from "./consts";
import Direction from "./Direction";
import type Entity from "./Entity";
import Hitbox, { Box } from "./HitboxClass";
import type Tile from "./Tile";

vi.mock("./Browser", () => ({ ctx: {} }));

type FakeEntity = Entity & { hitbox: Hitbox };

function makeEntity(center: Point, size: number, tiles: Tile[][] = []): FakeEntity {
  const entity = { getCenterPoint: () => center } as unknown as FakeEntity;
  entity.hitbox = new Hitbox(entity, { up: size, left: size, right: size, down: size }, tiles);
  return entity;
}

function makeTiles(width: number, height: number): Tile[][] {
  const tiles: Tile[][] = [];
  for (let x = 0; x < width; x++) {
    tiles.push([]);
    for (let y = 0; y < height; y++) {
      const tile = {
        entities: [] as Entity[],
        addEntity(entity: Entity) {
          this.entities.push(entity);
        },
        removeEntity(entity: Entity) {
          this.entities = this.entities.filter((e) => e !== entity);
        },
      };
      tiles[x].push(tile as unknown as Tile);
    }
  }
  return tiles;
}

describe("Box", () => {
  it("intersects boxes that overlap or touch", () => {
    const box = new Box(0, 10, 0, 10);
    expect(box.intersects(new Box(5, 15, 5, 15))).toBe(true);
    expect(box.intersects(new Box(10, 20, 0, 10))).toBe(true);
    expect(box.intersects(new Box(11, 20, 0, 10))).toBe(false);
    expect(box.intersects(new Box(0, 10, 11, 20))).toBe(false);
  });

  it("returns the corners on the side of the movement", () => {
    const box = new Box(0, 10, 20, 30);
    expect(box.getImportantCorners(5, 0)).toEqual([
      { x: 10, y: 20 },
      { x: 10, y: 30 },
    ]);
    expect(box.getImportantCorners(-5, -5)).toEqual([
      { x: 0, y: 20 },
      { x: 10, y: 20 },
      { x: 0, y: 30 },
    ]);
    expect(box.getImportantCorners(0, 0)).toEqual([]);
  });
});

describe("Hitbox", () => {
  it("is centered on the entity's center point", () => {
    const entity = makeEntity({ x: 100, y: 50 }, 10);
    expect(entity.hitbox.getBoundingBox().getCorners()).toEqual([
      { x: 90, y: 40 },
      { x: 110, y: 40 },
      { x: 90, y: 60 },
      { x: 110, y: 60 },
    ]);
  });

  it("lists the tiles it intersects", () => {
    const insideOneTile = makeEntity({ x: 96, y: 96 }, 10);
    expect(insideOneTile.hitbox.getIntersectingTileCoordinates()).toEqual([{ x: 1, y: 1 }]);

    const onTileCorner = makeEntity({ x: 64, y: 64 }, 10);
    expect(onTileCorner.hitbox.getIntersectingTileCoordinates()).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it("includes the tiles between the corners of a hitbox larger than a tile", () => {
    const entity = makeEntity({ x: 160, y: 32 }, 0);
    entity.hitbox = new Hitbox(entity, { up: 10, down: 10, left: 100, right: 100 }, []);

    expect(entity.hitbox.getIntersectingTileCoordinates()).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]);
  });

  it("registers its entity on the tiles it intersects", () => {
    const tiles = makeTiles(3, 3);
    const entity = makeEntity({ x: 64, y: 32 }, 10, tiles);

    entity.hitbox.updateTilePresence();
    expect(tiles[0][0].entities).toEqual([entity]);
    expect(tiles[1][0].entities).toEqual([entity]);
    expect(tiles[2][0].entities).toEqual([]);
    expect(entity.hitbox.isAtTile(1, 0)).toBe(true);
  });

  it("moves its entity to the tiles of a new location", () => {
    const oldTiles = makeTiles(2, 2);
    const newTiles = makeTiles(2, 2);
    const entity = makeEntity({ x: 32, y: 32 }, 10, oldTiles);
    entity.hitbox.updateTilePresence();

    entity.hitbox.changeLocation(newTiles);
    expect(oldTiles[0][0].entities).toEqual([]);
    expect(newTiles[0][0].entities).toEqual([entity]);
    expect(entity.hitbox.locationArray).toBe(newTiles);
  });

  describe("collisions with tiles", () => {
    // The mover's right edge is at x=42, the wall's left edge at x=86
    function setUp() {
      const tiles = makeTiles(3, 1);
      const mover = makeEntity({ x: 32, y: 32 }, 10);
      const wall = makeEntity({ x: 96, y: 32 }, 10);
      tiles[0][0].entities.push(mover);
      tiles[1][0].entities.push(wall);
      return { tiles, mover };
    }

    it("collides with a non-walkable entity on the tile it moves into", () => {
      const { tiles, mover } = setUp();
      expect(mover.hitbox.willCollideWithTiles(43, 0, tiles)).toBe(false);
      expect(mover.hitbox.willCollideWithTiles(44, 0, tiles)).toBe(true);
    });

    it("doesn't collide with itself", () => {
      const { tiles, mover } = setUp();
      expect(mover.hitbox.willCollideWithTiles(1, 0, tiles)).toBe(false);
    });

    it("collides with the edge of the location", () => {
      const { tiles, mover } = setUp();
      expect(mover.hitbox.willCollideWithTiles(-22, 0, tiles)).toBe(false);
      expect(mover.hitbox.willCollideWithTiles(-23, 0, tiles)).toBe(true);
      expect(mover.hitbox.willCollideWithTiles(0, 21, tiles)).toBe(false);
      expect(mover.hitbox.willCollideWithTiles(0, 22, tiles)).toBe(true);
    });

    it("measures how far it can move before colliding", () => {
      const { tiles, mover } = setUp();
      const right = new Direction(DIRECTIONS.right);
      expect(mover.hitbox.distanceTillTileCollision(right, 100, tiles)).toBe(43);
      expect(mover.hitbox.distanceTillTileCollision(right, 10, tiles)).toBe(10);
      expect(() => mover.hitbox.distanceTillTileCollision(right, 0, tiles)).toThrow();
    });
  });
});
