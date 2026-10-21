import Entity, { type EntityOptions } from "@/engine/Entity";
import type { Point } from "@/lib/utilities";

export type BuildingType = "saloon" | "sheriff" | "house";

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
}

export default Building;
