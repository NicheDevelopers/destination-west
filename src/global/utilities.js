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

import {tileSize} from "./consts.js";
import seed from "./seed.js";

/**
 * Return a random float.
 # Two arguments provided: Return a float from range <`min`, `max`)
 @param {number} min - returned float lower limit, inclusive
 @param {number} max - returned float upper limit, exclusive
 # One argument provided: Return a float from range <0, `max`)
 @param {number} max - returned float upper limit, exclusive
 # No arguments provided: Return a float from range <0, 1)
 */
export function randFloatInRange(min, max) {
  if (min === undefined) {
    return Math.random();
  }
  if (max === undefined) {
    max = min
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

/**
 * Return a random integer.
 # Two arguments provided: Return an integer from range <`min`, `max`)
 @param {number} min - returned integer lower limit, inclusive
 @param {number} max - returned integer upper limit, exclusive
 # One argument provided: Return an integer from range <0, `max`)
 @param {number} max - returned integer upper limit, exclusive
 # No arguments provided: Return 0 or 1
 */
export function randIntInRange(min, max) {
  if (min === undefined) {
    return Math.round(Math.random());
  }
  if (max === undefined) {
    max = min
    min = 0;
  }
  return (Math.random() * (max - min) + min) | 0;
}

/**
 * Return a random integer based on the global seed
 # Two arguments provided: Return an integer from range <`min`, `max`)
 @param {number} min - returned integer lower limit, inclusive
 @param {number} max - returned integer upper limit, exclusive
 # One argument provided: Return an integer from range <0, `max`)
 @param {number} max - returned integer upper limit, exclusive
 # No arguments provided: Return 0 or 1
 */
export function srandIntInRange(min, max) {
  if (min === undefined) {
    return Math.round(seed.random());
  }
  if (max === undefined) {
    max = min
    min = 0;
  }
  return (seed.random() * (max - min) + min) | 0;
}

/**
 * A map storing the highest recorded ID for each objectName
 */
const ids = new Map();

/**
 * Generate unique IDs for in-game objects
 */
export function generateID(objectName) {
  ids.set(objectName, ids.get(objectName) + 1 || 0);
  return ids.get(objectName);
}
export function resetIdFor(objectName) {
  ids.delete(objectName);
}

/**
   Create a specified HTML element with specified
   attributes and return it.
   
   Unrecognized element attributes are treated
   as style attributes.
   The function throws if a provided attribute is not
   a valid element attribute, not a valid style attribute
   and not a valid special attribute from the list below.

   Optional special attributes:
   (name: type [defaultValue] - description)
   
   what: String ["div"]
     - tag name of the element to create
   
   appendTo: Node
     - a node to which the new element should be appended
     to. if none provided, the element is not appended
     to anything
 */
export function htmlCreate(args={}) {
  let what = args.what;
  delete args.what;
  
  if (what === undefined)
    what = "div";
  let d = document.createElement(what);
  
  if (args.appendTo) {
    args.appendTo.appendChild(d);
    delete args.appendTo;
  }
  for (const property in args) {
    if (d[property] === undefined) {
      if (d.style[property] === undefined) {
	throw `Unrecognized '${what}' property: ${property}`;
      }
      d.style[property] = args[property];
      continue;
    }
    d[property] = args[property];
  }
  return d;
}

/**
 * Create HTML elements
 * @param {string} element name of element
 * @param {number} [w = null] - width 
 * @param {number} [h = null] - height 
 * @param {string[]} [classes = []] - array of css classes
 * @param {*} styles
 * @param {*} id 
 * @param {string} [text = null] - inner text of element 
 * @returns {Element} created element
 */
export function createElement(element, w = null, h = null, classes = [], styles = {}, id, text = null){
  // needed test if element is equal to some given possibile outcomes
  let r = document.createElement(element);
  classes.forEach((styleClass) => r.classList.add(styleClass));
  if (w != null && h != null)
    r.setAttribute('style', `width: ${w}px; height: ${h}px`);
  for (const styleName in styles) {
    r.style[styleName] = styles[styleName];
  }
  r.innerText = text;
  if (id === undefined) return r;
  r.setAttribute('id', `${id}`);
  return r;
}

export function createCanvas(w, h) {
  let r = document.createElement('canvas');
  r.width = w;
  r.height = h ?? w;
  return { canvas: r, context: r.getContext('2d') };
}

export function distance({x: x1, y: y1}, {x: x2, y: y2}) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

export function directedDistance({x: x1, y: y1, direction: dir1},
			  {x: x2, y: y2, direction: dir2}) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

export function roundToTile(value) {
  return Math.floor(value/tileSize);
}

/**
   Return an {x, y} object which represents
   the coordinates of a tile that contains
   the point given as the arguemnt.
*/
export function pointToTileCoord({x, y}) {
  return {
    x: roundToTile(x),
    y: roundToTile(y)
  };
}

/**
   Return a tile at given tile coordinates
   from a given tile array
*/
export function tileAt(array, t) {
  return array[t.x][t.y];
}

export function comparePositions({x: x1, y: y1}, {x: x2, y: y2}) {
  return x1===x2 && y1===y2;
}

export function compareDirectedPositions({x: x1, y: y1, direction: dir1},
				  {x: x2, y: y2, direction: dir2}) {
  return x1 === x2 && y1 === y2 && dir1 === dir2;
}

export function validateOptions(givenOptions, allowedOptions,
				name = "") {
  Object.keys(givenOptions).forEach(option => {
    if (!allowedOptions.has(option))
      throw `Unrecognized ${name} construction option: ${option}`
  });
}

export function forbidProperty(obj, prop) {
  Object.defineProperty(obj, prop, {
    configurable: true,
    get: function() {
      throw `attempt to read ${prop} property which ` +
	`is forbidden for ${obj.constructor.name}`;
    }
  });
}

export function allowProperty(obj, prop) {
  // remove property with an error-provoking getter
  delete obj[prop];
}

export function makeEven(x) {
  if (x % 2 == 1)
    x++;
  return x;
}

export function hex_to_rgb(colorHex){
  let rgb = [0, 0, 0];
  for(let i = 0; i < 3; i++){
    rgb[i] = parseInt(colorHex.slice(2*i + 1, 2*i + 3), 16)
  }
  return rgb;
}

export function rgb_to_hex(colorRgb){
  let hex = "#";
  for(const element of colorRgb){
    let intElement = element
    if(Object.getPrototypeOf("") === Object.getPrototypeOf(element))
      intElement = parseInt(element, 10);
    if(intElement < 15)
      hex += "0";
    hex += intElement.toString(16);
  }
  return hex.toUpperCase();
}

/**
   A class similar to the built-in Set object,
   created for storing objects and comparing
   them based on properties instead of references.
*/
export class ObjectSet {
  constructor(initialObjectsArray) {
    this.elements = [];
    if (initialObjectsArray === undefined) return;
    for (const obj of initialObjectsArray) {
      this.add(obj);
    }
  }
  /**
     Adds the provided objects to the set. Objects equal
     (according to the areObjectsEqual function) to any
     already present in the ObjectSet, are not added.
  */
  add(...objs) {
    for (const obj of objs) {
      if (!this.has(obj))
	this.elements.push(obj);
    }
  }
  /**
     Deletes an object from the ObjectSet, comparing
     the argument with stored objects according to
     the areObjectsEqual function.
     Returns true if an object was deleted and false
     if no matching objects were found.
  */
  delete(obj) {
    let index = 0;
    for (const e of this.elements) {
      if (this.areObjectsEqual(obj, e)) {
	this.elements.splice(index, 1);
	return true;
      }
      index++;
    }
    return false;
  }
  /**
     Returns true if the ObjectSet contains an equal
     (according to the areObjectsEqual function) object
     to the one provided as the argument
  */
  has(obj) {
    for (const e of this.elements) {
      if (this.areObjectsEqual(obj, e))
	return true;
    }
    return false;
  }
  /**
     areObjectEqual uses a property comparison which
     strictly compares values of own properties and always
     returns false if one of the objects has an own property
     which the other does not.
  */
  areObjectsEqual(obj1, obj2) {
    if (typeof obj1 !== "object"
      || typeof obj2 !== "object")
      return false;
    for (const prop of Object.getOwnPropertyNames(obj1)) {
      if (obj1[prop] !== obj2[prop])
	return false;
    }
    for (const prop of Object.getOwnPropertyNames(obj2)) {
      if (!Object.hasOwn(obj1, prop))
	return false;
    }
    return true;
  }
  /**
     Returns an array of the objects stored in the ObjectSet
  */
  entries() {
    return this.elements;
  }
  /**
     Removes all objects stored in the ObjectSet
  */
  clear() {
    this.elements.length = 0;
  }
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
export function numberPad(value, numLength=-1, decLength=2) {
  let str = String(value);
  let point = str.indexOf(".");
  if (point === -1) {
    if (decLength > 0) {
      str += "." + "0".repeat(decLength);
      point = str.indexOf(".");
    }
  }
  if (point < numLength) {
    str = "0".repeat(numLength-point) + str;
  }
  if (decLength < 0) return;
  let decimals = str.length-point-1;
  if (decimals < decLength) {
    str += "0".repeat(decLength-decimals);
  }
  else if (decimals > decLength) {
    str = str.substring(0, str.length-(decimals-decLength));
  }
  return str;
}

Object.defineProperty(Array.prototype, "none", {
  value: function (fn) {return !this.some(fn)},
});

Object.defineProperty(Array.prototype, "lastIndex", {
  get: function () {return this.length-1;},
});

Object.defineProperty(Array.prototype, "first", {
  get: function () {return this[0]},
});

Object.defineProperty(Array.prototype, "last", {
  get: function () {return this[this.length - 1]},
});

Object.defineProperty(Array.prototype, "lastNthElement", {
  value: function (n){
    if (n < 0 || n > this.length - 1){
      throw `attempt to get lastNthElement (${n}) of array, when array's last index is ${this.length - 1}`;
    }
    return this[this.length - 1 - n];
  }
});

import { directions } from "./consts.js";
import Direction from "../game/Direction.js";
export {Direction, directions};

/**
 * Rolling possibility with given chance
 * @param {number} chance value between 0 and 1, chance of getting success
 * @returns {boolean} true if roll was successfull, otherwise false
 */
export function roll(chance){
  if (chance < 0 || chance > 1){
    throw `attempt to roll when chance of success (${chance}) was not between 0 and 1`;
  }
  if (randFloatInRange(0,1) < chance)
    return true;
  return false;
}

/**
 * Rolling possibility with given chance based on the global seed
 * @param {number} chance value between 0 and 1, chance of getting success
 * @returns {boolean} true if roll was successfull, otherwise false
 */
export function seedRoll(chance){
  if (chance < 0 || chance > 1){
    throw `attempt to roll when chance of success (${chance}) was not between 0 and 1`;
  }
  if (seed.random() < chance)
    return true;
  return false;
}

Object.defineProperty(Array.prototype, "popFirst", {
  value: function (value){
    for(let i = 0; i < this.length; ++i){
      if(this[i] === value){
        this.splice(i, 1);
        return;
      }
    }
  }
});

Object.defineProperty(Array.prototype, "clear", {
  value: function(){
    this.length = 0;
  }
});

Object.defineProperty(Array.prototype, "randomElement", {
  value: function () {return this[randIntInRange(0, this.length)]},
});

Object.defineProperty(Array.prototype, "srandomElement", {
  value: function () {return this[srandIntInRange(0, this.length)]},
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
  value: function ( fn = ((a,b)=>a-b)) {
    let max = undefined;
    for (let element of this){
      if (max == undefined) max = element;
      if (fn(element, max) > 0)
        max = element;
    }
    return max;
  },
});

Object.defineProperty(Array.prototype, "min", {
  value: function ( fn = ((a,b)=>a-b) ) {
    let min = undefined;
    for (let element of this){
      if (min == undefined) min = element;
      if (fn(element, min) < 0)
        min = element;
    }
    return min;
  },
});

Object.defineProperty(Array.prototype, "maxBy", {
  value: function (prop) {
    let max = undefined;
    for (let element of this){
      if (max == undefined) max = element;
      if (element[prop]-max[prop] > 0)
        max = element;
    }
    return max;
  },
});
  
Object.defineProperty(Array.prototype, "minBy", {
  value: function (prop) {
    let min = undefined;
    for (let element of this){
      if (min == undefined) min = element;
      if (element[prop]-min[prop] < 0)
        min = element;
    }
    return min;
  },
});

Object.defineProperty(Array.prototype, "equals", {
  value: function (otherArray) {
    if (this.length !== otherArray.length)
      return false;
    
    for (let i=0; i<this.length; ++i) {
      if (this[i] !== otherArray[i])
	return false;
    }
    return true;
  }
});

Object.defineProperty(String.prototype, "capitalized", {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
});

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};
