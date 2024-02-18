import { randIntInRange } from "../global/utilities.js";

class Seed {
  constructor() {
    this.useCount = 0;
    
    this.floatLoopLength = null;
    this.floats = [];
  }

  /**
     Prepares float values for getFloat()
  */
  generateFloats() {
    const floatBitLength = 8;
    const loopLength = this.bits.length / floatBitLength;
    
    this.floats = [];
    for (let i=0; i<loopLength; ++i) {
      let startBit = i * floatBitLength;
      let part = this.bits.slice(startBit, startBit+floatBitLength);
      this.floats.push(parseInt(part.join(""), 2) / 2**floatBitLength);
    }
    this.floatLoopLength = loopLength;
  }
  
  /**
   * Generates an array of bits based on given seed. If the seed
   * is null, use a random one.
   * @param {string|number|null} [seed=null] seed
   * @param {function} callback - A function to run on completion
   * of the seed generation. The seed bits array is passed as
   * an argument to this function.
  */
  generate(seed=null, callback) {
    this.seed = seed ?? randIntInRange(0, 1000000);

    // encode seed as UTF-8
    const seedBuffer = new TextEncoder().encode(this.seed);

    // hash the message
    const hashBuffer = crypto.subtle.digest('SHA-256', seedBuffer)
      .then((hashBuffer) => {
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const binaryArray = hashArray.map(
	  b => b.toString(2)
	    .padStart(8, "0")
	    .split("")
	    .map(s => Number.parseInt(s)))
	  .flat();
	this.bits = binaryArray;
	this.generateFloats();
	callback(binaryArray);
      });
  }
  
  /**
     Returns a float value from a part of the seed, depending on the current
     value of `this.useCount`. Loops every `this.floatLoopLength` times.
  */
  getFloat() {
    return this.floats[this.useCount % this.floatLoopLength];
  }
  
  random() {
    let sinVal = Math.sin(this.getFloat() + this.useCount) * 10000;
    this.useCount++;
    
    return sinVal - Math.floor(sinVal);
  }
}

const seed = new Seed();
export default seed;
