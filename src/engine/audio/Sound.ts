// Improvised enum defining sound kind
const soundKind = {
  Music: "music",
  MenuMusic: "menu-music",
  Effect: "effect",
  Dialogue: "dialogue",
} as const;

type SoundKind = (typeof soundKind)[keyof typeof soundKind];

/**
 * Helper class representing a single sound object, a wrapper over HTMLAudioElement
 */
class Sound {
  readonly sound: HTMLAudioElement;
  readonly kind: SoundKind;

  constructor(src: string, kind: SoundKind) {
    this.sound = new Audio(src);
    this.kind = kind;
  }
}

export { Sound, soundKind, type SoundKind };
