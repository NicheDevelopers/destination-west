/*
  file: src/static/imgInfo.js
  purpose: describe spirtesheets that come with the game
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Michał Miłek <https://gitlab.com/mmilek>
  
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
import tileSize from "../global/tileSize.js";

let img = (src, height = tileSize, width = tileSize, row = 0, col = 0) =>
  ({ src: src, height: height, width: width, row: row, col: col });

/**
 * Map describing spritesheets that come with the game
 */

class Spritesheet {
  constructor(path, width, height, elements, options = {}) {
    if (width*height < elements.length)
      throw "Error: Spritesheet element count is greater " +
      `than the specified spritesheet size (${path})\n` +
      `Size: ${width*height} (${width}*${height})\n` +
      `Numer of elements: ${elements.length}`;
    this.path = path;
    this.width = width;
    this.height = height;
    this.spriteWidth = options.spriteWidth ?? tileSize;
    this.spriteHeight = options.spriteHeight ?? tileSize;
    this.elements = elements;
    this.options = options;
  }
  saveToMap(map) {
    let x=-1, y=0;
    for (const e of this.elements) {
      ++x;
      if (x === this.width) {
	x = 0;
	++y;
      }
      map.set(e, {
	src: this.path,
	width: this.spriteWidth,
	height: this.spriteHeight,
	row: y,
	col: x,
	defaultAnimation: this.options.defaultAnimation,
	animations: this.options.animations,
	random: this.options.random
      });
    }
  }
}

const imgInfo = new Map([
  ["path-wide-full-2", img("img/path.png", tileSize, tileSize, 0, 11)], //fix this @leszmak
  ["jacket", img("img/clothes.png", tileSize, tileSize, 0, 0)],
  ["pants", img("img/clothes.png", tileSize, tileSize, 0, 1)],
  ["player", {
    src: "img/player.png",
    spriteHeight: 37,
    spriteWidth: 50,
    defaultAnimation: "idle",
    animations: new Map([
      ["idle", {
        name: "idle",
        row: 0,
        frames: 3,
        mirroredRow: 1
      }],
      ["run", {
        name: "run",
        row: 2,
        frames: 6,
        mirroredRow: 3
      }]
    ])
  }]

]);

const townPropList = [
  "street", "sand", "decoration-small-stones-1", "decoration-cactus-1x",
  "decoration-roadsign", "decoration-stone-well", "decoration-big-bag-3x",
  "decoration-green-bush-1"
];
const townPropSheet = new Spritesheet("img/town-props.png", 3, 3, townPropList);

const pathTypeList = [
  "path-narrow-side-1", "path-narrow-side-2", "path-narrow-side-3", "path-narrrow-corner-1",
  "path-narrrow-corner-2", "path-narrow-end-1", "path-narrow-end-2", "path-narrow-fork-1",
  "path-narrow-fork-2", "path-narrow-crossroad-1", "path-narrow-crossroad-2", "path-wide-full-1",
  "path-wide-inner-corner-1", "path-wide-inner-corner-2", "path-wide-side-1",
  "path-wide-side-2", "path-wide-corner-1", "path-wide-corner-2"
];
const pathSheet = new Spritesheet("img/path.png", 18, 1, pathTypeList);

townPropSheet.saveToMap(imgInfo);
pathSheet.saveToMap(imgInfo);

let newBuildingPart = (name, col, row) => ({ name: name, row: row, col: col });
let buildingParts = [
  newBuildingPart('leftwallwindow', 0, 2),
  newBuildingPart('leftwall', 1, 2),
  newBuildingPart('door', 2, 2),
  newBuildingPart('window', 3, 2),
  newBuildingPart('wall', 4, 2),
  newBuildingPart('rightwall', 5, 2),
  newBuildingPart('rightwallwindow', 6, 2),

  newBuildingPart('upleftwallwindow', 0, 1),
  newBuildingPart('upleftwall', 1, 1),
  newBuildingPart('updoor', 2, 1),
  newBuildingPart('upwindow', 3, 1),
  newBuildingPart('upwall', 4, 1),
  newBuildingPart('uprightwall', 5, 1),
  newBuildingPart('uprightwallwindow', 6, 1),

  newBuildingPart('leftroof', 1, 0),
  newBuildingPart('roof', 2, 0),
  newBuildingPart('sign', 3, 0),
  newBuildingPart('rightroof', 4, 0),

  newBuildingPart('leftpedestal', 1, 3),
  newBuildingPart('doorpedestal', 2, 3),
  newBuildingPart('pedestal', 3, 3),
  newBuildingPart('rightpedestal', 4, 3)
];
let buildings = ['sheriff', 'house', 'saloon'];

buildings.forEach((building) => {
  buildingParts.forEach((buildingPart) => {
    imgInfo.set('building-' + building + '-' + buildingPart.name,
      {
        src: "img/bank.png",
        height: 32, width: 32,
        row: buildingPart.row,
        col: buildingPart.col
      }
    );
  });
});

export default imgInfo;
