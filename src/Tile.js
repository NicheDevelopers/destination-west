/*
  file: src/Tile.js
  purpose: define the Tile class, the base of the game world structure
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
 * Class for creating tiles - the base of the game world structure
 */
export default class Tile{
  constructor(ctx, typeName){
    this.typeName = typeName;
    this.ctx = ctx;
    this.img = new Image();
    // Properties hardcoded so far for testing
    this.img.src = "img/sand.png";
    this.x = 10;
    this.y = 10;
  }
  draw(){
    this.ctx.drawImage(this.img, this.x, this.y);
  }
}
