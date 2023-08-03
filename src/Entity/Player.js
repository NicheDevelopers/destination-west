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
	  {speed: pp.defaultPlayerSpeed, animated: true});
    addTraits(
      this,
      InventoryTrait(),
      HitboxTrait(this, pp.playerRcp, pp.playerBd));
    this.game = game;
    
    // register all actions that the player can do and bind
    // them to correct keys
    this.actions = ['Move Right', 'Move Left', 'Move Up', 'Move Down',
		    'Toggle Sprint', 'Toggle Sneak'];

    this.movingDirection = new Direction(directions.none);
    this.direction = new Direction(directions.right);

    this.hitbox.visualizeCollisions(
      (f) => this.game.camera.addDebugDraw(f, {once: true}));
    
    this.default_direction = new Direction(directions.none);
    this.sprintMode = pp.defaultSprintMode;
    this.sneakMode = pp.defaultSneakMode;
    this.sprinting = false;
    this.sneaking = false;
  }

  updateMovementMethod() {
    if (this.sprintMode === 'hold') {
      this.sprinting = false;
    }
    if (this.sneakMode === 'hold') {
      this.sneaking = false;
    }
    this.game.app.manageRequest(
      'Toggle Sprint',
      () => this.toggleSprint(),
      { once: (this.sprintMode === 'toggle') ? true : false });

    this.game.app.manageRequest(
      'Toggle Sneak',
      () => this.toggleSneak(),
      { once: (this.sneakMode === 'toggle') ? true : false });

    if (this.sprinting && this.sneaking)
      this.sprinting = false, this.sneaking = false;
  }
  
  update() {
    this.movingDirection.set(directions.none);
    this.updateMovementMethod();

    let speedX = 0, speedY = 0;

    let baseSpeed = // the highest speed possible in this tick
      pp.defaultPlayerSpeed * ((this.sprinting) ? pp.defaultSprintMultiplier :
        (this.sneaking) ? pp.defaultSneakMultiplier : 1);

    this.game.app.manageRequest(
      'Interact',
      () => this.interact(),
      { once: true });
    
    if (this.game.app.isActionRequested('Move Right')) {
      this.movingDirection.moveRight();
      speedX += baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Left')) {
      this.movingDirection.moveLeft();
      speedX -= baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Up')) {
      this.movingDirection.moveUp()
      speedY -= baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Down')) {
      this.movingDirection.moveDown();
      speedY += baseSpeed;
    }

    if (this.movingDirection.facesLeft()) {
      this.sprite.mirrored = true;
    }
    if (this.movingDirection.facesRight()) {
      this.sprite.mirrored = false;
    }

    this.speedForDebug = baseSpeed;

    // Collisions
    if (this.movingDirection.facesUp() && this.willCollide(directions.up, baseSpeed)) {
      this.movingDirection.moveDown();
      speedX *= pp.defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.movingDirection.facesDown() && this.willCollide(directions.down, baseSpeed)) {
      this.movingDirection.moveUp();
      speedX *= pp.defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.movingDirection.facesLeft() && this.willCollide(directions.left, baseSpeed)) {
      this.movingDirection.moveRight();
      speedX = 0;
      speedY *= pp.defaultDiagonalOffset;
    }
    if (this.movingDirection.facesRight() && this.willCollide(directions.right, baseSpeed)) {
      this.movingDirection.moveLeft();
      speedX = 0;
      speedY *= pp.defaultDiagonalOffset;
    }

    if (this.movingDirection.isDiagonal()) {
      speedX *= pp.defaultDiagonalOffset;
      speedY *= pp.defaultDiagonalOffset;
    }

    this.moveX.speed = speedX;
    this.moveY.speed = speedY;

    this.moving = (speedX !== 0 || speedY !== 0);

    this.move();
    this.sprite.next();
    if (!this.movingDirection.is(directions.none))
      this.direction.set(this.movingDirection._value);
  }

  interact() {
    let focused = this.game.getFocusedItem();
    focused?.interact(this);
    this.game.updateFocus();
  }
  /** returns the change in player's position (that would be applied if no
      collisions were deteceted
  */
  getMovementChange(speed, direction=this.movingDirection) {
    return {
      x: Math.abs(this.moveX.getChangeInThisTick('x', speed))
	* direction.xAxisMultiplier(),
      y: Math.abs(this.moveY.getChangeInThisTick('y', speed))
	* direction.yAxisMultiplier()
    };
  }

  drawDebugInfo(cameraX, cameraY) {
    let {x, y} = this.getMovementChange(this.speedForDebug);
        
    this.hitbox.draw(cameraX, cameraY);
    this.hitbox.drawExpected(cameraX, cameraY, x, y);
  }
  
  willCollide(direction, speed) {
    /* xTile and yTile represent the coordinates of the tile that
       the player would start colliding with if he moved in its
       direction with defaultPlayerSpeed in this tick
    */
    let {x: moveX, y: moveY} = this.getMovementChange(speed, new Direction(direction));

    /*
      //Highlight player tile
    this.game.camera.addDebugDraw((cx, cy) => {
      this.game.currentTown.array[xTile][yTile]
	.drawDebugInfo(cx,cy,ctx, {color: "white"});
      }, {once: true});
    //  */

    /*
    if (xTile < 0 || xTile >= this.game.currentTown.width ||
      yTile < 1 || yTile >= this.game.currentTown.height) {
      return true;
      }
      */
    return this.hitbox.willCollideWithTiles(
      moveX, moveY,
      this.game.currentTown.array);
  }
  toggleSprint() {
    this.sprinting = !this.sprinting;
  }
  toggleSneak() {
    this.sneaking = !this.sneaking;
  }

  move() {
    this.moveX.next();
    this.moveY.next();

    if (this.moving) {
      if (this.sprite.animation.name !== "run")
        this.sprite.changeAnimation("run");
      return;
    }
    if (this.sprite.animation.name !== "idle")
      this.sprite.changeAnimation("idle");
  }
}

export default Player;
