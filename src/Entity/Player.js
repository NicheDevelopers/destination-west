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
import ctx from "../global/ctx.js";

import {tileSize,
	defaultPlayerSpeed,
        defaultSprintMode,
        defaultSneakMode,
        defaultDiagonalOffset,
        defaultSneakMultiplier,
        defaultSprintMultiplier } from "../global/consts.js";

import {addTraits, InventoryTrait} from "../traits.js";
import {Direction, directions} from "../global/utilities.js";
import Hitbox from "../Hitbox.js";

//class for managing the player-controlled character
class Player extends Entity {
  constructor(game, x = 0, y = 0) {
    super("player", x, y,
	  {speed: defaultPlayerSpeed, animated: true});
    addTraits(this, InventoryTrait());
    this.game = game;
    
    //register all actions that the player can do and bind them to correct keys
    this.actions = ['Move Right', 'Move Left', 'Move Up', 'Move Down', 'Toggle Sprint', 'Toggle Sneak'];

    // Cooridinates of the sprite's center point
    this.spriteCenterPoint = { x: 48, y: 60 };
    // Coordinates for calculating collisions
    this.relativeCenterPoint = { x: 48, y: 70 };
    
    this.movingDirection = new Direction(directions.none);
    this.direction = new Direction(directions.right);

    //an object which contains info on how many pixels from the center point you want to detect collisions
    this.boundingDistance = {
      up: 1,
      left: 5,
      right: 5,
      down: 1
    }
    this.hitbox = new Hitbox(this, this.boundingDistance);
    this.hitbox.visualizeCollisions(
      (f) => this.game.camera.addDebugDraw(f, {once: true}));
    
    //an object containing appropriate center point deviation so that the player's model doesn't go out of bounds.
    this.centerPoint = {
      x: this.x + this.relativeCenterPoint.x,
      y: this.y + this.relativeCenterPoint.y
    };

    //array of information on which pixels should be checked for colliding objects
    this.boundaries = [
      [-this.boundingDistance.left, -this.boundingDistance.up],
      [0, -this.boundingDistance.up],
      [this.boundingDistance.right, -this.boundingDistance.up],
      [-this.boundingDistance.left, 0],
      [0, 0],
      [this.boundingDistance.right, 0],
      [-this.boundingDistance.left, this.boundingDistance.down],
      [0, this.boundingDistance.down],
      [this.boundingDistance.right, this.boundingDistance.down]];

    this.default_direction = new Direction(directions.none); //the default direction being staying idle, on index 4 in the state array
    this.sprintMode = defaultSprintMode;
    this.sneakMode = defaultSneakMode;
    this.townLength = this.game.currentTown.array.length;
    this.townWidth = this.game.currentTown.array[0].length;
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

    this.centerPoint.x = this.x + this.relativeCenterPoint.x;
    this.centerPoint.y = this.y + this.relativeCenterPoint.y;

    //calculate the direction in which the player should move, according to this diagram:
    //       N
    //    0  1  2
    // W  3  4  5  E
    //    6  7  8
    //       S

    let speedX = 0, speedY = 0;

    let baseSpeed = // the highest speed possible in this tick
      defaultPlayerSpeed * ((this.sprinting) ? defaultSprintMultiplier :
        (this.sneaking) ? defaultSneakMultiplier : 1);

    this.game.app.manageRequest('Interact', () => this.interact(), { once: true });
    
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
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.movingDirection.facesDown() && this.willCollide(directions.down, baseSpeed)) {
      this.movingDirection.moveUp();
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.movingDirection.facesLeft() && this.willCollide(directions.left, baseSpeed)) {
      this.movingDirection.moveRight();
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }
    if (this.movingDirection.facesRight() && this.willCollide(directions.right, baseSpeed)) {
      this.movingDirection.moveLeft();
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }

    if (this.movingDirection.isDiagonal()) {
      speedX *= defaultDiagonalOffset;
      speedY *= defaultDiagonalOffset;
    }

    this.moveX.speed = speedX;
    this.moveY.speed = speedY;

    this.moving = (speedX !== 0 || speedY !== 0);

    this.move();
    if (!this.game.currentTown.array[~~(this.centerPoint.x / tileSize)][~~(this.centerPoint.y / tileSize)].walkable) {
      console.log(`STUTTER on direction: ${this.movingDirection.toString()}`);
    }
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

  getCenterPoint() {
    return {x: this.x + this.relativeCenterPoint.x,
	    y: this.y + this.relativeCenterPoint.y};
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
