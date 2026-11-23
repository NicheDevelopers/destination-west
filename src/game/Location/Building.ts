import { ctx } from "@/engine/Browser";
import { TILE_SIZE } from "@/engine/consts";
import Entity, { type EntityOptions } from "@/engine/Entity";
import type { Point } from "@/lib/utilities";

export type BuildingType = "saloon" | "sheriff" | "house";

const DOORSTEP_DEBUG_COLOR = "#ff800066";

class Building extends Entity {
  readonly xTiles: number;
  readonly yTiles: number;
  readonly buildingType: BuildingType;

  constructor(
    pos: Point,
    xTiles: number,
    yTiles: number,
    buildingType: BuildingType,
    options: EntityOptions = {},
  ) {
    super(`bank-${xTiles}x${yTiles}`, pos, options);
    this.xTiles = xTiles;
    this.yTiles = yTiles;
    this.buildingType = buildingType;
  }

  getDoorstep(): Point {
    return {
      x: this.pos.x / TILE_SIZE + Math.floor((this.xTiles - 1) / 2),
      y: this.pos.y / TILE_SIZE + this.yTiles,
    };
  }

  override drawDebugInfo(cameraX: number, cameraY: number): void {
    const doorstep = this.getDoorstep();
    ctx.fillStyle = DOORSTEP_DEBUG_COLOR;
    ctx.fillRect(
      doorstep.x * TILE_SIZE - cameraX,
      doorstep.y * TILE_SIZE - cameraY,
      TILE_SIZE,
      TILE_SIZE,
    );
  }
}

export default Building;
