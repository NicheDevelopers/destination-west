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

export function createDiv(w, h, classes = [], styles = {}, id) {
  let r = document.createElement('div');
  classes.forEach((styleClass) => r.classList.add(styleClass));
  r.setAttribute('style', `width: ${w}px; height: ${h}px`);
  for (const styleName in styles) {
    r.style[styleName] = styles[styleName];
  }
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
