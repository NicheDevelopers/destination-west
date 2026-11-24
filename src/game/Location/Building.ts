import { ctx } from "@/engine/Browser";
import { TILE_SIZE } from "@/engine/consts";
import Entity, { type EntityOptions } from "@/engine/Entity";
import type { Point } from "@/lib/utilities";

export type BuildingType = "saloon" | "sheriff" | "bank" | "house";

const DOORSTEP_DEBUG_COLOR = "#ff800066";
const LABEL_FONT = "12px Verdana";
const LABEL_PADDING = 3;
const LABEL_HEIGHT = 16;
const LABEL_BACKGROUND_COLOR = "#000000aa";
const LABEL_TEXT_COLOR = "#ffffff";

export function buildingImageName(type: BuildingType, xTiles: number, yTiles: number): string {
  return `${type}-${xTiles}x${yTiles}`;
}

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
    super(buildingImageName(buildingType, xTiles, yTiles), pos, options);
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
    this.drawNameLabel(this.pos.x - cameraX, this.pos.y - cameraY);
  }

  private drawNameLabel(x: number, y: number): void {
    ctx.save();
    ctx.font = LABEL_FONT;
    ctx.textBaseline = "middle";
    const textWidth = ctx.measureText(this.typeName).width;
    ctx.fillStyle = LABEL_BACKGROUND_COLOR;
    ctx.fillRect(x, y, textWidth + LABEL_PADDING * 2, LABEL_HEIGHT);
    ctx.fillStyle = LABEL_TEXT_COLOR;
    ctx.fillText(this.typeName, x + LABEL_PADDING, y + LABEL_HEIGHT / 2);
    ctx.restore();
  }
}

export default Building;
