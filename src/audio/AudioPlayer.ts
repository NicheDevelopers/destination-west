/*
  file: src/AudioPlayer.js
  purpose: define the AudioPlayer class - provide an interface for sound playback
  author: Michał Miłek <https://gitlab.com/mmilek>
  
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

import { soundKind, type Sound, type SoundKind } from "./Sound.js";
import soundMap, { type SoundName } from "./soundMap.js";
import volumeMap from "./volumeMap.js";

type PlayOptions = {
  /** Additional delay in ms before playing the sound */
  delay?: number;
};

/**
 * Class for sound effect and music playback
 */
class AudioPlayer {
  soundMap: Map<SoundName, Sound>;
  volumeMap: Map<SoundKind, number>;

  constructor() {
    this.soundMap = soundMap;
    this.volumeMap = volumeMap;
    this.updateVolumes();
  }

  /**
   * Plays a sound from the soundMap
   */
  play(soundName: SoundName, options: PlayOptions = {}): void {
    const obtainedSound = this.soundMap.get(soundName);
    if (obtainedSound === undefined) {
      throw new Error(`Audio Player: No sound object found for name ${soundName}`);
    }
    // Cloning allows for multiple instances of the sound to be played at once
    if (options.delay) {
      setTimeout(() => {
        void (obtainedSound.sound.cloneNode() as HTMLAudioElement).play();
      }, options.delay);
      return;
    }
    void (obtainedSound.sound.cloneNode() as HTMLAudioElement).play();
  }

  updateVolumes(): void {
    for (const key of this.soundMap) {
      let sound = key[1];
      sound.sound.volume = this.volumeMap.get(sound.kind)!;
    }
  }

  setMusicVolume(vol: number): boolean {
    if (vol < 0 || vol > 1)
      throw new Error(
        `Audio Player: Invalid volume argument for setMusicVolume.\n` +
          `Allowed range: <0;1>, but argument is ${vol}`,
      );
    this.volumeMap.set(soundKind.Music, vol);
    return true;
  }

  setMenuMusicVolume(vol: number): boolean {
    if (vol < 0 || vol > 1)
      throw new Error(
        `Audio Player: Invalid volume argument for setMenuMusicVolume.\n` +
          `Allowed range: <0;1>, but argument is ${vol}`,
      );
    this.volumeMap.set(soundKind.MenuMusic, vol);
    return true;
  }

  setEffectVolume(vol: number): boolean {
    if (vol < 0 || vol > 1)
      throw new Error(
        `Audio Player: Invalid volume argument for setEffectVolume.\n` +
          `Allowed range: <0;1>, but argument is ${vol}`,
      );
    this.volumeMap.set(soundKind.Effect, vol);
    return true;
  }
  setDialogueVolume(vol: number): boolean {
    if (vol < 0 || vol > 1)
      throw new Error(
        `Audio Player: Invalid volume argument for setDialogueVolume.\n` +
          `Allowed range: <0;1>, but argument is ${vol}>`,
      );
    this.volumeMap.set(soundKind.Dialogue, vol);
    return true;
  }

  getMusicVolume(): number | undefined {
    return this.volumeMap.get(soundKind.Music);
  }
  getMenuMusicVolume(): number | undefined {
    return this.volumeMap.get(soundKind.MenuMusic);
  }
  getEffectVolume(): number | undefined {
    return this.volumeMap.get(soundKind.Effect);
  }
  getDialogueVolume(): number | undefined {
    return this.volumeMap.get(soundKind.Dialogue);
  }
}

export default AudioPlayer;
