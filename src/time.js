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

/**
 * Class for managing time and frames
 */
class Time{
  constructor(){
    this.now = Date.now();
  }
  update(){
    this.then = this.now;
    this.now = Date.now();
    this.delta = this.now - this.then;
  }
  getFPS(){
    if (!this.delta) return 0;
    return (1000/this.delta) | 0;
  }
}

/**
 * A global object for managing time and frames
 */
const time = new Time();
export default time;
