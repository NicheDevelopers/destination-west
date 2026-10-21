class Seed {
  private useCount: number = 0;
  private floatLoopLength: number = 1;
  private floats: number[] = [];
  private bits: number[] = [];
  readonly seed: number;

  constructor(seed: Seed["seed"]) {
    this.seed = seed;
  }

  /**
     Prepares float values for getFloat()
  */
  generateFloats() {
    const floatBitLength = 8;
    const loopLength = this.bits.length / floatBitLength;

    this.floats = [];
    for (let i = 0; i < loopLength; ++i) {
      let startBit = i * floatBitLength;
      let part = this.bits.slice(startBit, startBit + floatBitLength);
      this.floats.push(parseInt(part.join(""), 2) / 2 ** floatBitLength);
    }
    this.floatLoopLength = loopLength;
  }

  /**
   * Generates an array of bits based on given seed.
   * @param callback - A function to run on completion
   * of the seed generation. The seed bits array is passed as
   * an argument to this function.
   */
  generate(callback: (bits: number[]) => void, errorCallback: (error: unknown) => void): void {
    // encode seed as UTF-8
    const seedBuffer = new TextEncoder().encode(String(this.seed));

    // hash the message
    crypto.subtle.digest("SHA-256", seedBuffer).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const binaryArray = hashArray
        .map((b) =>
          b
            .toString(2)
            .padStart(8, "0")
            .split("")
            .map((s) => Number.parseInt(s)),
        )
        .flat();
      this.bits = binaryArray;
      this.generateFloats();
      try {
        callback(binaryArray);
      } catch (e: unknown) {
        errorCallback(e);
      }
    });
  }

  /**
     Returns a float value from a part of the seed, depending on the current
     value of `this.useCount`. Loops every `this.floatLoopLength` times.
  */
  getFloat(): number {
    return this.floats[this.useCount % this.floatLoopLength];
  }

  random(): number {
    let sinVal = Math.sin(this.getFloat() + this.useCount) * 10000;
    this.useCount++;

    return sinVal - Math.floor(sinVal);
  }
}

const seed = new Seed(Math.floor(Math.random() * 1000000));
export default seed;
