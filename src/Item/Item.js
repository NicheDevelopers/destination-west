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

class Item {
  constructor(itemName, spriteName, durability, id, height, width, price, priceRetention) {
    this.name = itemName;
    this.spriteName = spriteName;
    this.sprite = new Sprite(spriteName);
    this.durability = durability;
    this.ID = id;
    this.height = height;
    this.width = width;
    this.price = price;
    this.priceRetention = priceRetention;
  }
  getResellPrice() {
    return this.price * this.priceRetention;
  }
}
export default Item;
