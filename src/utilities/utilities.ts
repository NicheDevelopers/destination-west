/*
  file: src/utilities.js
  purpose: Provide utility functions useful in many scenarios.
  authors: Michał Miłek <https://gitlab.com/mmilek>
           Artur Gulik <https://gitlab.com/ArturGulik>
  
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

import { TILE_SIZE } from "../global/consts.js";
import { randIntInRange, srandIntInRange } from "./random.js";
import type { Comparator } from "./extensions.js";

/**
 * A map storing the highest recorded ID for each objectName
 */
type Class = abstract new (...args: any[]) => any;
const ids: Map<Class, number> = new Map();
/**
 * Generate unique IDs for in-game objects
 */
export function generateID(objectName: Class): number {
  ids.set(objectName, (ids.get(objectName) ?? -1) + 1);
  return ids.get(objectName)!;
}
export function resetIdFor(objectName: Class): void {
  ids.delete(objectName);
}

export type Point = { x: number; y: number };

export type Size = { width: number; height: number };

export function distance({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function roundToTile(value: number): number {
  return Math.floor(value / TILE_SIZE);
}

/**
   Return an {x, y} object which represents
   the coordinates of a tile that contains
   the point given as the arguemnt.
*/
export function pointToTileCoord({ x, y }: Point): Point {
  return {
    x: roundToTile(x),
    y: roundToTile(y),
  };
}

export function comparePositions({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): boolean {
  return x1 === x2 && y1 === y2;
}

export function validateOptions(
  givenOptions: object,
  allowedOptions: Map<string, string>,
  name = "",
): void {
  Object.keys(givenOptions).forEach((option) => {
    if (!allowedOptions.has(option))
      throw new Error(`Unrecognized ${name} construction option: ${option}`);
  });
}

export function forbidProperty(obj: object, prop: string): void {
  Object.defineProperty(obj, prop, {
    configurable: true,
    get: function () {
      throw new Error(
        `Attempt to read ${prop} property which ` + `is forbidden for ${obj.constructor.name}`,
      );
    },
  });
}

export function allowProperty(obj: object, prop: string): void {
  // remove property with an error-provoking getter
  delete (obj as Record<string, unknown>)[prop];
}

export function makeEven(x: number): number {
  if (x % 2 == 1) x++;
  return x;
}

/**
   Returns a string with digits added to a number
   to make the whole number part and the decimal part
   at long as specified. The whole number part may be
   longer than that if it originally was. The decimal
   part is truncated when needed.

   numLength or decLength can be -1 to leave the whole
   number part or the decimal part unchanged.
   
   For example numberPad(4.2, 2, 3) shall return 04.200
   numberPad(430.239, 2, 2) shall return 430.23
 */
export function numberPad(value: number, numLength: number = -1, decLength: number = 2): string {
  let str = String(value);
  let point = str.indexOf(".");
  if (point === -1) {
    if (decLength > 0) {
      str += "." + "0".repeat(decLength);
      point = str.indexOf(".");
    }
  }
  if (point < numLength) {
    str = "0".repeat(numLength - point) + str;
  }
  if (decLength < 0) return "";
  let decimals = str.length - point - 1;
  if (decimals < decLength) {
    str += "0".repeat(decLength - decimals);
  } else if (decimals > decLength) {
    str = str.substring(0, str.length - (decimals - decLength));
  }
  return str;
}

Object.defineProperty(Array.prototype, "none", {
  value: function <T>(fn: (element: T) => boolean): boolean {
    return !this.some(fn);
  },
});

Object.defineProperty(Array.prototype, "lastIndex", {
  get: function (): number {
    return this.length - 1;
  },
});

Object.defineProperty(Array.prototype, "first", {
  get: function <T>(): T | undefined {
    return this[0];
  },
});

Object.defineProperty(Array.prototype, "last", {
  get: function <T>(): T | undefined {
    return this[this.length - 1];
  },
});

Object.defineProperty(Array.prototype, "lastNthElement", {
  value: function <T>(n: number): T {
    if (n < 0 || n > this.length - 1) {
      throw new Error(
        `Attempt to get lastNthElement (${n}) of array, ` +
          `when array's last index is ${this.length - 1}`,
      );
    }
    return this[this.length - 1 - n];
  },
});

import { DIRECTIONS } from "../global/consts.js";
import Direction from "../game/Direction.js";
export { Direction, DIRECTIONS };

Object.defineProperty(Array.prototype, "popFirst", {
  value: function <T>(value: T): void {
    for (let i = 0; i < this.length; ++i) {
      if (this[i] === value) {
        this.splice(i, 1);
        return;
      }
    }
  },
});

Object.defineProperty(Array.prototype, "clear", {
  value: function (): void {
    this.length = 0;
  },
});

Object.defineProperty(Array.prototype, "randomElement", {
  value: function <T>(): T | undefined {
    return this[randIntInRange(0, this.length)];
  },
});

Object.defineProperty(Array.prototype, "srandomElement", {
  value: function <T>(): T | undefined {
    return this[srandIntInRange(0, this.length)];
  },
});

/* The comparison functions in `min` and `max` act like
   the comparison function passed to Array.prototype.sort().
   
   Min returns what would be the first element after such sort
   and max returns what would be the last element.
   
   This means that a function which provides ascending sort
   of the elements should be passed to `min` and `max` to
   get expected results.
   
   In max: fn(element, currentMax) return value:
   >  0 - element becomes the new currentMax
   <= 0 - currentMax remains
   
   In min: fn(element, currentMin) return value:
   >= 0 - currentMin remains
   <  0 - element becomes the new currentMin
*/
Object.defineProperty(Array.prototype, "max", {
  value: function <T>(fn: Comparator<number> = (a, b) => a - b): T | undefined {
    let max = undefined;
    for (let element of this) {
      if (max == undefined) max = element;
      if (fn(element, max) > 0) max = element;
    }
    return max;
  },
});

Object.defineProperty(Array.prototype, "min", {
  value: function <T>(fn: Comparator<number> = (a, b) => a - b): T | undefined {
    let min = undefined;
    for (let element of this) {
      if (min == undefined) min = element;
      if (fn(element, min) < 0) min = element;
    }
    return min;
  },
});

Object.defineProperty(Array.prototype, "maxBy", {
  value: function <T>(prop: keyof T): T | undefined {
    let max = undefined;
    for (let element of this) {
      if (max == undefined) max = element;
      if (element[prop] - max[prop] > 0) max = element;
    }
    return max;
  },
});

Object.defineProperty(Array.prototype, "minBy", {
  value: function <T>(prop: keyof T): T | undefined {
    let min = undefined;
    for (let element of this) {
      if (min == undefined) min = element;
      if (element[prop] - min[prop] < 0) min = element;
    }
    return min;
  },
});

Object.defineProperty(Array.prototype, "equals", {
  value: function (otherArray: unknown[]): boolean {
    if (this.length !== otherArray.length) return false;
    for (let i = 0; i < this.length; ++i) {
      if (this[i] !== otherArray[i]) return false;
    }
    return true;
  },
});

Object.defineProperty(String.prototype, "capitalized", {
  value: function (): string {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
});

Object.defineProperty(String.prototype, "isNumber", {
  value: function (): boolean {
    return /^\d+$/.test(this);
  },
});

Object.defineProperty(String.prototype, "toNumber", {
  value: function (): number {
    return Number(this);
  },
});

Object.defineProperty(Map.prototype, "keysArray", {
  value: function <K>(): K[] {
    return Array.from(this.keys());
  },
});

Object.defineProperty(Map.prototype, "valuesArray", {
  value: function <V>(): V[] {
    return Array.from(this.values());
  },
});

function jsonReplacer(_key: string, value: object | Function): object | string {
  if (typeof value === "function") {
    return value.name;
  }
  return value;
}

export function toPrettyJson(obj: object): string {
  return JSON.stringify(obj, jsonReplacer, 2);
}
