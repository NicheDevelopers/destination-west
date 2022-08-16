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
const imgInfo = new Map([
  ['sand', {
    src : "img/sand.png",
    height: 32,
    width: 32, 
    sx: 0,    // x-offset in image grid
    sy: 0,    // y-offset in image grid
    
  }]
]);

/**
 * Class for creating tiles - the base of the game world structure
 */
export default class Tile{
  constructor(ctx, typeName, x=0, y=0){
    this.typeName = typeName;
    this.ctx = ctx;
    this.img = new Image();
    // Properties hardcoded so far for testing
    ({src: this.src, height: this.height,
      width: this.width, sx: this.sx, sy: this.sy} = imgInfo.get(typeName));
    this.img.src = this.src;
    this.x = x;
    this.y = y;
  }
  draw(){
    this.ctx.drawImage(this.img, this.sx, this.sy, this.width, this.height,
		       this.x, this.y, this.width, this.height);
  }
}
