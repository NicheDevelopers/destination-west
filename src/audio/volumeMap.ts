import { soundKind, type SoundKind } from "./Sound.js";

const volumeMap = new Map<SoundKind, number>([
  [soundKind.Music, 1],
  [soundKind.MenuMusic, 1],
  [soundKind.Effect, 1],
  [soundKind.Dialogue, 1],
]);

export default volumeMap;
