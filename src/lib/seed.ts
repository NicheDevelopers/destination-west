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

// FNV-1a with an extra shift, so that neighbouring IDs give unrelated seeds
export function deriveSeed(...values: number[]): number {
  let hash = 0x811c9dc5;
  for (const value of values) {
    hash = Math.imul(hash ^ value, 0x01000193);
    hash ^= hash >>> 15;
  }
  return hash | 0;
}

const seed = new Seed();
export default seed;
