/*
  file: src/buildingPresets.js
  purpose: define building presets
  author: Szymon Nowak <https://gitlab.com/leszmak>
  
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

let newBuilding = (x1, y1, x2, y2) =>
  ({xStart: x1, yStart: y1, xTiles: x2, yTiles: y2});
let newStreet = (x1, y1, width, height) =>
  ({start: {x: x1, y: y1}, width: width, height: height});

const preset1 = {
  buildings: [
    newBuilding(27, 1, 5, 3),
    newBuilding(21, 7, 4, 3),
    newBuilding(22, 1, 3, 3),
    newBuilding(27, 7, 3, 3),
    newBuilding(32, 2, 3, 2),
    newBuilding(27, 12, 3, 3),
    newBuilding(20, 12, 5, 3),
    newBuilding(18, 2, 4, 2),
    newBuilding(16, 7, 4, 3),
    newBuilding(15, 2, 3, 2)
  ],
  streets: [
    newStreet(0, 4, 42, 2),
    newStreet(25, 0, 2, 20),
    newStreet(27, 10, 4, 1),
    newStreet(27, 15, 4, 1),
    newStreet(19, 15, 6, 1),
    newStreet(15, 10, 10, 1)
  ]
};

export default preset1;
