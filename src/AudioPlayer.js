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
const soundKind = {
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

    m.set('gunshot-revolver', new Sound('sounds/gunshot-revolver.mp3', soundKind.Effect));

    return m;
}

function getVolumeMap(){
    
    let m = new Map();

    m.set(soundKind.Music, 1);
    m.set(soundKind.MenuMusic, 1);
    m.set(soundKind.Effect, 1);
    m.set(soundKind.Dialogue, 1);

    return m;
}

/**
 * Class for sound effect and music playback
 */
class AudioPlayer {
    constructor() {
	this.soundMap = getSoundMap();
	this.volumeMap = getVolumeMap();
	this.updateVolumes();
    }

    play(soundName) {
	if (typeof this.soundMap.get(soundName) === undefined) {
	    throw `Audio Player: ` + `No sound object found for name ${soundName}`;
	}
	this.soundMap.get(soundName).sound.play();
	return true;
    }

    updateVolumes() {
	for (const key of this.soundMap) {
	    let sound = key[1];
	    sound.sound.volume = this.volumeMap.get(sound.kind);
	}
    }

    setMusicVolume(vol) {
	if (vol < 0 || vol >1) throw `Audio Player:` + `Invalid volume argument for setMusicVolume. Allowed range: <0;1>, but argument is ${vol}`;
	this.volumeMap.set(soundKind.Music, vol);
	return true;
    }
    setMenuMusicVolume(vol) {
	if (vol < 0 || vol >1) throw `Audio Player:` + `Invalid volume argument for setMenuMusicVolume. Allowed range: <0;1>, but argument is ${vol}`;
	this.volumeMap.set(soundKind.MenuMusic, vol);
	return true;
    }
    setEffectVolume(vol) {
	if (vol < 0 || vol >1) throw `Audio Player:` + `Invalid volume argument for setEffectVolume. Allowed range: <0;1>, but argument is ${vol}`;
	this.volumeMap.set(soundKind.Effect, vol);
	return true;
    }
    setDialogueVolume(vol) {
	if (vol < 0 || vol >1) throw `Audio Player:` + `Invalid volume argument for setDialogueVolume. Allowed range: <0;1>, but argument is ${vol}>`;
	this.volumeMap.set(soundKind.Dialogue, vol);
	return true;
    }
    
    getMusicVolume() {
	return this.volumeMap.get(soundKind.Music)
    }
    getMenuMusicVolume() {
	return this.volumeMap.get(soundKind.MenuMusic)
    }
    getEffectVolume() {
	return this.volumeMap.get(soundKind.Effect)
    }
    getDialogueVolume() {
	return this.volumeMap.get(soundKind.Dialogue)
    }
}

export default AudioPlayer;
