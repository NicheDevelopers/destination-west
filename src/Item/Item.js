/*
  file: src/Item.js
  purpose: Define the Item class
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

import Sprite from "../Sprite/Sprite.js";
import { generateID } from "../global/utilities.js";

class Item {
  constructor(item, spriteName, durability, weight, price, priceRetention, isStackable) {
    if (item instanceof Item){
      this.name = item.name;
      this.spriteName = item.spriteName;
      this.sprite = new Sprite(item.spriteName, {crop: true, nocache: true});
      this.durability = item.durability;
      this.id = generateID(Item);
      this.weight = item.weight;
      this.price = item.price;
      this.priceRetention = item.priceRetention;
      this.isStackable = item.isStackable;
      return;
    }
    this.name = item;
    this.spriteName = spriteName;
    this.sprite = new Sprite(spriteName, {crop: true, nocache: true});
    this.durability = durability;
    this.id = generateID(Item);
    this.weight = weight;
    this.price = price;
    this.priceRetention = priceRetention;
    this.isStackable = isStackable;
  }
  getResellPrice() {
    return this.price * this.priceRetention;
  }
}
export default Item;
