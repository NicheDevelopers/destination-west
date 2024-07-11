
/*
  file: src/Weapon.js
  purpose: Define the Weapon class
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

class Weapon extends Item {
  constructor(recipe) {
    super(recipe);
    this.type = recipe.type;
    this.damage = recipe.damage;
    this.critChance = recipe.critChance;
    this.critMultiplier = recipe.critMultiplier;
    this.durabilityLossPerUse = recipe.durabilityLossPerUse;
  }

  static validateSpecialFields(recipe) {
    const props = ['type', 'damage', 'critChance', 'critMultiplier', 'durabilityLossPerUse'];
    const throwValidationError = (prop) => {
      throw new Error(
        `Weapon recipe must have a '${prop}' property.\n` +
        `Recipe received: ${JSON.stringify(recipe)}`
      );
    }
    for (const prop of props) {
      if (!recipe[prop])
        throwValidationError(prop);
    }
  }

  reduceDurability(times) {
    this.durability -= this.durabilityLossPerUse * times
  }
}

export default Weapon;
