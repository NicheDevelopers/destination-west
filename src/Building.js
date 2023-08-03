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
import Tile from "./Tile.js";
import { roll } from "./global/utilities.js";
import { tileSize } from "./global/consts.js";

class Building {
    constructor(xTiles, yTiles, buildingType) {
      this.xTiles = xTiles;
      this.yTiles = yTiles;
      this.buildingType = buildingType;
      this.array = new Array(this.xTiles);
      for (let x = 0; x < this.xTiles; ++x) this.array[x] = new Array(this.yTiles);
      this.create();
    }
    createTile(name, x, y) {
      this.array[x][y] = new Tile('building-' + this.buildingType +
        "-" + name, x * tileSize, y * tileSize);
      this.array[x][y].walkable = false;
    }
    create() {
      let min = {
        x: 0,
        y: 0
      };
      let max = {
        x: this.xTiles - 1,
        y: this.yTiles - 1
      };
      let pedestal = false;
      this.createTile('leftwall', min.x, max.y);
      this.createTile('rightwall', max.x, max.y);
      this.createTile('door', max.x / 2 | 0, max.y);
      for (let x = 1; x < max.x; x++) {
        if (this.array[x][max.y] !== undefined) continue;

        if (roll(0.16)) {
          this.createTile('window', x, max.y);
          continue;
        }
        this.createTile('wall', x, max.y);
      }
      if (pedestal) {
        max.y++;
        this.createTile('leftpedestal', min.x, max.y);
        this.createTile('rightpedestal', max.x, max.y);
        this.createTile('doorpedestal', max.x / 2 | 0, max.y);
        for (let x = 1; x < max.x; x++) {
          if (this.array[x][max.y] !== undefined) continue;
          this.createTile('pedestal', x, max.y);
        }
      }
      for (let y = 1; y < max.y; y++) {
        this.createTile('upleftwall', min.x, y);
        this.createTile('uprightwall', max.x, y);
        for (let x = 1; x < max.x; x++) {
          if (this.array[x][y] !== undefined) continue;

          if (roll(0.33)) {
            this.createTile('upwindow', x, y);
            continue;
          }
          this.createTile('upwall', x, y);
        }
      }
  
      this.createTile('leftroof', min.x, min.y);
      this.createTile('rightroof', max.x, min.y);
      if (max.x === 2) {
        this.createTile('sign', 1, min.y);
        return;
      }
      this.createTile('roof', min.x + 1, min.y);
      this.createTile('roof', max.x - 1, min.y);
      if (max.x === 3) return;
      if (max.x === 4) {
        this.createTile('sign', 2, min.y);
        return;
      }
      this.createTile('roof', min.x + 2, min.y);
      this.createTile('roof', max.x - 2, min.y);
    }
}

export default Building;
