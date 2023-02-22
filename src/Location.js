/*
  file: src/Location.js
  purpose: Define virtual Location class to use the same methods in class
          Town and Travel.  
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
import ctx from "./global/ctx.js";
import { randIntInRange } from "./global/utilities.js";
import { createCanvas } from "./global/utilities.js";
import tileSize from "./global/tileSize.js";

class Location{
    constructor(width, height){
        this.array = undefined;
        this.created = false;
        this.width = width;
        this.height = height;
        this.widthPx = this.width * tileSize;
        this.heightPx = this.height * tileSize;
    }

    prerender(){
        let { canvas, context: offCtx } =
          createCanvas(this.widthPx, this.heightPx);
        offCtx.clearRect(0, 0, this.widthPx, this.heightPx);
        this.drawRaw(0, 0, offCtx);
        this.image = new Image(this.widthPx, this.heightPx);
        this.image.src = canvas.toDataURL('image/png');
    }

    // check if there's a builing in the 5x5 square surrounding a tile
    nearToBuilding(xPos, yPos) {
        for (let i = -2; i <= 2; i++)
        for (let j = -2; j <= 2; j++) {
            if (xPos + i < 0 || xPos + i >= this.array.length) continue;
            if (yPos + j < 0 || yPos + j >= this.array[0].length) continue;
            if (this.array[xPos + i][yPos + j].typeName.substring(0, 9) == 'building-') return true;
        }
    return false;
  }

  /**
   * Place generic decorations according to tiles' proximity to buildings.
   * Generic decorations are objects like cacti, stones, bushes. We don't care about their placement that much.
   * Special decorations are more unique objects such as roadsigns, wells, things that shouldn't appear as often.
   * Tiles within a 5x5 square of a building are considered to be close to it.
   */
  placeGenericDecoration() {
    let rural_percent = 20;
    let rural_generic_decorations = [
      ["cactus-1x"],
      ["small-stones-1"],
      ["green-bush-1"]
    ];

    let town_percent = 5;
    let town_generic_decorations = [
      //["roadsign", 1],
      //["stone-well", 1],
      ["big-bag-3x"],
    ];

    let array = [];

    for (let i = 0; i < this.array.length; i++)
      for (let j = 0; j < this.array[0].length; j++) {
        if (this.array[i][j].typeName !== 'sand') continue;

        let rand = randIntInRange(0, 100);
        if (this.nearToBuilding(i, j) && rand < town_percent) {
          array = town_generic_decorations;
          let idx = randIntInRange(0, array.length);
          this.array[i][j] = new Tile("decoration-" + array[idx], i * tileSize, j * tileSize);
        }
        else if (!this.nearToBuilding(i, j) && rand < rural_percent) {
          array = rural_generic_decorations;
          let idx = randIntInRange(0, array.length);
          this.array[i][j] = new Tile("decoration-" + array[idx], i * tileSize, j * tileSize);
        }
      }
  }

  getNumOfTiles() {
    return this.array.length * this.array[0].length;
  }

  placeBackground(background) {
    let length = this.array.length;
    let height = this.array[0].length;
    for (let i = 0; i < length; i++) 
      for (let j = 0; j < height; j++) {
        if (this.array[i][j] === undefined)
          this.array[i][j] = new Tile(background, i * tileSize, j * tileSize);
      }
  }

  placeBuilding(xStart, yStart, building) {
    for (let i = 0; i < building.xTiles; i++) 
      for (let j = 0; j < building.yTiles; j++) {
        this.array[xStart + i][yStart + j] = building.array[i][j];
        this.array[xStart + i][yStart + j].x = xStart * tileSize + building.array[i][j].x;
        this.array[xStart + i][yStart + j].y = yStart * tileSize + building.array[i][j].y;
      }
  }

  placeStreets(preset) {
    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i) 
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          this.array[i][j] = new Tile('street', i * tileSize, j * tileSize);
        }
    });
  }

  draw(x = 0, y = 0, context = ctx, width = 672, height = 288) {
    if (!this.created)
      throw "Town: Attempt to draw before creating the town";
    context.drawImage(this.image, x, y, width, height,
      0, 0, width, height);
  }
  drawRaw(x0 = 0, y0 = 0, context = ctx) {
    for (let x = 0; x < this.array.length; ++x)
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.draw(x0 + tile.x, y0 + tile.y, context);
      }
  }
  drawDebugInfo() {
    for (let x = 0; x < this.array.length; ++x) 
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.drawDebugInfo();
      }
  }
}

export default Location;