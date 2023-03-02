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
import ctx from "../global/ctx.js";
import Sprite from "./Sprite.js";
import { createCanvas } from "../global/utilities.js";

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

    this.image = this.offCtx.getImageData(0, 0, this.width, this.height);

    let pixelCount = this.image.data.length / 4;
    this.brightness = new Uint8ClampedArray(pixelCount);
    this.alpha = new Uint8ClampedArray(pixelCount);
    for (let x = 0; x < pixelCount; ++x) {
      this.brightness[x] = 255 - this.image.data[x * 4];
      this.alpha[x] = this.image.data[x * 4 + 3];
    }
    this.img = new Image();
    this.img.onload = updateCallback;
    this.setColor('#00FF00');
  }
  setColor(colorHex, areaID = 0) {
    this.color = colorHex;
    colorHex = colorHex.toString().substring(1);
    let r = parseInt(colorHex.substring(0, 2), 16);
    let g = parseInt(colorHex.substring(2, 4), 16);
    let b = parseInt(colorHex.substring(4, 6), 16);

    //    console.log(r,g,b);
    for (let x = 0; x < this.image.data.length; x += 4) {
      if (this.image.data[x + 3] === 0) continue;
      let pixel = x / 4 | 0;
      let br = this.brightness[pixel];
      //      console.log(br, this.alpha[x]);
      this.image.data[x] = r - br;
      this.image.data[x + 1] = g - br;
      this.image.data[x + 2] = b - br;
      this.image.data[x + 3] = this.alpha[pixel];
    }
    this.offCtx.clearRect(0, 0, this.width, this.height);
    this.offCtx.putImageData(this.image, 0, 0);
    this.img.src = this.canvas.toDataURL('image/png');
  }
  draw(x, y, context = ctx) {
    context.drawImage(this.img, x, y);
  }
}

export default ColoredSprite;
