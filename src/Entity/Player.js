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

// import Transfer from "../Transfer.js";
// import Equipment from "../Equipment.js";
import {ContainerTrait} from "../ContainerTrait.js";


//class for managing the player-controlled character
class Player extends Entity {
  constructor(game, x = 0, y = 0) {
    super(game, "player", x, y, defaultPlayerSpeed);
    //register all actions that the player can do and bind them to correct keys
    this.actions = ['Move Right', 'Move Left', 'Move Up', 'Move Down', 'Toggle Sprint', 'Toggle Sneak'];

    // Cooridinates of the sprite's center point
    this.spriteCenterPoint = { x: 48, y: 60 };
    // Coordinates for calculating collisions
    this.rootPoint = { x: 48, y: 70 };

    //an object which contains info on how many pixels from the center point you want to detect collisions
    this.boundingDistance = {
      up: -1,
      left: -5,
      right: 5,
      down: 1
    }
    //an object containing appropriate center point deviation so that the player's model doesn't go out of bounds.
    this.centerPoint = {
      x: this.x + this.rootPoint.x,
      y: this.y + this.rootPoint.y
    };

    //array of information on which pixels should be checked for colliding objects
    this.boundaries = [
      [this.boundingDistance.left, this.boundingDistance.up],
      [0, this.boundingDistance.up],
      [this.boundingDistance.right, this.boundingDistance.up],
      [this.boundingDistance.left, 0],
      [0, 0],
      [this.boundingDistance.right, 0],
      [this.boundingDistance.left, this.boundingDistance.down],
      [0, this.boundingDistance.down],
      [this.boundingDistance.right, this.boundingDistance.down]];

    this.default_direction = 4; //the default direction being staying idle, on index 4 in the state array
    this.sprintMode = defaultSprintMode;
    this.sneakMode = defaultSneakMode;
    this.townLength = this.game.currentTown.array.length;
    this.townWidth = this.game.currentTown.array[0].length;
    this.sprinting = false;
    this.sneaking = false;
    //this.transfer = new Transfer(this.equipment, new Equipment(0));
    return Object.assign(this, ContainerTrait());
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
    this.direction = this.default_direction;
    this.updateMovementMethod();

    this.centerPoint.x = this.x + this.rootPoint.x;
    this.centerPoint.y = this.y + this.rootPoint.y;

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
      this.direction += 1;
      speedX += baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Left')) {
      this.direction -= 1;
      speedX -= baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Up')) {
      this.direction -= 3;
      speedY -= baseSpeed;
    }
    if (this.game.app.isActionRequested('Move Down')) {
      this.direction += 3;
      speedY += baseSpeed;
    }

    if (this.direction % 3 === 0) {
      this.sprite.mirrored = true;
    }
    if (this.direction % 3 === 2) {
      this.sprite.mirrored = false;
    }

    this.speedForDebug = baseSpeed;

    // Collisions
    if (this.direction < 3 && this.willCollide(1, baseSpeed)) {
      this.direction += 3;
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.direction > 5 && this.willCollide(7, baseSpeed)) {
      this.direction -= 3;
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.direction % 3 === 0 && this.willCollide(3, baseSpeed)) {
      this.direction += 1;
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }
    if (this.direction % 3 === 2 && this.willCollide(5, baseSpeed)) {
      this.direction -= 1;
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }

    if (this.direction % 2 == 0 && this.direction !== 4) {
      speedX *= defaultDiagonalOffset;
      speedY *= defaultDiagonalOffset;
    }

    this.moveX.speed = speedX;
    this.moveY.speed = speedY;

    this.moving = (speedX !== 0 || speedY !== 0);

    this.move();
    if (!this.game.currentTown.array[~~(this.centerPoint.x / tileSize)][~~(this.centerPoint.y / tileSize)].walkable) {
      console.log(`STUTTER on direction: ${this.direction}`);
    }
    this.sprite.next();
  }

  interact() {
    let focused = this.game.getFocusedItem();
    focused?.interact(this);
    this.game.updateFocus();
  }
  
  drawDebugInfo() {
    let moveX = Math.abs(this.moveX.getChangeInThisTick('x', this.speedForDebug));
    let moveY = Math.abs(this.moveY.getChangeInThisTick('y', this.speedForDebug));
    //console.log(moveX, moveY);
    ctx.fillStyle = 'black';
    let cp = this.centerPoint;
    ctx.fillRect(cp.x, cp.y, 1, 1);
    this.boundaries.forEach((boundary, ix) => {
      let mX = moveX * ((ix % 3 === 0) ? -1 : (ix % 3 === 2) ? 1 : 0);
      let mY = moveY * ((ix < 3) ? -1 : (ix > 5) ? 1 : 0);
      ctx.fillRect(cp.x + boundary[0] + mX,
        cp.y + boundary[1] + mY, 1, 1);
    });

  }
  willCollide(direction, speed) {
    /* xTile and yTile represent the coordinates of the tile that
       the player would start colliding with if he moved in its
       direction with defaultPlayerSpeed in this tick
    */
    let moveX = Math.abs(this.moveX.getChangeInThisTick('x', speed));
    let moveY = Math.abs(this.moveY.getChangeInThisTick('y', speed));

    let xTile =
      ~~((this.centerPoint.x + this.boundaries[direction][0] + tileSize
        + moveX * ((direction % 3 === 0) ? -1 : (direction % 3 === 2) ? 1 : 0)) / tileSize) - 1;
    let yTile = ~~((this.centerPoint.y + this.boundaries[direction][1] + tileSize
      + moveY * ((direction < 3) ? -1 : (direction > 5) ? 1 : 0)) / tileSize) - 1;

    if (xTile < 0 || xTile >= this.game.currentTown.width ||
      yTile < 1 || yTile >= this.game.currentTown.height)
      return 1;
    if ((this.game.currentTown.array[xTile][yTile].walkable)) {
      return 0;
    }
    return 1;
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
