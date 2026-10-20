import { ctx } from "@/core/Browser.js";
import Sprite, { type SheetInfo, type SpriteOptions } from "./Sprite.js";
import Animation from "@/core/Animation.js";
import type { AnimationInfo, AnimationName } from "@/static/imgInfo.js";
import { allowProperty } from "@/utilities/utilities.js";
import { ANIMATED_SPRITE as as } from "@/global/consts.js";

// TODO: sanity check - these types are not used mostly in codebase, but probably it is what author want to do
export type AnimatedSpriteOptions = SpriteOptions & {
  autoAnimation?: boolean;
  interval?: number;
  framesPerInterval?: number;
  animationSpeed?: number;
};

export type AnimatedSheetInfo = SheetInfo & {
  animations: Map<AnimationName, AnimationInfo>;
  defaultAnimation?: AnimationName;
};

class AnimatedSprite extends Sprite {
  animations: Map<AnimationName, AnimationInfo>;
  currentFrame: number;
  currentAnimation: AnimationName | undefined;
  mirrored: boolean;
  defaultAnimation: AnimationName | undefined;
  autoAnimation: boolean;
  animation?: AnimationInfo;
  intervalID: number = 0;
  interval: number = as.defaultIntervalTime;
  framesPerInterval: number = as.defaultFramesPerInterval;
  animationSpeed: number = as.defaultAnimationSpeed;
  animationController: Animation | undefined;
  frame: number = 0;
  animating: boolean = false;
  declare sheetInfo: AnimatedSheetInfo;

  constructor(spriteName: Sprite["typeName"], options: AnimatedSpriteOptions = {}) {
    super(spriteName, options);
    allowProperty(this, "animation");
    delete this.animation;
    this.animations = this.sheetInfo.animations;
    this.defaultAnimation = this.sheetInfo.defaultAnimation;

    this.currentFrame = 0;
    this.currentAnimation = undefined;
    this.mirrored = false;

    if (this.defaultAnimation) {
      this.changeAnimation(this.defaultAnimation);
    }

    this.autoAnimation = options.autoAnimation ?? false;
    if (this.autoAnimation) {
      // this.intervalID = false;
      this.intervalID = 0;
      this.interval = options.interval ?? as.defaultIntervalTime;
      this.framesPerInterval = options.framesPerInterval ?? as.defaultFramesPerInterval;
      return;
    }
    this.animationSpeed = options.animationSpeed ?? as.defaultAnimationSpeed;
    this.animationController = new Animation(this, "()alterFrame", this.animationSpeed);
  }

  /**
   * Change the current animation
   @param animationName - The name of the animation to switch to
   */
  changeAnimation(animationName: AnimationName): void {
    if (!this.animations.has(animationName))
      throw new Error(
        "Sprite: Attempted to change to an animation that" + ` does not exist: ${animationName}`,
      );

    const animation = this.animations.get(animationName);
    if (!animation) throw new Error(`Animation not found for name: ${animationName}`);
    this.animation = animation;
    this.frame = 0;

    if (this.autoAnimation) {
      clearInterval(this.intervalID);
      this.animate(this.interval, this.framesPerInterval);
    }
  }
  /**
   * Reset the animation to frame 0
   */
  reset(): void {
    this.frame = 0;
  }
  /**
   * Start animating the current animation in intervals
   @param {number} [interval=as.defaultIntervalTime] - The time between intervals in miliseconds
   @param {number} [framesPerInterval=as.defaultFramesPerInterval] - The number of frames to cycle through after each interval
   */
  animate(
    interval: number = as.defaultIntervalTime,
    framesPerInterval: number = as.defaultFramesPerInterval,
  ): void {
    this.animating = true;
    this.intervalID = setInterval(() => this.alterFrame(framesPerInterval), interval);
  }

  /**
   * Switch the current frame of an animation
   @param {number} [frameCount=as.defaultFrameCount] - The number of frames to cycle through
   */
  alterFrame(frameCount: number = as.defaultFrameCount): void {
    if (!this.animation)
      throw new Error("Sprite: Attempted to cycle an animation " + "which was not defined");
    this.frame = (this.frame + frameCount) % this.animation.frames;
  }

  next(): void {
    if (!this.animationController) throw new Error("AnimatedSprite: No animation controller found");
    this.animationController.next();
  }

  draw(x: number, y: number, context = ctx): void {
    if (!context) throw new Error("AnimatedSprite: No context provided to draw on");
    if (!this.animation) throw new Error("AnimatedSprite: Attempted to draw without an animation");
    let row = this.mirrored
      ? (this.animation.mirroredRow ?? this.animation.row)
      : this.animation.row;
    context.drawImage(
      this.img,
      this.frame * this.width,
      row * this.height,
      this.width,
      this.height,
      x,
      y,
      this.width,
      this.height,
    );
  }
}

export default AnimatedSprite;
