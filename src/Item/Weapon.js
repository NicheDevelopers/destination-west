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
  constructor(weaponType, damage, critChance, critMultiplier, durabilityLossPerUse) {
    super(itemName,
	  spriteName,
	  sprite,
	  durability,
	  id,
	  height,
	  width,
	  price,
	  priceRetention);
    this.type = weaponType;
    this.damage = damage;
    this.critChance = critChance;
    this.critMultiplier = critMultiplier;
    this.durabilityLossPerUse = durabilityLossPerUse;
  }
  reduceDurability(times) {
    this.durability -= this.durabilityLossPerUse * times
  }
}

export default Weapon;
