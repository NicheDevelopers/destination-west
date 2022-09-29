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
import imgInfo from "../static/imgInfo.js";

/**
 * Create sprites to display grayscale-source sprites in color
 */
class ColoredSprite extends Sprite{
  constructor(spriteName, options){
    super(spriteName, options);
    
    let canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    //let offscreen = new OffscreenCanvas(this.width, this.height);
    let offCtx = canvas.getContext('2d');
    offCtx.drawImage(
      this.img, this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width, this.height, 0, 0,
      this.width * this.scaleX, this.height * this.scaleY);
  
    let image = offCtx.getImageData(0, 0, this.width, this.height);
    offCtx.clearRect(0, 0, this.width, this.height);

    for (let x = 0; x < image.data.length; x += 4){
      if (image.data[x+3] === 0) continue;
      let brightness = image.data[x];
      //image.data[x] += 80;
      //image.data[x+1] += 20;
      //image.data[x+2] += 3;
    }
    offCtx.putImageData(image, 0, 0);
    
    this.img = new Image(32, 32);
    
    this.img.src = canvas.toDataURL('image/png');
    //console.log(this.img.src);
    //this.img.src = this.imageData;
  }

  draw(x,y){
    ctx.drawImage(this.img, x, y);
    //ctx.putImageData(this.imageData, 32, 32);
  }
    
}

export default ColoredSprite;
