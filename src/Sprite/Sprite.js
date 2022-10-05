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
import ctx from "../global/ctx.js";

import imgInfo from "../static/imgInfo.js";

/**
 * Create sprites to make display of images simple
 */
class Sprite{
  /**
   * Create a sprite
     @param {string} typeName - Name of the sprite graphic to be used
     @param {Object} [options] - Additional options
  */
  constructor(typeName, options={}, isColored=false){
    if (!imgInfo.has(typeName))
      throw `Sprite: Type name is not defined: ${typeName}`;
    this.typeName = typeName;
    
    this.scale = options.scale ?? 1;
    this.scaleX = options.scaleX ?? this.scale;
    this.scaleY = options.scaleY ?? this.scale;

    this.imageInfo = imgInfo.get(typeName);
    
    this.height = this.imageInfo.height ?? 32;
    this.width = this.imageInfo.width ?? 32;
    this.spriteSheetRow = this.imageInfo.row ?? 0;
    this.spriteSheetCol = this.imageInfo.col ?? 0;

    if (isColored) return;
        
    this.img = new Image();

    if (this.imageInfo.src === undefined)
      throw `Sprite: No image path provided for sprite: ${typeName}`;
    
    this.img.src = this.imageInfo.src;
            
  }
  
  /**
  * Draw the sprite on the #game-canvas
  @param {number} x - Position x of the draw location
  @param {number} y - Position y of the draw location
  */
  draw(x, y, context){
    let c = context ?? ctx;
    c.drawImage(this.img,
		  this.spriteSheetCol * this.width,
		  this.spriteSheetRow * this.height,
		  this.width, this.height, x, y,
		  this.width * this.scaleX, this.height * this.scaleY);
  }
}

export default Sprite;
