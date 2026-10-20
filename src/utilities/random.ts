import seed from "../global/seed.js";

/**
 * Return a random float.
 # Two arguments provided: Return a float from range <`min`, `max`)
 @param {number} min - returned float lower limit, inclusive
 @param {number} max - returned float upper limit, exclusive
 */
export function randFloatInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Return a random integer.
 # Two arguments provided: Return an integer from range <`min`, `max`)
 @param {number} min - returned integer lower limit, inclusive
 @param {number} max - returned integer upper limit, exclusive
 */
export function randIntInRange(min: number, max: number): number {
  return (Math.random() * (max - min) + min) | 0;
}

/**
 * Return a random integer based on the global seed
 # Two arguments provided: Return an integer from range <`min`, `max`)
 @param {number} min - returned integer lower limit, inclusive
 @param {number} max - returned integer upper limit, exclusive
 */
export function srandIntInRange(min: number, max: number): number {
  return (seed.random() * (max - min) + min) | 0;
}

/**
 * Rolling possibility with given chance
 * @param {number} chance value between 0 and 1, chance of getting success
 * @returns {boolean} true if roll was successful, otherwise false
 */
export function roll(chance: number): boolean {
  if (chance < 0 || chance > 1) {
    throw new Error(
      `Attempt to roll when chance of success ` + `(${chance}) was not between 0 and 1`,
    );
  }
  if (randFloatInRange(0, 1) < chance) return true;
  return false;
}

/**
 * Rolling possibility with given chance based on the global seed
 * @param {number} chance value between 0 and 1, chance of getting success
 * @returns {boolean} true if roll was successful, otherwise false
 */
export function seedRoll(chance: number): boolean {
  if (chance < 0 || chance > 1) {
    throw new Error(
      `Attempt to seedRoll when chance of success ` + `(${chance}) was not between 0 and 1`,
    );
  }
  if (seed.random() < chance) return true;
  return false;
}
