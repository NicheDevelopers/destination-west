import { Sound, soundKind } from "./Sound.js";

const soundMap = new Map([
  ["revolver-shot", new Sound("sounds/revolver/revolver-shot.mp3", soundKind.Effect)],
  ["revolver-load", new Sound("sounds/revolver/revolver-load.mp3", soundKind.Effect)],
  ["revolver-roll", new Sound("sounds/revolver/revolver-roll.mp3", soundKind.Effect)],
] as const);

export type SoundName = typeof soundMap extends Map<infer Name, unknown> ? Name : never;

export default soundMap;
