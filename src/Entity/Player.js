/*
  file: src/Player.js
  purpose: Define the Player class for managing the player-controlled
           character
  authors: Kamil Małecki <https://gitlab.com/gaussx>
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

import Entity from "./Entity.js";

import { tileSize, playerParameters as pp } from "../global/consts.js";

import { addTraits, HitboxTrait, InventoryTrait } from "../traits.js";
import { Direction, directions } from "../global/utilities.js";

import { ctx } from "../core/Browser.js";

/**
   Class for managing the player-controlled character
*/
class Player extends Entity {
  constructor(game, x = 0, y = 0) {
    super(game, "player", x, y,
	  {movement: { playerControlled: true,
		       speed: pp.defaultPlayerSpeed },
	   animated: true,
	   hitbox: game.currentTown.array,
	   relativeCenterPoint: pp.playerRcp,
	   boundingDistance: pp.playerBd});
    
    addTraits(
      this,
      InventoryTrait());
    this.game = game;
    
    // register all actions that the player can do and bind
    // them to correct keys
    this.actions = ['Move Right', 'Move Left', 'Move Up', 'Move Down',
		    'Toggle Sprint', 'Toggle Sneak'];

    this.hitbox.visualizeCollisions(
      (f) => this.game.camera.addDebugDraw(f, {once: true}));
  }

  update() {
    this.game.app.manageRequest(
      'Interact',
      () => this.interact(),
      { once: true });

    this.movement.update();
    
    this.sprite.next();
  }
  
  isFacingRight() {
    return this.sprite.mirrored;
  }
  
  interact() {
    let focused = this.game.getFocusedItem();
    focused?.interact(this);
    this.game.updateFocus();
  }
  
  drawDebugInfo(cameraX, cameraY) {
    let x = this.movement.getChangeX();
    let y = this.movement.getChangeY();
        
    this.hitbox.draw(cameraX, cameraY);
    this.hitbox.drawExpected(cameraX, cameraY, x, y);

    // Highlight tiles that player is present on
    this.game.camera.addDebugDraw((cx, cy) => {
      for (const tile of this.game.currentTown.array.flat()) {
	if (tile.hasEntityOfType(Player)) {
	  tile.drawDebugInfo(cx, cy, ctx, {color: "#00ffff33"});
	}
      }
    }, {once: true});
  }

}

export default Player;
