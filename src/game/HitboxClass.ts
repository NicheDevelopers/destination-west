import { ctx } from "@/core/Browser.js";
import type Entity from "@/Entity/Entity.js";
import { TILE_SIZE, type DirectionValue } from "@/global/consts.js";
import { pointToTileCoord, generateID, type Point } from "@/utilities/utilities.js";
import { ObjectSet } from "@/utilities/ObjectSet.js";
import { DIRECTIONS, Direction } from "@/utilities/utilities.js";
import type Tile from "./Tile.js";

function fillTileArea(tileCoords: Point[]): Point[] {
  let startX = tileCoords.minBy("x")?.x;
  let endX = tileCoords.maxBy("x")?.x;
  let startY = tileCoords.minBy("y")?.y;
  let endY = tileCoords.maxBy("y")?.y;

  if (startX === undefined || endX === undefined || startY === undefined || endY === undefined)
    throw new Error(
      `fillTileArea: Invalid tile coordinates provided (${JSON.stringify(tileCoords)})`,
    );

  let areaCoords = [];
  for (let y = startY; y <= endY; ++y) {
    for (let x = startX; x <= endX; ++x) {
      areaCoords.push({ x: x, y: y });
    }
  }
  return areaCoords;
}

/**
   A class describing rectangles in absolute coordinate values
   (relative to the whole game world / location)
*/
export class Box {
  private left: number;
  private right: number;
  private top: number;
  private bottom: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }
  intersects(box: Box): boolean {
    return (
      this.left <= box.right &&
      box.left <= this.right &&
      this.top <= box.bottom &&
      box.top <= this.bottom
    );
  }
  getCorners(): Point[] {
    return [
      { x: this.left, y: this.top },
      { x: this.right, y: this.top },
      { x: this.left, y: this.bottom },
      { x: this.right, y: this.bottom },
    ];
  }
  /**
     Returns only corners in DIRECTIONS that may take part
     in collision
  */
  getImportantCorners(dx: number, dy: number): Point[] {
    let cornerMap = new Map<DirectionValue, Point>([
      [DIRECTIONS.upLeft, { x: this.left, y: this.top }],
      [DIRECTIONS.upRight, { x: this.right, y: this.top }],
      [DIRECTIONS.downLeft, { x: this.left, y: this.bottom }],
      [DIRECTIONS.downRight, { x: this.right, y: this.bottom }],
    ]);
    let corners = new Set<DirectionValue>();
    let moveDir = new Direction().fromChangeInXAndY(dx, dy);

    if (moveDir.facesUp()) corners.add(DIRECTIONS.upLeft).add(DIRECTIONS.upRight);
    if (moveDir.facesDown()) corners.add(DIRECTIONS.downLeft).add(DIRECTIONS.downRight);
    if (moveDir.facesRight()) corners.add(DIRECTIONS.upRight).add(DIRECTIONS.downRight);
    if (moveDir.facesLeft()) corners.add(DIRECTIONS.upLeft).add(DIRECTIONS.downLeft);

    return Array.from(corners)
      .map((c) => cornerMap.get(c))
      .filter((corner): corner is Point => corner !== undefined);
  }
}

export default class Hitbox {
  private entity: Entity;
  private id: number;
  private visualizationFunction: (drawFun: (cx: number, cy: number) => void) => void;
  private up: number;
  private left: number;
  private right: number;
  private down: number;
  private width: number;
  private height: number;

  constructor(
    entity: Hitbox["entity"],
    {
      up,
      left,
      right,
      down,
    }: { up: Hitbox["up"]; left: Hitbox["left"]; right: Hitbox["right"]; down: Hitbox["down"] },
  ) {
    this.entity = entity;
    this.id = generateID(Hitbox);
    this.visualizationFunction = () => {};
    this.up = up;
    this.left = left;
    this.right = right;
    this.down = down;
    this.width = this.left + 1 + this.right;
    this.height = this.up + 1 + this.down;
  }

  getBoundingBox(dx: number = 0, dy: number = 0): Box {
    let cp = this.entity.getCenterPoint();
    return new Box(
      cp.x + dx - this.left,
      cp.x + dx + this.right,
      cp.y + dy - this.up,
      cp.y + dy + this.down,
    );
  }

  getIntersectingTileCoordinates(dx: number = 0, dy: number = 0): Point[] {
    let tileCoordinates = new ObjectSet<Point>();
    this.getBoundingBox(dx, dy)
      .getCorners()
      .forEach((corner) => {
        tileCoordinates.add(pointToTileCoord(corner));
      });
    let coordArray = tileCoordinates.entries();

    if (this.width <= TILE_SIZE && this.height <= TILE_SIZE) return coordArray;

    // If this hitbox is larger than a tile, it is not enough to check
    // its corners. Every tile in between the tiles that intersect with
    // the hitbox's corners intersects with the hitbox's edges.

    //console.log('whole area: ', fillTileArea(coordArray).length);
    return fillTileArea(coordArray);
  }

  getPossiblyCollidingTileCoordinates(dx: number = 0, dy: number = 0): Point[] {
    let tileCoordinates = new ObjectSet<Point>();
    this.getBoundingBox(dx, dy)
      .getImportantCorners(dx, dy)
      .forEach((corner) => {
        tileCoordinates.add(pointToTileCoord(corner));
      });
    return tileCoordinates.entries();
  }

  willCollideWithTiles(dx: number, dy: number, arr: Tile[][]): boolean {
    let tiles = this.getPossiblyCollidingTileCoordinates(dx, dy).map((p) => {
      if (p.x < 0 || p.x > arr.lastIndex || p.y < 0 || p.y > arr[p.x].lastIndex) return null;
      return arr[p.x][p.y];
    });

    if (tiles.includes(null)) {
      // tested movement would cause exceeding the tile array
      return true;
    }
    for (const tile of tiles) {
      if (!tile) continue;
      for (const e of tile.entities) {
        if (e.hitbox.id === this.entity.hitbox.id) continue;
        this.visualizationFunction((cx, cy) => e.hitbox.draw(cx, cy, ctx, { color: "#ff000066" }));
        if (this.willCollide(dx, dy, e.hitbox)) return true;
      }
    }
    return false;
  }

  /**
     Tests distances from 1 to `maxDist` to tell how many
     pixels can the entity move before collision.

     If no collisions are found, `maxDist` is returned.
  */
  distanceTillTileCollision(direction: Direction, maxDist: number, arr: Tile[][]): number {
    if (maxDist < 1) throw new Error(`maxDist has to be at least 1. Got: ${maxDist}.`);

    let xm = direction.xAxisMultiplier();
    let ym = direction.yAxisMultiplier();

    for (let d = 1; d <= maxDist; ++d) {
      if (this.willCollideWithTiles(d * xm, d * ym, arr)) {
        return d - 1;
      }
    }
    return maxDist;
  }

  willCollide(dx: number, dy: number, other: Hitbox): boolean {
    if (other.entity.walkable) return false;
    if (this.getBoundingBox(dx, dy).intersects(other.getBoundingBox())) {
      //console.log(other);
      return true;
    }
    return false;
  }

  collides(other: Hitbox): boolean {
    if (other.entity.walkable) return false;
    this.visualizationFunction((cx, cy) => other.draw(cx, cy, ctx, { color: "transparent" }));
    return this.getBoundingBox().intersects(other.getBoundingBox());
  }

  visualizeCollisions(fun: (drawFun: (cx: number, cy: number) => void) => void): void {
    this.visualizationFunction = fun;
  }

  drawExpected(cameraX: number, cameraY: number, moveX: number, moveY: number, context = ctx) {
    this.draw(cameraX - moveX, cameraY - moveY, context, { color: "blue" });
  }

  draw(
    cameraX: number,
    cameraY: number,
    context: CanvasRenderingContext2D | null = ctx,
    options: { color?: string } = {},
  ) {
    if (!context) throw new Error("No context provided for drawing the hitbox.");
    context.fillStyle = options.color ?? "red";
    let centerPoint = this.entity.getCenterPoint();

    context.fillRect(
      centerPoint.x - this.left - cameraX,
      centerPoint.y - this.up - cameraY,
      this.width,
      this.height,
    );

    const corners = [
      [-this.left, 0],
      [this.right, 0],
      [0, -this.up],
      [0, this.down],
    ];

    context.fillStyle = "black";
    for (const corner of corners) {
      context.fillRect(
        centerPoint.x + corner.first - cameraX,
        centerPoint.y + corner.last - cameraY,
        1,
        1,
      );
    }
  }
}
