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
import Tile from "../game/Tile.js";
import { roll } from "../global/utilities.js";
import { tileSize } from "../global/consts.js";
import Entity from "../Entity/Entity.js";

class Building extends Entity {
  constructor(x, y, xTiles, yTiles, buildingType, options = {}) {
    super(`bank-${xTiles}x${yTiles}`, x, y, options);
    this.xTiles = xTiles;
    this.yTiles = yTiles;
    this.buildingType = buildingType;
  }
}

export default Building;
