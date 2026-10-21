export type AnimationName = "idle" | "walk" | "run" | "death";

export interface AnimationInfo {
  name: AnimationName;
  /** Sheet with the frames left to right, top to bottom, drawn at 1 art pixel per pixel */
  src: string;
  /** How long each frame is shown, in ms, in sheet order */
  frameDurations: number[];
  /** Frame durations used instead while out of breath (after sprinting) */
  outOfBreathFrameDurations?: number[];
  /** Whether the animation starts over after the last frame (default) or holds it */
  loop?: boolean;
  /** Art pixels per second the feet move at normal tempo; used to keep feet from sliding */
  groundSpeed?: number;
}

export interface ImageInfoType {
  src: string;
  width: number;
  height: number;
  row?: number;
  col?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  defaultAnimation?: AnimationName;
  animations?: Map<AnimationName, AnimationInfo>;
  /** Art x coordinate a mirrored sprite is flipped around (default: the frame centre) */
  mirrorAxis?: number;
  random?: boolean;
  nocollision?: boolean;
  nodepth?: boolean;
}

export let imgInfo: Map<string, ImageInfoType> = new Map();

export function setImgInfo(info: Map<string, ImageInfoType>): void {
  imgInfo = info;
}
