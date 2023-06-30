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
const variants = 2;

/* pathInfo keys describe the presence of paths on adjacent squares.
   The first digit describes the top-left adjacent tile. If that tile
   is a path then we represet is as a 1, otherwise as 0.
   The next digit describes the tile over the top edge and so on.
   After checking a whole row we move to the next one.
   The last numeral is the number that represent one of the 'variants' of the sprite that we have prepered.
*/

const pathInfo = new Map([
  ["street", "street"],
  ["001000100", "path-narrow-side-1"],
  ["001000101", "path-narrow-side-2"],
  ["001000110", "path-narrow-side-1"],
  ["001000111", "path-narrow-side-2"],
  ["011000100", "path-narrow-side-1"],
  ["011000101", "path-narrow-side-2"],
  ["011100100", "path-narrow-side-1"],
  ["011100101", "path-narrow-side-2"],
  ["000010100", "path-narrrow-corner-1"],
  ["000010101", "path-narrrow-corner-2"],
  ["000000100", "path-narrow-end-1"],
  ["000000101", "path-narrow-end-2"],
  ["100010100", "path-narrow-fork-1"],
  ["100010101", "path-narrow-fork-2"],
  ["101010100", "path-narrow-crossroad-1"],
  ["101010101", "path-narrow-crossroad-2"],
  ["111111110", "path-wide-full-1"],
  ["111111111", "path-wide-full-2"],
  ["111111100", "path-wide-inner-corner-1"],
  ["111111101", "path-wide-inner-corner-2"],
  ["001111100", "path-wide-side-1"],
  ["001111101", "path-wide-side-2"],
  ["011111100", "path-wide-side-1"],
  ["011111101", "path-wide-side-2"],
  ["001111110", "path-wide-side-1"],
  ["001111111", "path-wide-side-2"],
  ["000011100", "path-wide-corner-1"],
  ["000011101", "path-wide-corner-2"],
  //path-wide-fork
  //["111110100","path-wide-corner-1"],
  //["111110100","path-wide-corner-2"],
  //path-wider-fork-left
  //["111000100","path-wide-corner-1"],
  //["111000101","path-wide-corner-2"],
  //path-wider-fork-right
  //["101000110","path-wide-corner-1"],
  //["101000111","path-wide-corner-2"],
]);

class Location {
  constructor(width, height) {
    this.array = undefined;
    this.created = false;
    this.width = width;
    this.height = height;
    this.widthPx = this.width * tileSize;
    this.heightPx = this.height * tileSize;
    this.awaitAssets = 0;
    this.droppedItems = new Array();
    this.npcs = new Array();
  }

  prerender() {
    //console.log(this.awaitAssets);
    if (this.awaitAssets > 0) {
      setTimeout(() => this.prerender(), 0);
      return;
    }
    let { canvas, context: offCtx } =
      createCanvas(this.widthPx, this.heightPx);
    offCtx.clearRect(0, 0, this.widthPx, this.heightPx);

    this.drawRaw(0, 0, offCtx);
    this.image = new Image(this.widthPx, this.heightPx);
    this.image.onload = () => { this.created = true; };
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

  chooseStreet(pomArray, x, y) {
    let string = '';

    console.assert(pomArray != undefined, "pomArray is undefined");
    const surrounding = [[0, -1], [1, -1],
    [1, 0], [1, 1], [0, 1],
    [-1, 1], [-1, 0], [-1, -1]];
    surrounding.forEach(place => {
      try {
        pomArray[x + place[0]][y + place[1]] === 1 ? string += '1' : string += '0';
      }
      catch (e) {
        if (e instanceof TypeError) string += '1'; else throw e;
      }
    });

    for (const element of [0, 90, 180, 270]) {
      if (pathInfo.has(string + randIntInRange(0, variants)))
        return [pathInfo.get(string + randIntInRange(0, variants)), element];
      string = string.substring(2, 8) + string.substring(0, 2)
    }

    return [pathInfo.get('street'), 0];

  }

  placeStreets(preset) {

    let pomArray = new Array(this.width);
    for (let x = 0; x < this.width; ++x) pomArray[x] = new Array(this.height);

    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i)
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          pomArray[i][j] = 1;
        }
    });
    //console.log(pomArray);
    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i) {
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          this.awaitAssets++;
          let nameAndDegree = this.chooseStreet(pomArray, i, j);
          if (pomArray[i][j] == 1) this.array[i][j] = new Tile(nameAndDegree[0], i * tileSize, j * tileSize,
            {
              rotation: nameAndDegree[1],
              callback: () => {
                this.awaitAssets--;
              }
            });
        }
      }
    });
  }

  draw(x = 0, y = 0, context = ctx, width = 672, height = 288) {
    if (!this.created)
      return;
    //throw "Town: Attempt to draw before creating the town";
    context.drawImage(this.image, x, y, width, height,
      0, 0, width, height);
    for (let droppedItem of this.droppedItems) {
      droppedItem.draw(x, y);
    }
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
