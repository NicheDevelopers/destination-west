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
import type { RecipeWeapon } from "../global/items.js";
import Item from "./Item.js";

class Weapon extends Item {
  declare recipe: RecipeWeapon;
  weaponType: string;
  damage: number;
  critChance: number;
  critMultiplier: number;
  durabilityLossPerUse: number;

  constructor(recipe: RecipeWeapon) {
    super(recipe);
    this.weaponType = recipe.weaponType;
    this.damage = recipe.damage;
    this.critChance = recipe.critChance;
    this.critMultiplier = recipe.critMultiplier;
    this.durabilityLossPerUse = recipe.durabilityLossPerUse;
  }

  static validateSpecialFields(recipe: RecipeWeapon): void {
    const props: (keyof RecipeWeapon)[] = [
      "weaponType",
      "damage",
      "critChance",
      "critMultiplier",
      "durabilityLossPerUse",
    ];
    const throwValidationError: (prop: keyof RecipeWeapon) => void = (prop) => {
      throw new Error(
        `Weapon recipe must have a '${prop}' property.\n` +
          `Recipe received: ${JSON.stringify(recipe)}`,
      );
    };
    for (const prop of props) {
      if (!recipe[prop]) throwValidationError(prop);
    }
  }

  reduceDurability(times: number): void {
    if (this.durabilityLossPerUse * times > this.durability) {
      // TODO: Handle weapon breakage (e.g., remove from inventory, notify player, make weapon unusable)
      throw new Error(
        `Weapon ${this.name} durability cannot be reduced by ${this.durabilityLossPerUse * times} ` +
          `because it only has ${this.durability} durability left.`,
      );
    }
    this.durability -= this.durabilityLossPerUse * times;
  }

  /**
   * Method for deep copy of Item object. Generates new Sprite.
   * @returns {Weapon} deep copy Item
   */
  deepCopy(): Weapon {
    const copy = new Weapon(this.recipe);
    copy.durability = this.durability;
    return copy;
  }
}

export default Weapon;
