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
import { tileSize, playerParameters as pp } from "../global/consts.js";
import { randIntInRange, roundToTile, validateOptions } from "../global/utilities.js";
import { Direction } from "../global/utilities.js";
import Animation from "../core/Animation.js";
import Pathfinder from "../Pathfinder.js";

const movementOptions = new Map([
  [
    "playerControlled",
    "Boolean. Specifies whether the Movement is supposed to " +
      "take movement action requests into account",
  ],
]);

/**
 * Represents the current state of the movement,
 * i.e. the current speed on the X and Y axes,
 * the movement direction and current modifiers
 * (sprinting or sneaking).
 */
class Momentum {
  constructor(baseMovementSpeed, sprintMultiplier, sneakMultiplier) {
    this.baseMovementSpeed = baseMovementSpeed;

    this.direction = new Direction();
    this.speed = { x: 0, y: 0 };

    this.sprintMode = pp.defaultSprintMode; // 'hold' or 'toggle'
    this.sneakMode = pp.defaultSneakMode; // 'hold' or 'toggle'
    this.sprintMultiplier = sprintMultiplier;
    this.sneakMultiplier = sneakMultiplier;

    this.sprinting = false;
    this.sneaking = false;

    this.nextMove = null;

    this.movementActions = new Map([
      ["Move Up", "moveUp"],
      ["Move Down", "moveDown"],
      ["Move Left", "moveLeft"],
      ["Move Right", "moveRight"],
    ]);
  }

  reset() {
    this.speed.x = 0;
    this.speed.y = 0;
    this.direction.reset();
  }

  /**
   * Returns base speed with current modifiers (sneak or sprint).
   */
  getCurrentMoveSpeed() {
    return (
      this.baseMovementSpeed *
      (this.sprinting ? this.sprintMultiplier : 1) *
      (this.sneaking ? this.sneakMultiplier : 1)
    );
  }

  /**
   * Update this.sprinting and this.sneaking properties.
   * Set the X and Y speeds and the direction
   * according to keyboard input registered in `keyman`.
   */
  manageInputs(keyman) {
    this.reset();

    if (this.sprintMode === "hold") {
      this.sprinting = false;
    }
    if (this.sneakMode === "hold") {
      this.sneaking = false;
    }
    keyman.manageInput("Toggle Sprint", () => this.toggleSprint(), {
      once: this.sprintMode === "toggle",
    });

    keyman.manageInput("Toggle Sneak", () => this.toggleSneak(), {
      once: this.sneakMode === "toggle",
    });

    if (this.sprinting && this.sneaking) {
      this.sprinting = false;
      this.sneaking = false;
    }

    this.movementActions.forEach((moveFn, action) => {
      if (keyman.isActionRequested(action)) {
        this[moveFn]();
      }
    });
  }

  setFromPathfinder(pathfinder, entity) {
    this.reset();

    if (this.standing) {
      return;
    }

    if (!this.nextMove) {
      this.standing = true;
      // set timer on random number of seconds <5;10) in which Entity will stay idle
      let msMultiplier = 1000,
        standSeconds = randIntInRange(5, 10);
      setTimeout(
        function () {
          this.standing = false;
          pathfinder.genNewPath();
          this.nextMove = pathfinder.getNextMove();
        }.bind(this),
        standSeconds * msMultiplier,
      );
      return;
    }

    let goalTile = this.nextMove.getCoords();
    let nextDirOnPath = this.nextMove.optimalDirection;

    let { x, y } = entity.getCenterPoint();
    if (roundToTile(x) - goalTile.x === 0 && roundToTile(y) - goalTile.y === 0) {
      if (
        (nextDirOnPath.facesLeft() && x % tileSize <= tileSize / 2) ||
        (nextDirOnPath.facesRight() && x % tileSize >= tileSize / 2) ||
        (nextDirOnPath.facesDown() && y % tileSize >= tileSize / 2) ||
        (nextDirOnPath.facesUp() && y % tileSize <= tileSize / 2)
      ) {
        entity.moveTo(
          roundToTile(x) * tileSize + tileSize / 2,
          roundToTile(y) * tileSize + tileSize / 2,
        );
        this.nextMove = pathfinder.getNextMove();
        if (!this.nextMove) return;
      }
    }
    this.setFromDirection(nextDirOnPath);
  }

  setFromDirection(direction) {
    if (direction.facesLeft()) return this.moveLeft();
    if (direction.facesRight()) return this.moveRight();
    if (direction.facesUp()) return this.moveUp();
    if (direction.facesDown()) return this.moveDown();
  }

  moveLeft() {
    this.direction.moveLeft();
    this.speed.x -= this.getCurrentMoveSpeed();
  }
  moveRight() {
    this.direction.moveRight();
    this.speed.x += this.getCurrentMoveSpeed();
  }
  moveUp() {
    this.direction.moveUp();
    this.speed.y -= this.getCurrentMoveSpeed();
  }
  moveDown() {
    this.direction.moveDown();
    this.speed.y += this.getCurrentMoveSpeed();
  }
  toggleSprint() {
    this.sprinting = !this.sprinting;
  }
  toggleSneak() {
    this.sneaking = !this.sneaking;
  }
}

export default class Movement {
  constructor(
    entity,
    baseSpeed = pp.defaultPlayerSpeed,
    sprintMultiplier = pp.defaultSprintMultiplier,
    sneakMultiplier = pp.defaultSneakMultiplier,
    options = {},
  ) {
    validateOptions(options, movementOptions, "Movement");

    this.entity = entity;

    this.momentum = new Momentum(baseSpeed, sprintMultiplier, sneakMultiplier);

    this.moveX = new Animation(this.entity, "x", baseSpeed);
    this.moveY = new Animation(this.entity, "y", baseSpeed);

    this.playerControlled = options.playerControlled;
    this.pathfinder = new Pathfinder(this.entity.game, this.entity, false);

    this.standing = false;
  }

  get direction() {
    return this.momentum.direction;
  }

  /**
    Update the position and sprite of the entity.
    Each update cycle starts with resetting the direction
    and X and Y speeds of the entity.
    
    Then these properties are set according to keyboard input
    or input provided by a Pathfinder.
    
    update() must end with calls to updateMovement()
    and updateSprite() to apply the changes properly.
  */
  update() {
    if (!this.playerControlled) {
      this.momentum.setFromPathfinder(this.pathfinder, this.entity);
    }

    this.updateMovement();
    this.updateSprite();
  }

  manageInputs(keyman) {
    this.momentum.manageInputs(keyman);
  }

  /**
   * Update the entity's sprite and animation to match
   * the current movement
   */
  updateSprite() {
    if (this.momentum.direction.facesLeft()) {
      this.entity.sprite.mirrored = true;
    } else if (this.momentum.direction.facesRight()) {
      this.entity.sprite.mirrored = false;
    }

    if (this.moveX.speed !== 0 || this.moveY.speed !== 0) {
      if (this.entity.sprite.animation.name !== "run") this.entity.sprite.changeAnimation("run");
      return;
    }
    if (this.entity.sprite.animation.name !== "idle") this.entity.sprite.changeAnimation("idle");
  }

  /**
   * Make final adjustments to speed and direction based
   * on detected collisions (or if the movement is diagonal).
   * Move the entity using the final speed values.
   */
  updateMovement() {
    let { speed: currentSpeed, direction } = this.momentum;
    // Collisions
    if (currentSpeed.y < 0 && direction.facesUp() && this.entity.willCollide?.(0, currentSpeed.y)) {
      this.entity.moveTillCollision(0, currentSpeed.y);
      direction.moveDown();
      currentSpeed.x *= pp.defaultDiagonalOffset;
      currentSpeed.y = 0;
    } else if (
      currentSpeed.y > 0 &&
      direction.facesDown() &&
      this.entity.willCollide?.(0, currentSpeed.y)
    ) {
      this.entity.moveTillCollision(0, currentSpeed.y);
      direction.moveUp();
      currentSpeed.x *= pp.defaultDiagonalOffset;
      currentSpeed.y = 0;
    }

    if (
      currentSpeed.x < 0 &&
      direction.facesLeft() &&
      this.entity.willCollide?.(currentSpeed.x, 0)
    ) {
      this.entity.moveTillCollision(currentSpeed.x, 0);
      direction.moveRight();
      currentSpeed.x = 0;
      currentSpeed.y *= pp.defaultDiagonalOffset;
    } else if (
      currentSpeed.x > 0 &&
      direction.facesRight() &&
      this.entity.willCollide?.(currentSpeed.x, 0)
    ) {
      this.entity.moveTillCollision(currentSpeed.x, 0);
      direction.moveLeft();
      currentSpeed.x = 0;
      currentSpeed.y *= pp.defaultDiagonalOffset;
    }

    if (direction.isDiagonal()) {
      currentSpeed.x *= pp.defaultDiagonalOffset;
      currentSpeed.y *= pp.defaultDiagonalOffset;
    }
    this.moveX.speed = currentSpeed.x;
    this.moveY.speed = currentSpeed.y;

    this.move();
  }

  move() {
    // Change x and y coordinates using Animations.
    this.moveX.next();
    this.moveY.next();

    if (this.moveX.speed === 0 && this.moveY.speed === 0) return;

    this.entity.updateTilePresence();
  }

  /**
   * Calculates the change in entity's X position
   * that would be applied if no collisions were deteceted.
   */
  getChangeX(speedX = this.momentum.speed.x) {
    return this.moveX.getChangeInThisTick(speedX);
  }

  /**
   * Calculates the change in entity's Y position
   * that would be applied if no collisions were deteceted.
   */
  getChangeY(speedY = this.momentum.speed.y) {
    return this.moveY.getChangeInThisTick(speedY);
  }
}
