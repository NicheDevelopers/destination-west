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
    row: 0,
    col: 0   
  }],
  ["player", {
    src: "img/player.png",
    height: 37,
    width: 50,
    defaultAnimation: "idle",
    animations: new Map([
      ["idle", {
	name: "idle",
	row: 0,
	frames: 3,
	mirroredRow: 1
      }],
      ["run", {
	name: "run",
	row: 2,
	frames: 6,
	mirroredRow: 3
      }]
    ])
  }],
  ["saloon_0", {
    src: "img/saloon.png",
    height: 96,
    width: 96,
    row: 0,
    col: 0,
    physicalWidth: 3,
    physicalHeight: 2,
    tileWidth: 3,
    tileHeight: 3
  }]
]);
/**
 * Create sprites to make display and animation simple
 */
class Sprite{
  /**
   * Create a sprite
     @param {string} typeName - Name of the sprite graphic to be used
     @param {Object} [options] - Additional options
     @param {boolean} [options.autoAnimation=false]Toggle automatical animation
     @param {number} [options.interval=110] - The interval to use with autoAnimation
     @param {number} [options.framesPerInterval=1] - The number of frames to cycle through after each interval in the auto animation
  */
  constructor(typeName, options={}){
    this.img = new Image();
    ({src: this.src,
      height: this.height, width: this.width,
      row: this.spriteSheetRow, col: this.spriteSheetCol,
      defaultAnimation: this.defaultAnimation,
      animations: this.animations} = imgInfo.get(typeName));

    this.img.src = this.src;

    this.mirrored = false;
    
    if (!this.animations) return;
        
    // ANIMATION SETTINGS

    this.currentFrame = 0;
    this.currentAnimation = undefined;

    this.intervalID = false;

    this.interval = 110;
    if (options?.interval)
      this.interval = options.interval;

    this.framesPerInterval = 1;
    if (options?.framesPerInterval)
      this.framesPerInterval = options.framesPerInterval;

    this.autoAnimation = false;
    if (options?.autoAnimation)
      this.autoAnimation = true;

    if (this.defaultAnimation){
      this.changeAnimation(this.defaultAnimation);
    }
    
  }
  /**
   * Change the current animation
   @param {string} animationName - The name of the animation to switch to
   */
  changeAnimation(animationName){
    if (!this.animations.has(animationName)){
      console.error('Sprite: Attempted to change to an animation that' +
	` does not exist: ${animationName}`);
      return;
    }
    this.animation = this.animations.get(animationName);
    this.frame = 0;
    clearInterval(this.intervalID);
    if (this.autoAnimation)
      this.animate(this.interval, this.framesPerInterval);
  }
  /**
   * Reset the animation to frame 0
   */
  reset(){
    this.frame = 0;
  }
  /**
   * Start animating the current animation in intervals
   @param {number} [interval=110] - The time between intervals in miliseconds
   @param {number} [framesPerInterval=1] - The number of frames to cycle through after each interval
   */
  animate(interval=110, framesPerInterval=1){
    this.animating = true;
    this.intervalID = setInterval(
      () => this.next(framesPerInterval),
      interval);
  }
  /**
   * Switch the current frame of an animation
   @param {number} [frameCount=1] - The number of frames to cycle through
   */
  next(frameCount=1){
    if (!this.animation){
      console.error('Sprite: Attempted to cycle an animation' +
	' which was not defined');
      return;
    }
    this.frame = (this.frame + frameCount) % this.animation.frames;
  }
  /**
   * Draw the sprite on the #game-canvas
   @param {number} x - Position x of the draw location
   @param {number} y - Position y of the draw location
   */
  draw(x, y){
    if (this.animations){
      let row = (this.mirrored)? this.animation.mirroredRow : this.animation.row;
      ctx.drawImage(this.img,
		    this.frame * this.width,
		    row * this.height,
		    this.width, this.height, x, y,
		    this.width, this.height);
    }
    else { ctx.drawImage(this.img,
		    this.spriteSheetCol * this.width,
		    this.spriteSheetRow * this.height,
		    this.width, this.height, x, y,
		    this.width, this.height);
    }
  }
}

export default Sprite;
