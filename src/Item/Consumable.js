/*
  file: src/Consumable.js
  purpose: Define the Consumable class
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
import Item from "./Item.js";
import { toPrettyJson as toJson } from "../global/utilities.js";

class Consumable extends Item {
  constructor(recipe) {
    super(recipe);

    /**
     * Effects of the consumable
     * @type {Array<Array<string, number>>}
     * @example [['health', 10], ['accuracy', 15]]
     */
    this.effects = recipe.effects;
  }

  static validateSpecialFields(recipe) {
    if (!recipe.effects)
      throw new Error(
        `Consumable recipe must have an 'effects' property.\n` +
        `Recipe received: ${toJson(recipe)}`
      );
    if (!Array.isArray(recipe.effects))
      throw new Error(
        `Consumable recipy must have an 'effects' property which ` +
        `is an array of objects.\n` +
        `Effects received: ${toJson(recipe.effects)}`
      );
    for (const effect of recipe.effects) {
      if (!Array.isArray(effect))
        throw new Error(
          `Each effect in the consumable recipe must be an array ` +
          `with two elements: a string and a number.\n` +
          `Effect received: ${toJson(effect)}`
        );
      if (effect.length !== 2)
        throw new Error(
          `Each effect in the consumable recipe must have exactly ` +
          `two elements: a string and a number.\n` +
          `Effect received: ${toJson(effect)}`
        );
      if (typeof effect[0] !== 'string' || typeof effect[1] !== 'number')
        throw new Error(
          `Each effect in the consumable recipe must have a string ` +
          `as the first element and a number as the second element.\n` +
          `Effect received: ${toJson(effect)}`
        );
      // TODO: validate effect names (when they are defined,
      // probably as a part of a combatant trait)
    }
  }
}

export default Consumable;
