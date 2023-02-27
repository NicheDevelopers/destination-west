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
import tileSize from "../global/tileSize.js";
import { createCanvas } from "../global/utilities.js";
import imgInfo from "../static/imgInfo.js";


/**
 * Create sprites to make display of images simple
 */
class Sprite {
  /**
   * Create a sprite
     @param {string} typeName - Name of the sprite graphic to be used
     @param {Object} [options] - Additional options
  */
  constructor(typeName, options = {}, isColored = false) {
    if (!imgInfo.has(typeName)) {
      	throw `Sprite: Type name is not recognized: ${typeName}`;
    }
    this.typeName = typeName;

    this.scale = options.scale ?? 1;
    this.scaleX = options.scaleX ?? this.scale;
    this.scaleY = options.scaleY ?? this.scale;

    this.imageInfo = imgInfo.get(typeName);

    this.height = this.imageInfo.height ?? tileSize;
    this.width = this.imageInfo.width ?? tileSize;
    this.spriteSheetRow = this.imageInfo.row ?? 0;
    this.spriteSheetCol = this.imageInfo.col ?? 0;

    this.callback = options.callback ?? (() => {});

    this.rotation = options.rotation;
    
    if (isColored) return;

    if (this.imageInfo.src === undefined)
      throw `Sprite: No image path provided for sprite: ${typeName}`;

    if (!this.rotation) {
      this.img = new Image();
      this.img.onload = this.callback;
      this.img.src = this.imageInfo.src;
      return;
    }

    this.imageToRotate = new Image();
    this.imageToRotate.onload =
      () => this.rotate(this.rotation * Math.PI / 180);
    this.imageToRotate.src = this.imageInfo.src;
  }

  rotate(angle, callback){
    const { canvas: canvas, context: offCtx } = createCanvas(this.width, this.height);
    offCtx.translate(this.width/2, this.height/2);
    offCtx.rotate(angle);
    offCtx.translate(-this.width/2, -this.height/2);
        
    offCtx.drawImage(this.imageToRotate,
		     this.spriteSheetCol * this.width,
		     this.spriteSheetRow * this.height,
		     this.width, this.height, 0, 0,
		     this.width * this.scaleX, this.height * this.scaleY);

    this.spriteSheetCol = 0;
    this.spriteSheetRow = 0;
    this.img = new Image();
    this.img.onload = this.callback;
    this.img.src = canvas.toDataURL('image/png');
  }
  /**
  * Draw the sprite on the #game-canvas
  @param {number} x - Position x of the draw location
  @param {number} y - Position y of the draw location
  */
  draw(x, y, context = ctx) {
    context.drawImage(this.img,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width, this.height, x, y,
      this.width * this.scaleX, this.height * this.scaleY);
  }
}

export default Sprite;
