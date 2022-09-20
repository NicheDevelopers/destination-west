/*
  file: src/Sprite.js
  purpose: describe spirtesheets that come with the game
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
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

/**
 * Map describing spritesheets that come with the game
 */
const imgInfo = new Map([
  ["sand", {
    src : "img/sand.png",
    height: 16,
    width: 16,
    row: 0,
    col: 0   
  }],
  ["street", {
    src : "img/street.png",
    height: 16,
    width: 16,
    row: 0,
    col: 0   
  }],
  ["player", {
    src: "img/player.png",
    height: 37,
    width: 50,
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
  }],
  ["saloon_0", {
    src: "img/saloon.png",
    height: 96,
    width: 96,
    row: 0,
    col: 0,
    physicalWidth: 3,
    physicalHeight: 2,
    tileWidth: 3,
    tileHeight: 3
  }]
]);

let newBuildingPart = (name, row, col) => ({name: name, row: row, col:col});
let buildingParts = [
  newBuildingPart('leftwall', 1, 0),
  newBuildingPart('wall', 1, 1),
  newBuildingPart('door', 1, 2),
  newBuildingPart('window', 1, 3),
  newBuildingPart('rightwall', 1, 4),
  newBuildingPart('leftroof', 0, 0),
  newBuildingPart('lefthigherroof', 0, 1),
  newBuildingPart('righthigherroof', 0, 2),
  newBuildingPart('roof', 0, 3),
  newBuildingPart('rightroof', 0, 4)
];
let buildings = ['sheriff', 'house', 'saloon'];

buildings.forEach((building) => {
  buildingParts.forEach((buildingPart) => {
    imgInfo.set('building-' + building + '-' + buildingPart.name,
    {
      src: "img/saloon.png",
      height: 16, width: 16,
      row: buildingPart.row,
      col: buildingPart.col
    }
	       );
  });
});

export default imgInfo;
