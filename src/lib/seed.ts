class Seed {
  private state: number = 0;

  set(seed: number): void {
    this.state = seed;
  }

  /**
     Returns a float from range <0, 1) using the mulberry32 algorithm
  */
  random(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

const seed = new Seed();
export default seed;
