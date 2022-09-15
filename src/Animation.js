/*
  file: src/time.js
  purpose: Define the time global object for managing time and frames
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

import time from "./global/time.js";

/**
 * Class for performing operations independent of the game loop speed
 */
class Animation{
  /**
   * Create an animation
   @param {Object} host - The object to animate
   @param {string} value - The name of the property to animate. Animation is reversed if starts with '-'
   @param {number} speed - Speed of the animation in changes per second
   @param {number} [quantum=1] - The smallest portion the value can change by in one change
  */
  constructor(host, value, speed, quantum=1){
    this.h = host;
    this.direction = true;
    this.v = value;
    if (value[0] === '-') {
      this.direction = false;
      this.v = value.substring(1);
    }
    this.speed = speed; //animation speed in changes per second
    this.quantum = quantum;
    this.x = 0;
  }
  next(){
    this.x += (this.speed*time.delta) / 1000;
    let animatingNow = (this.x/this.quantum) | 0;
    this.x -= animatingNow;
    this.h[this.v] += ((this.direction)? 1 : -1) * animatingNow;
  }
}
export default Animation;
