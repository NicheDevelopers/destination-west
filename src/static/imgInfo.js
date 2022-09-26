/*
  file: src/static/imgInfo.js
  purpose: describe spirtesheets that come with the game
  author: Artur Gulik <https://gitlab.com/ArturGulik>
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

let propData = (src, height, width, row, col) =>
  ({src: src, height: height, width: width, row: row, col: col});

const  townPropSheet = "img/town_props.png";

/**
 * Map describing spritesheets that come with the game
 */
const imgInfo = new Map([
  ["sand", propData("img/sand.png", 16, 16, 0, 0)],
  ["street", propData("img/street.png", 16, 16, 0, 0)],
  ["cactus-3x", propData(townPropSheet, 16, 16, 0, 0)],
  ["small-stone-3x", propData(townPropSheet, 16, 16, 0, 1)],
  ["big-stone-1x", propData(townPropSheet, 16, 16, 0, 2)],
  ["small-dry-bush-left-1x", propData(townPropSheet, 16, 16, 1, 0)],
  ["small-dry-bush-right-1x", propData(townPropSheet, 16, 16, 1, 1)],
  ["roadsign", propData(townPropSheet, 16, 16, 1, 2)],
  ["big-dry-grass-1x", propData(townPropSheet, 16, 16, 2, 0)],
  ["small-dry-grass-left-1x", propData(townPropSheet, 16, 16, 2, 1)],
  ["small-dry-grass-right-1x", propData(townPropSheet, 16, 16, 2, 2)],
  ["wooden-crate-small-3x", propData(townPropSheet, 16, 16, 3, 0)],
  ["brick-well", propData(townPropSheet, 16, 16, 3, 1)],
  ["metal-crate-big-1x", propData(townPropSheet, 16, 16, 3, 2)],
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
  newBuildingPart('smallwindow', 1, 1),
  newBuildingPart('door', 1, 2),
  newBuildingPart('window', 1, 3),
  newBuildingPart('wall', 1, 4),
  newBuildingPart('barrels', 1, 5),
  newBuildingPart('rightwall', 1, 6),

  newBuildingPart('leftroof', 0, 0),
  newBuildingPart('lefthighroof', 0, 1),
  newBuildingPart('highroof', 0, 2),
  newBuildingPart('righthighroof', 0, 3),
  newBuildingPart('roof', 0, 4),
  newBuildingPart('roofdecoration', 0, 5),
  newBuildingPart('rightroof', 0, 6)
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
