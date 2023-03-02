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

const townPropSheet = "img/town-props.png";
//When you want to change the name of the path sprite in imgInfo then you have to change the name in file /src/Location.js in pathInfo map as well
const pathPropSheet = "img/path.png";
/**
 * Map describing spritesheets that come with the game
 */
const imgInfo = new Map([
  ["street", img(townPropSheet, tileSize, tileSize, 0, 0)],
  ["sand", img(townPropSheet, tileSize, tileSize, 0, 1)],
  ["decoration-small-stones-1", img(townPropSheet, tileSize, tileSize, 0, 2)],
  ["decoration-cactus-1x", img(townPropSheet, tileSize, tileSize, 1, 0)],
  ["decoration-roadsign", img(townPropSheet, tileSize, tileSize, 1, 1)],
  ["decoration-stone-well", img(townPropSheet, tileSize, tileSize, 1, 2)],
  ["decoration-big-bag-3x", img(townPropSheet, tileSize, tileSize, 2, 0)],
  ["decoration-green-bush-1", img(townPropSheet, tileSize, tileSize, 2, 1)],
  //["decoration-small-dry-bush-left-1x", img(townPropSheet, tileSize, tileSize, 1, 0)],
  //["decoration-small-dry-bush-right-1x", img(townPropSheet, tileSize, tileSize, 1, 1)],
  //["decoration-big-dry-grass-1x", img(townPropSheet, tileSize, tileSize, 2, 0)],
  //["decoration-small-dry-grass-left-1x", img(townPropSheet, tileSize, tileSize, 2, 1)],
  //["decoration-small-dry-grass-right-1x", img(townPropSheet, tileSize, tileSize, 2, 2)],
  //["decoration-metal-crate-big-1x", img(townPropSheet, tileSize, tileSize, 3, 2)],
  
  ["path-narrow-side-1", img(pathPropSheet, tileSize, tileSize, 0, 0)],
  ["path-narrow-side-2", img(pathPropSheet, tileSize, tileSize, 0, 1)],
  ["path-narrow-side-3", img(pathPropSheet, tileSize, tileSize, 0, 2)],
  ["path-narrrow-corner-1", img(pathPropSheet, tileSize, tileSize, 0, 3)],
  ["path-narrrow-corner-2", img(pathPropSheet, tileSize, tileSize, 0, 4)],
  ["path-narrow-end-1", img(pathPropSheet, tileSize, tileSize, 0, 5)],
  ["path-narrow-end-2", img(pathPropSheet, tileSize, tileSize, 0, 6)],
  ["path-narrow-fork-1", img(pathPropSheet, tileSize, tileSize, 0, 7)],
  ["path-narrow-fork-2", img(pathPropSheet, tileSize, tileSize, 0, 8)],
  ["path-narrow-crossroad-1", img(pathPropSheet, tileSize, tileSize, 0, 9)],
  ["path-narrow-crossroad-2", img(pathPropSheet, tileSize, tileSize, 0, 10)],
  ["path-wide-full-1", img(pathPropSheet, tileSize, tileSize, 0, 11)],
  ["path-wide-full-2", img(pathPropSheet, tileSize, tileSize, 0, 11)],
  ["path-wide-inner-corner-1", img(pathPropSheet, tileSize, tileSize, 0, 12)],
  ["path-wide-inner-corner-2", img(pathPropSheet, tileSize, tileSize, 0, 13)],
  ["path-wide-side-1", img(pathPropSheet, tileSize, tileSize, 0, 14)],
  ["path-wide-side-2", img(pathPropSheet, tileSize, tileSize, 0, 15)],
  ["path-wide-corner-1", img(pathPropSheet, tileSize, tileSize, 0, 16)],
  ["path-wide-corner-2", img(pathPropSheet, tileSize, tileSize, 0, 17)],
  
  ["jacket", img("img/clothes.png", tileSize, tileSize, 0, 0)],
  ["pants", img("img/clothes.png", tileSize, tileSize, 0, 1)],
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
  }]

]);

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
