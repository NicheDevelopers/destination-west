/*
  file: src/global/Direction.js
  purpose: Define the directions object and the Directions
           class to simplify working with directions
  
  authors: Michał Miłek <https://gitlab.com/mmilek>
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

/* Directions are represented by numbers,
   according to the following diagram:
   
         N
      0  1  2
   W  3  4  5  E
      6  7  8
         S
      
*/

import { directions } from "../global/consts.js";

class Direction {
  constructor(value=directions.none) {
    this._value = value;
  }
  facesRight() { return this._value % 3 === 2 }
  facesUp() { return this._value < 3 }
  facesDown() { return this._value > 5 }
  facesLeft() { return this._value % 3 === 0 }
  isDiagonal() { return this._value % 2 === 0 && this._value !== 4 }
  setTo(dir) { this._value = dir; }
  fromChangeInXAndY(dx, dy) {
    this._value = directions.none;
    if (dx > 0) this.moveRight();
    else if (dx < 0) this.moveLeft();

    if (dy > 0) this.moveDown();
    else if (dy < 0) this.moveUp();
    return this;
  }
  moveUp() {
    if (this.facesUp()) throw "Direction: Invalid move up";
    this._value -= 3;
  }
  moveRight() {
    if (this.facesRight()) throw "Direction: Invalid move right";
    this._value += 1
  }
  moveDown() {
    if (this.facesDown()) throw "Direction: Invalid move down";
    this._value += 3
  }
  moveLeft() {
    if (this.facesLeft()) throw "Direction: Invalid move left";
    this._value -= 1;
  }
  /**
   * Set the direction's internal value to directions.none
  */
  reset() {
    this._value = directions.none;
  }
  toString() {
    return Object.entries(directions).filter(([_, v]) => v == this._value)[0][0];
  }
  is(dir) {return this._value === dir}
  xAxisMultiplier() {
    return this.facesRight()-this.facesLeft();
  }
  yAxisMultiplier() {
    return this.facesDown()-this.facesUp();
  }
}

export default Direction;
