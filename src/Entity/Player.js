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

/**
   Class for managing the player-controlled character
*/
class Player extends Entity {
  constructor(game, x = 0, y = 0) {
    super("player", x, y,
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

    this.movingDirection = new Direction(directions.none);
    this.direction = new Direction(directions.right);

    this.hitbox.visualizeCollisions(
      (f) => this.game.camera.addDebugDraw(f, {once: true}));
  }
  
  update() {
    this.game.app.manageRequest(
      'Interact',
      () => this.interact(),
      { once: true });

    this.movement.update();
    this.speedForDebug = this.movement.getCurrentMoveSpeed();

    this.sprite.next();
    
    if (!this.movement.direction.is(directions.none))
      this.direction.set(this.movingDirection._value);
  }

  interact() {
    let focused = this.game.getFocusedItem();
    focused?.interact(this);
    this.game.updateFocus();
  }
  
  drawDebugInfo(cameraX, cameraY) {
    let {x, y} = this.movement.getChange(this.speedForDebug);
        
    this.hitbox.draw(cameraX, cameraY);
    this.hitbox.drawExpected(cameraX, cameraY, x, y);
  }
  
  willCollide(direction, speed) {
    let {x: moveX, y: moveY} =
      this.movement.getChange(speed, new Direction(direction));

    /*
      //Highlight player tile
    this.game.camera.addDebugDraw((cx, cy) => {
      this.game.currentTown.array[xTile][yTile]
	.drawDebugInfo(cx,cy,ctx, {color: "white"});
      }, {once: true});
    //  */
    return this.hitbox.willCollideWithTiles(
      moveX, moveY,
      this.game.currentTown.array);
  }
}

export default Player;
