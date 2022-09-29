/*
  file: src/AnimatedSprite.js
  purpose: define a class for displaying animated sprites
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

import ctx from "./global/ctx.js";

import Sprite from "./Sprite.js";

import Animation from "./Animation.js";

/**
 * Create sprites to make display and animation simple
 */
class AnimatedSprite extends Sprite{
  constructor(spriteName, options){
    super(spriteName, options);

    this.animations = this.imageInfo.animations;
    this.defaultAnimation = this.imageInfo.defaultAnimation;

    this.currentFrame = 0;
    this.currentAnimation = undefined;
    this.mirrored = false;

    if (this.defaultAnimation){
      this.changeAnimation(this.defaultAnimation);
    }

    this.autoAnimation = options.autoAnimation ?? false;
    if (this.autoAnimation) {
      this.intervalID = false;
      this.interval = options.interval ?? 110;
      this.framesPerInterval = options.framesPerInterval ?? 1;
      return;
    }
    this.animationSpeed = options.animationSpeed ?? 8;
    this.animationController = new Animation(this, '()alterFrame', this.animationSpeed);
  }
  
  /**
   * Change the current animation
   @param {string} animationName - The name of the animation to switch to
   */
  changeAnimation(animationName){
    if (!this.animations.has(animationName))
      throw('Sprite: Attempted to change to an animation that' +
	` does not exist: ${animationName}`);

    this.animation = this.animations.get(animationName);
    this.frame = 0;

    if (this.autoAnimation){
      clearInterval(this.intervalID);
      this.animate(this.interval, this.framesPerInterval);
    }
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
      () => this.alterFrame(framesPerInterval),
      interval);
  }

  /**
   * Switch the current frame of an animation
   @param {number} [frameCount=1] - The number of frames to cycle through
   */
  alterFrame(frameCount=1){
    if (!this.animation)
      throw('Sprite: Attempted to cycle an animation' +
	' which was not defined');
    this.frame = (this.frame + frameCount) % this.animation.frames;
  }

  next(){
    this.animationController.next();
  }

  draw(x,y){
    let row = (this.mirrored)? this.animation.mirroredRow : this.animation.row;
    ctx.drawImage(this.img,
		  this.frame * this.width,
		  row * this.height,
		  this.width, this.height, x, y,
		  this.width, this.height);
  }
}

export default AnimatedSprite;
