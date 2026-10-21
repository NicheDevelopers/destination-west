import { ctx } from "@/engine/Browser";
import Sprite, { type SheetInfo, type SpriteOptions } from "./Sprite";
import time from "@/engine/time";
import { imgInfo, type AnimationInfo, type AnimationName } from "./imgInfo";
import { allowProperty } from "@/lib/utilities";
import { PIXEL_SCALE } from "@/engine/consts";

export type AnimatedSheetInfo = SheetInfo & {
  animations: Map<AnimationName, AnimationInfo>;
  defaultAnimation?: AnimationName;
  mirrorAxis?: number;
};

/**
 * Animation sheets shared by all sprites (src -> image)
 */
const animationImages: Map<string, HTMLImageElement> = new Map();

function animationImage(src: string): HTMLImageElement {
  let img = animationImages.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    animationImages.set(src, img);
  }
  return img;
}

/**
 * Load every animation sheet listed in imgInfo. The game should wait for
 * this before creating animated sprites.
 */
export function preloadAnimationImages(): Promise<void[]> {
  const sources = new Set(
    [...imgInfo.values()].flatMap((info) =>
      [...(info.animations?.values() ?? [])].map((animation) => animation.src),
    ),
  );
  return Promise.all([...sources].map((src) => animationImage(src).decode()));
}

class AnimatedSprite extends Sprite {
  animations: Map<AnimationName, AnimationInfo>;
  defaultAnimation: AnimationName | undefined;
  animation?: AnimationInfo;
  mirrored: boolean = false;
  /** Art x coordinate the sprite is flipped around when mirrored */
  mirrorAxis: number;
  /** Playback speed multiplier: 2 plays twice as fast */
  tempo: number = 1;
  /** Use the animation's out-of-breath frame timings, if it has them */
  outOfBreath: boolean = false;
  frame: number = 0;
  /** Time in ms the current frame has already been shown (at tempo 1) */
  frameTime: number = 0;
  declare sheetInfo: AnimatedSheetInfo;

  constructor(spriteName: Sprite["typeName"], options: SpriteOptions = {}) {
    super(spriteName, { scale: PIXEL_SCALE, ...options });
    allowProperty(this, "animation");
    delete this.animation;
    this.animations = this.sheetInfo.animations;
    this.defaultAnimation = this.sheetInfo.defaultAnimation;
    this.mirrorAxis = this.sheetInfo.mirrorAxis ?? this.width / 2;

    if (this.defaultAnimation) {
      this.changeAnimation(this.defaultAnimation);
    }
  }

  /**
   * Change the current animation and start it from its first frame
   @param animationName - The name of the animation to switch to
   */
  changeAnimation(animationName: AnimationName): void {
    const animation = this.animations.get(animationName);
    if (!animation)
      throw new Error(
        "Sprite: Attempted to change to an animation that" + ` does not exist: ${animationName}`,
      );
    this.animation = animation;
    this.reset();
  }
  /**
   * Reset the animation to frame 0
   */
  reset(): void {
    this.frame = 0;
    this.frameTime = 0;
  }

  /**
   * Advance the animation by the time passed since the last game tick
   */
  next(): void {
    if (!this.animation) throw new Error("AnimatedSprite: No animation to advance");
    const frameCount = this.animation.frameDurations.length;
    this.frameTime += time.delta * this.tempo;

    while (this.frameTime >= this.frameDuration(this.animation, this.frame)) {
      const lastFrame = this.frame === frameCount - 1;
      if (lastFrame && this.animation.loop === false) {
        this.frameTime = 0;
        return;
      }
      this.frameTime -= this.frameDuration(this.animation, this.frame);
      this.frame = lastFrame ? 0 : this.frame + 1;
    }
  }

  private frameDuration(animation: AnimationInfo, frame: number): number {
    const durations =
      this.outOfBreath && animation.outOfBreathFrameDurations
        ? animation.outOfBreathFrameDurations
        : animation.frameDurations;
    return durations[frame];
  }

  draw(x: number, y: number, context = ctx): void {
    if (!context) throw new Error("AnimatedSprite: No context provided to draw on");
    if (!this.animation) throw new Error("AnimatedSprite: Attempted to draw without an animation");
    const img = animationImage(this.animation.src);
    const columns = Math.max(1, Math.floor(img.naturalWidth / this.width));
    const sx = (this.frame % columns) * this.width;
    const sy = Math.floor(this.frame / columns) * this.height;
    const width = this.width * this.scaleX;
    const height = this.height * this.scaleY;

    context.save();
    // Scaling pixel art up must not blend neighbouring pixels
    context.imageSmoothingEnabled = false;
    if (this.mirrored) {
      // Flip around the mirror axis so the body stays in place when turning around
      context.translate(x + 2 * this.mirrorAxis * this.scaleX, y);
      context.scale(-1, 1);
      context.drawImage(img, sx, sy, this.width, this.height, 0, 0, width, height);
    } else {
      context.drawImage(img, sx, sy, this.width, this.height, x, y, width, height);
    }
    context.restore();
  }
}

export default AnimatedSprite;
