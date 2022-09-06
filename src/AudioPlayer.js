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


/**
 * Construct a variable mapping human-accessible and intuitive names to filenames of sound effects
 */
function getSoundMap(){
    let m = new Map();

    m.set('gunshot-revolver', 'sounds/gunshot-revolver.mp3');

    return m;
}

/**
 * Class for sound effect and music playback
 */
class AudioPlayer {
    constructor(volume) {
	this.volume = 1;
	this.soundMap = getSoundMap();
    }

    addSound(name, filename) {
	if (!this.soundMap.has(name)) {
	    this.soundMap.set(name, filename);
	} else {
	    console.log(`AudioPlayer: key '${name}' already exists in the soundMap, mapped value is '${this.soundMap.get(name)}'`);
	}
    }

    play(soundName) {
	let sound = this.soundMap.get(soundName);
	if (typeof sound === undefined) {
	    console.log("Sound not found");
	}
	let a = new Audio(sound);
	a.addEventListener("canplaythrough", (event) => {
	    a.play();
	});
    }
}

export default AudioPlayer;
