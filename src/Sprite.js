/*
  file: src/Sprite.js
  purpose: define the Sprite class for displaying sprites
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
import ctx from "./ctx.js";

const imgInfo = new Map([
  ["sand", {
    src : "img/sand.png",
    height: 32,
    width: 32, 
    sx: 0,    // x-offset in image grid
    sy: 0,    // y-offset in image grid
    
  }]
]);
/**
 * Class for creating sprites - objects that make displaying and animating easy
 */
export default class Sprite{
  constructor(typeName){
    ({src: this.src, height: this.height,
      width: this.width, sx: this.sx, sy: this.sy} = imgInfo.get(typeName));
    this.img = new Image();
    this.img.src = this.src;
  }
  draw(x, y){
    ctx.drawImage(this.img, this.sx, this.sy, this.width, this.height,
		       x, y, this.width, this.height);
  }
}
