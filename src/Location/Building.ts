import Entity, { type EntityOptions } from "@/Entity/Entity.js";
import type Game from "@/game/Game.js";
import type { Point } from "@/utilities/utilities.js";

export type BuildingType = "saloon" | "sheriff" | "house";

class Building extends Entity {
  readonly xTiles: number;
  readonly yTiles: number;
  readonly buildingType: BuildingType;

  constructor(
    game: Game,
    pos: Point,
    xTiles: number,
    yTiles: number,
    buildingType: BuildingType,
    options: EntityOptions = {},
  ) {
    super(game, `bank-${xTiles}x${yTiles}`, pos, options);
    this.xTiles = xTiles;
    this.yTiles = yTiles;
    this.buildingType = buildingType;
  }
}

export default Building;
