function getSoundMap(){
    let m = new Map();

    m.set('gunshot-revolver', 'sounds/gunshot-revolver.mp3');

    return m;
}

class AudioPlayer {
    constructor() {
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
