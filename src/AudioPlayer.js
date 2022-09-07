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

// Improvised enum defining sound kind
const SoundKind = {
    Music: 'music',
    MenuMusic: 'menu-music',
    Effect: 'effect',
    Dialogue: 'dialogue'
}

/**
 * Helper class representing a single sound object, a wrapper over HTMLAudioElement
 */
class Sound {
    constructor(src, kind) {
	this.sound = new Audio(src);
	this.kind = kind;
    }
}
/**
 * Construct a variable mapping human-accessible and intuitive names to filenames of sound effects
 */
function getSoundMap(){
    let m = new Map();

    m.set('gunshot-revolver', new Sound('sounds/gunshot-revolver.mp3', SoundKind.Effect));

    return m;
}

function getVolumeMap(){
    
    let m = new Map();

    m.set(SoundKind.Music, 1);
    m.set(SoundKind.MenuMusic, 1);
    m.set(SoundKind.Effect, 1);
    m.set(SoundKind.Dialogue, 1);

    return m;
}

/**
 * Class for sound effect and music playback
 */
class AudioPlayer {
    constructor() {
	this.soundMap = getSoundMap();
	this.volumeMap = getVolumeMap();
	console.log("Constructed AudioPlayer");
	this.updateVolumes();
    }

    play(soundName) {
	this.soundMap.get(soundName).sound.play();
    }

    updateVolumes() {
	for (const key of this.soundMap) {
	    console.log(`key: ${key[0]}`);
	    let sound = key[1];
	    sound.sound.volume = this.volumeMap.get(sound.kind);
	}
    }

    setMusicVolume(vol) {
	this.volumeMap.set(SoundKind.Music, vol);
    }
    setMenuMusicVolume(vol) {
	this.volumeMap.set(SoundKind.MenuMusic, vol);
    }
    setEffectVolume(vol) {
	this.volumeMap.set(SoundKind.Effect, vol);
    }
    setDialogueVolume(vol) {
	this.volumeMap.set(SoundKind.Dialogue, vol);
    }
    
    getMusicVolume() {
	return this.volumeMap.get(SoundKind.Music)
    }
    getMenuMusicVolume() {
	return this.volumeMap.get(SoundKind.MenuMusic)
    }
    getEffectVolume() {
	return this.volumeMap.get(SoundKind.Effect)
    }
    getDialogueVolume() {
	return this.volumeMap.get(SoundKind.Dialogue)
    }
}

export default AudioPlayer;
