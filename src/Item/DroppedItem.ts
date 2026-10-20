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

import Sprite from "@/Sprite/Sprite.js";
import { generateID, type Point } from "@/utilities/utilities.js";
import { TILE_SIZE } from "@/global/consts.js";
import { notifier, Notification } from "@/global/notifier.js";
import { addTraits, centerPointTrait } from "@/traits.js";
import type Item from "./Item.js";

class DroppedItem {
  private item: Item;
  private sprite: Sprite;
  private loadedFocusedSprite: boolean;
  private focusedSprite: Sprite;
  focus: boolean;
  readonly pos: Point;
  readonly id: number;

  constructor(item: Item) {
    this.item = item;
    this.sprite = new Sprite("decoration-big-bag-3x");
    this.loadedFocusedSprite = false;
    this.focusedSprite = new Sprite("decoration-big-bag-3x", {
      outline: true,
      callback: () => (this.loadedFocusedSprite = true),
    });
    this.focus = false;
    this.pos = { x: 0, y: 0 };
    this.id = generateID(DroppedItem);
    addTraits(this, centerPointTrait());
  }

  draw(cameraX: number, cameraY: number): void {
    if (this.focus && this.loadedFocusedSprite) {
      this.focusedSprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
      return;
    }
    this.sprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
  }

  interact(who) {
    if (who.equipment.put(this.item)) {
      who.game.currentTown.droppedItems = who.game.currentTown.droppedItems.filter(
        (i) => i.id !== this.id,
      );
    }
    notifier.send(new Notification(`Picked up ${this.item.name}`, this.item.spriteName));
  }

  setPositionTo(pos: Point): void {
    this.pos.x = pos.x - TILE_SIZE / 2;
    this.pos.y = pos.y - TILE_SIZE / 2;
  }
}

export default DroppedItem;
