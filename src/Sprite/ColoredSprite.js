/*
  file: src/ColoredSprite.js
  purpose: define a class for displaying colored sprites
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
import { ctx } from "../core/Browser.js";
import Sprite from "./Sprite.js";
import { createCanvas,
	 hexToRgb,
	 PixelImage } from "../global/utilities.js";

/**
 * Create sprites to display grayscale-source sprites in color
 */
class ColoredSprite extends Sprite {
  constructor(spriteName, updateCallback, options) {
    super(spriteName, options);
    this.color = '#000000';
    ({ canvas: this.canvas, context: this.offCtx } = createCanvas(this.width, this.height));

    this.offCtx.drawImage(
      this.img, this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width, this.height, 0, 0,
      this.width * this.scaleX, this.height * this.scaleY);

    this.image = new PixelImage().fromContext(this.offCtx);

    /*
      Brightness and alpha of pixels needs to be stores as the colors
      may be modified. Only their initial state is relevant.
     */
    this.brightness = new Uint8ClampedArray(this.image.pixelCount());
    this.alpha = new Uint8ClampedArray(this.image.pixelCount());
    
    for (let x = 0; x < this.image.pixelCount(); ++x) {
      this.brightness[x] = 255 - this.image.getDataAt(x*4);
      this.alpha[x] = this.image.getDataAt(x*4 + 3);
    }
    this.img = new Image();
    this.img.onload = updateCallback;
    this.setColor('#00FF00');
  }
  setColor(colorHex, areaID = 0) {
    let rgb = hexToRgb(colorHex);

    for (let x = 0; x < this.image.pixelCount(); ++x) {
      if (this.image.pixel(x).a === 0) continue;
      
      let br = this.brightness[x];
      
      this.image.pixel(x).setColor({
	r: rgb.r - br,
	g: rgb.g - br,
	b: rgb.b - br,
	a: this.alpha[x]
      });
    }
    this.offCtx.clearRect(0, 0, this.width, this.height);
    
    this.image.drawToContext(this.offCtx);
    this.img.src = this.canvas.toDataURL('image/png');
  }
  draw(x, y, context = ctx) {
    context.drawImage(this.img, x, y);
  }
}

export default ColoredSprite;
