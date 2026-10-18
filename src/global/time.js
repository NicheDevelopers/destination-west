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

class Time {
  constructor() {
    this.speed = 1;
    this.now = Date.now();
  }
  update() {
    this.previous = this.now;
    this.now = Date.now();
    this.realTimeDelta = this.now - this.previous;
    this.delta = this.realTimeDelta * this.speed;
  }
  /**
     Get the simulated framerate (increasing time speed
     decreases framerate and vice versa)
  */
  getFps() {
    if (!this.delta) return 0;
    return 1000 / this.delta;
  }
  /*
    Get the actual framerate (how many times a second would the
    update() function be called if the delay between the calls
    was equal to the current `this.delta` value)
   */
  getRealFps() {
    if (!this.realTimeDelta) return 0;
    return 1000 / this.realTimeDelta;
  }
}

const time = new Time();
export default time;
