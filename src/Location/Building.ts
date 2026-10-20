/*
  file: src/Building.js
  purpose: Define the Building class for creating buildings is simple way  
  authors: Szymon Nowak <https://gitlab.com/leszmak>
          Artur Gulik <https://gitlab.com/ArturGulik>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/
import Entity, { type EntityOptions } from "../Entity/Entity.js";
import type Game from "../game/Game.js";
import type { Point } from "../utilities/utilities.js";

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
