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
    height: 32,
    width: 32,
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

export default imgInfo;
