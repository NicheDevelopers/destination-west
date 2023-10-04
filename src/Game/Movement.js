/*
  file: src/Movement.js
  purpose: define the Movement class; provide a simple interface
           for entity movement management
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
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
import { ctx } from "../Core/Browser.js";
import { tileSize, playerParameters as pp } from "../global/consts.js";
import { validateOptions } from "../global/utilities.js";
import { directions, Direction } from "../global/utilities.js";
import Animation from "../Core/Animation.js";

const movementActions = new Map([
  ['Move Up', "moveUp"],
  ['Move Down', "moveDown"],
  ['Move Left', "moveLeft"],
  ['Move Right', "moveRight"]
]);

const movementOptions = new Map([
  ["playerControlled",
   "Boolean. Specifies whether the Movement is supposed to " +
   "take movement action requests into account"]
]);
  
export default class Movement {
  constructor(entity,
	      speed=pp.defaultPlayerSpeed,
	      sprintMultiplier=pp.defaultSprintMultiplier,
	      sneakMultiplier=pp.defaultSneakMultiplier, options={}) {
    validateOptions(options, movementOptions, "Movement");
    this.entity = entity;
    this.speed = speed;
    this.animationX = new Animation(this.entity, "x", this.speed);
    this.animationY = new Animation(this.entity, "y", this.speed);
    this.sprintMultiplier = sprintMultiplier;
    this.sneakMultiplier = sneakMultiplier;
    this.direction = new Direction();
    this.currentSpeed = {x: 0, y: 0};
    this.sprintMode = pp.defaultSprintMode; // 'hold' or 'toggle'
    this.sneakMode = pp.defaultSneakMode; // 'hold' or 'toggle'
    this.sprinting = false;
    this.sneaking = false;
    this.playerControlled = options.playerControlled;
  }
  /**
    Update the position of the entity with respect to
    action requests registered in the app (if provided)
  */
  update() {
    this.currentSpeed.x = 0;
    this.currentSpeed.y = 0;
    this.direction.set(directions.none);
    
    if (this.playerControlled) {
      this.updateMovementMode();
      this.updateMovementSpeedAndDirection();
    }

    if (this.direction.facesLeft()) {
      this.entity.sprite.mirrored = true;
    }
    else if (this.direction.facesRight()) {
      this.entity.sprite.mirrored = false;
    }

    let speed = this.getCurrentMoveSpeed();
    
    // Collisions
    if (this.currentSpeed.y && this.direction.facesUp()
      && this.entity.willCollide?.(directions.up, speed)) {
      this.direction.moveDown();
      this.currentSpeed.x *= pp.defaultDiagonalOffset;
      this.currentSpeed.y = 0;
    }
    else if (this.currentSpeed.y && this.direction.facesDown()
      && this.entity.willCollide?.(directions.down, speed)) {
      this.direction.moveUp();
      this.currentSpeed.x *= pp.defaultDiagonalOffset;
      this.currentSpeed.y = 0;
    }
    
    if (this.currentSpeed.x && this.direction.facesLeft()
      && this.entity.willCollide?.(directions.left, speed)) {
      this.direction.moveRight();
      this.currentSpeed.x = 0;
      this.currentSpeed.y *= pp.defaultDiagonalOffset;
    }
    else if (this.currentSpeed.x && this.direction.facesRight()
      && this.entity.willCollide?.(directions.right, speed)) {
      this.direction.moveLeft();
      this.currentSpeed.x = 0;
      this.currentSpeed.y *= pp.defaultDiagonalOffset;
    }

    if (this.direction.isDiagonal()) {
      this.currentSpeed.x *= pp.defaultDiagonalOffset;
      this.currentSpeed.y *= pp.defaultDiagonalOffset;
    }

    this.animationX.speed = this.currentSpeed.x;
    this.animationY.speed = this.currentSpeed.y;

    this.move();

    if (this.isMoving()) {
      if (this.entity.sprite.animation.name !== "run")
        this.entity.sprite.changeAnimation("run");
      return;
    }
    if (this.entity.sprite.animation.name !== "idle")
      this.entity.sprite.changeAnimation("idle");
  }
  move() {
    this.animationX.next();
    this.animationY.next();
  }
  /**
     Calculates the change in entity's position
     (that would be applied if no collisions were deteceted)
  */
  getChange(speed, direction=this.direction) {
    return {
      x: Math.abs(this.animationX.getChangeInThisTick('x', speed))
	* direction.xAxisMultiplier(),
      y: Math.abs(this.animationY.getChangeInThisTick('y', speed))
	* direction.yAxisMultiplier()
    };
  }
  isMoving() {
    return (this.currentSpeed.x !== 0 || this.currentSpeed.y !== 0);
  }
  getCurrentMoveSpeed() {
    return this.speed *
      (this.sprinting? this.sprintMultiplier : 1) *
      (this.sneaking? this.sneakMultiplier : 1);
  }
  updateMovementMode() {
    let app = this.entity.game.app;
    if (this.sprintMode === 'hold') {
      this.sprinting = false;
    }
    if (this.sneakMode === 'hold') {
      this.sneaking = false;
    }
    app.manageRequest(
      'Toggle Sprint',
      () => this.toggleSprint(),
      { once: (this.sprintMode === 'toggle') });

    app.manageRequest(
      'Toggle Sneak',
      () => this.toggleSneak(),
      { once: (this.sneakMode === 'toggle') });

    if (this.sprinting && this.sneaking) {
      this.sprinting = false;
      this.sneaking = false;
    }
  }
  updateMovementSpeedAndDirection() {
    movementActions.forEach((fn, action) => {
      if (this.entity.game.app.isActionRequested(action)) {
	this[fn]();
      }
    });
  }
  moveLeft() {
    this.direction.moveLeft();
    this.currentSpeed.x -= this.getCurrentMoveSpeed();
  }
  moveRight() {
    this.direction.moveRight();
    this.currentSpeed.x += this.getCurrentMoveSpeed();
  }
  moveUp() {
    this.direction.moveUp();
    this.currentSpeed.y -= this.getCurrentMoveSpeed();
  }
  moveDown() {
    this.direction.moveDown();
    this.currentSpeed.y += this.getCurrentMoveSpeed();
  }
  toggleSprint() {
    this.sprinting = !this.sprinting;
  }
  toggleSneak() {
    this.sneaking = !this.sneaking;
  }
}
