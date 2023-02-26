/*
  file: src/DroppedItem.js
  purpose: Define the DroppedItem class to represent objects on the ground
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

import Sprite from "../Sprite/Sprite.js"

class DroppedItem {
  constructor(item, x, y) {
    this.item = item,
    this.sprite = new Sprite("decoration-big-bag-3x");
    this.x = x;
    this.y = y;
  }
  draw(cameraX, cameraY) {
    this.sprite.draw(this.x - cameraX, this.y - cameraY);
  }
}

export default DroppedItem;
