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
    
  }],
  ["player", {
    src: "img/player.png",
    height: 37,
    width: 50,
    defaultAnimation: "run",
    animations: new Map([
      ["run", {
	row: 0,
	frames: 6
      }]
    ])
  }]
]);
/**
 * Class for creating sprites - objects that make displaying and animating easy
 */
export default class Sprite{
  constructor(typeName){
    ({src: this.src, height: this.height,
      width: this.width, sx: this.sx, sy: this.sy,
      animations: this.animations,
      defaultAnimation: this.defaultAnimation} = imgInfo.get(typeName));
    this.img = new Image();
    this.img.src = this.src;

    this.frame = (this.sx)? this.sx : 0;
    this.animation = {row: (this.sy)? this.sy : 0};
    if (this.defaultAnimation){
      this.changeAnimation(this.defaultAnimation);
    }
    
  }
  changeAnimation(animationName){
    if (!this.animations.has(animationName)){
      console.error('Sprite: Attempted to change to an animation that' +
	` does not exist: ${animationName}`);
      return;
    }
    this.animation = this.animations.get(animationName);
    this.frame = 0;
  }
  reset(){
    this.frame = 0;
  }
  next(n=1){
    if (!this.animation){
      console.error('Sprite: Attempted to cycle an animation which was' +
	' not defined');
      return;
    }
    this.frame = (this.frame + n) % this.animation.frames;
  }
  draw(x, y){
    ctx.drawImage(this.img,
		  this.frame * this.width,
		  this.animation.row * this.height,
		  this.width, this.height, x, y,
		  this.width, this.height);
  }
}
