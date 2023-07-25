/*
  file: src/Entity.js
  purpose: Define the Entity super class for creating entity classes
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Kamil Małecki <https://gitlab.com/gaussx>
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

import AnimatedSprite from "../Sprite/AnimatedSprite.js";
import Animation from "../Animation.js";
import Equipment from "../Equipment.js";
import {animationSpeed, defaultEquipmentSize} from "../global/consts.js";

/**
 * The super class for entity classes to derive from
 @abstract
 */
class Entity {
  constructor(game, typeName, x = 0, y = 0, speed = 100) {
    this.game = game;
    this.typeName = typeName;
    this.sprite = new AnimatedSprite(typeName, { animationSpeed: animationSpeed });
    this.equipment = new Equipment(defaultEquipmentSize);
    this.x = x;
    this.y = y;
    this.moveX = new Animation(this, "x", speed);
    this.moveY = new Animation(this, "y", speed);
  }
  
  draw(x, y) {
    if (this.focus && this.loadedFocusedSprite)
      this.focusedSprite.draw(x, y);
    else
      this.sprite.draw(x, y);
  }
  
  dropItem(record) {
    let droppedItem = this.equipment.dropFrom(record);
    droppedItem.setPositionTo(
      (this.centerPoint)? {x: this.centerPoint.x, y: this.centerPoint.y}
	: {x: this.x, y: this.y});
    this.game.currentTown.droppedItems.push(droppedItem);
    this.game.currentTown.updateFocus(this.game.player);
  }
  
}

export default Entity;
