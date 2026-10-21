import { Sound, soundKind } from "@/engine/audio/Sound";

const soundMap = new Map([
  ["revolver-shot", new Sound("sounds/revolver/revolver-shot.mp3", soundKind.Effect)],
  ["revolver-load", new Sound("sounds/revolver/revolver-load.mp3", soundKind.Effect)],
  ["revolver-roll", new Sound("sounds/revolver/revolver-roll.mp3", soundKind.Effect)],
] as const);

export default soundMap;
