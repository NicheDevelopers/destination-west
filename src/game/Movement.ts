import {
  TILE_SIZE,
  PIXEL_SCALE,
  PLAYER_PARAMETERS as pp,
  type InputMode,
} from "@/global/consts.js";
import { randIntInRange } from "@/utilities/random.js";
import { roundToTile, validateOptions, type Point } from "@/utilities/utilities.js";
import { Direction } from "@/utilities/utilities.js";
import Animation from "@/core/Animation.js";
import time from "@/global/time.js";
import Pathfinder from "@/Pathfinder.js";
import type { KeyboardManager } from "@/core/KeyboardManager.js";
import type AnimatedSprite from "@/Sprite/AnimatedSprite.js";
import type Game from "./Game.js";

const movementOptions = new Map([
  [
    "playerControlled",
    "Boolean. Specifies whether the Movement is supposed to " +
      "take movement action requests into account",
  ],
]);

type MovementOptions = {
  playerControlled?: boolean;
};

interface MovingEntity {
  game: Game;
  pos: Point;
  sprite: AnimatedSprite;
  getCenterPoint(): Point;
  moveTo(x: number, y: number): void;
  willCollide?(speedX: number, speedY: number): boolean;
  moveTillCollision(speedX: number, speedY: number): void;
  updateTilePresence(): void;
}

type PathStep = {
  gridPos: Point;
  optimalDirection: Direction;
};

type MoveFnName = "moveUp" | "moveDown" | "moveLeft" | "moveRight";

/**
 * Represents the current state of the movement,
 * i.e. the current speed on the X and Y axes,
 * the movement direction and current modifiers
 * (sprinting or sneaking).
 */
class Momentum {
  baseMovementSpeed: number;
  direction: Direction;
  speed: Point;
  sprintMode: InputMode;
  sneakMode: InputMode;
  sprintMultiplier: number;
  sneakMultiplier: number;
  sprinting: boolean;
  sneaking: boolean;
  standing: boolean;
  nextMove: PathStep | null;
  movementActions: Map<string, MoveFnName>;

  constructor(baseMovementSpeed: number, sprintMultiplier: number, sneakMultiplier: number) {
    this.baseMovementSpeed = baseMovementSpeed;

    this.direction = new Direction();
    this.speed = { x: 0, y: 0 };

    this.sprintMode = pp.defaultSprintMode;
    this.sneakMode = pp.defaultSneakMode;
    this.sprintMultiplier = sprintMultiplier;
    this.sneakMultiplier = sneakMultiplier;

    this.sprinting = false;
    this.sneaking = false;
    this.standing = false;

    this.nextMove = null;

    this.movementActions = new Map<string, MoveFnName>([
      ["Move Up", "moveUp"],
      ["Move Down", "moveDown"],
      ["Move Left", "moveLeft"],
      ["Move Right", "moveRight"],
    ]);
  }

  reset(): void {
    this.speed.x = 0;
    this.speed.y = 0;
    this.direction.reset();
  }

  /**
   * Returns base speed with current modifiers (sneak or sprint).
   */
  getCurrentMoveSpeed(): number {
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
  manageInputs(keyman: KeyboardManager): void {
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

  setFromPathfinder(pathfinder: Pathfinder, entity: MovingEntity): void {
    this.reset();

    if (this.standing) {
      return;
    }

    if (!this.nextMove) {
      this.standing = true;
      // set timer on random number of seconds <5;10) in which Entity will stay idle
      let msMultiplier = 1000,
        standSeconds = randIntInRange(5, 10);
      setTimeout(() => {
        this.standing = false;
        pathfinder.genNewPath();
        this.nextMove = pathfinder.getNextMove();
      }, standSeconds * msMultiplier);
      return;
    }

    let goalTile = this.nextMove.gridPos;
    let nextDirOnPath = this.nextMove.optimalDirection;

    let { x, y } = entity.getCenterPoint();
    if (roundToTile(x) - goalTile.x === 0 && roundToTile(y) - goalTile.y === 0) {
      if (
        (nextDirOnPath.facesLeft() && x % TILE_SIZE <= TILE_SIZE / 2) ||
        (nextDirOnPath.facesRight() && x % TILE_SIZE >= TILE_SIZE / 2) ||
        (nextDirOnPath.facesDown() && y % TILE_SIZE >= TILE_SIZE / 2) ||
        (nextDirOnPath.facesUp() && y % TILE_SIZE <= TILE_SIZE / 2)
      ) {
        entity.moveTo(
          roundToTile(x) * TILE_SIZE + TILE_SIZE / 2,
          roundToTile(y) * TILE_SIZE + TILE_SIZE / 2,
        );
        this.nextMove = pathfinder.getNextMove();
        if (!this.nextMove) return;
      }
    }
    this.setFromDirection(nextDirOnPath);
  }

  setFromDirection(direction: Direction): void {
    if (direction.facesLeft()) return this.moveLeft();
    if (direction.facesRight()) return this.moveRight();
    if (direction.facesUp()) return this.moveUp();
    if (direction.facesDown()) return this.moveDown();
  }

  moveLeft(): void {
    this.direction.moveLeft();
    this.speed.x -= this.getCurrentMoveSpeed();
  }
  moveRight(): void {
    this.direction.moveRight();
    this.speed.x += this.getCurrentMoveSpeed();
  }
  moveUp(): void {
    this.direction.moveUp();
    this.speed.y -= this.getCurrentMoveSpeed();
  }
  moveDown(): void {
    this.direction.moveDown();
    this.speed.y += this.getCurrentMoveSpeed();
  }
  toggleSprint(): void {
    this.sprinting = !this.sprinting;
  }
  toggleSneak(): void {
    this.sneaking = !this.sneaking;
  }
}

export default class Movement {
  entity: MovingEntity;
  momentum: Momentum;
  moveX: Animation;
  moveY: Animation;
  playerControlled: boolean | undefined;
  pathfinder: Pathfinder;
  standing: boolean;
  /** Time in ms the entity stays out of breath, counting down once it stops sprinting */
  outOfBreathTime: number = 0;

  constructor(
    entity: MovingEntity,
    baseSpeed: number = pp.defaultPlayerSpeed,
    sprintMultiplier: number = pp.defaultSprintMultiplier,
    sneakMultiplier: number = pp.defaultSneakMultiplier,
    options: MovementOptions = {},
  ) {
    validateOptions(options, movementOptions, "Movement");
    this.entity = entity;

    this.momentum = new Momentum(baseSpeed, sprintMultiplier, sneakMultiplier);

    this.moveX = new Animation(this.entity, "pos.x", baseSpeed);
    this.moveY = new Animation(this.entity, "pos.y", baseSpeed);

    this.playerControlled = options.playerControlled;
    this.pathfinder = new Pathfinder(this.entity.game, this.entity, false);

    this.standing = false;
  }

  get direction(): Direction {
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
  update(): void {
    if (!this.playerControlled) {
      this.momentum.setFromPathfinder(this.pathfinder, this.entity);
    }

    this.updateMovement();
    this.updateSprite();
  }

  manageInputs(keyman: KeyboardManager): void {
    this.momentum.manageInputs(keyman);
  }

  /**
   * Update the entity's sprite and animation to match
   * the current movement
   */
  updateSprite(): void {
    const sprite = this.entity.sprite;
    if (this.momentum.direction.facesLeft()) {
      sprite.mirrored = true;
    } else if (this.momentum.direction.facesRight()) {
      sprite.mirrored = false;
    }

    const speed = Math.hypot(this.moveX.speed, this.moveY.speed);
    this.updateBreath(speed !== 0 && this.momentum.sprinting);
    sprite.outOfBreath = this.outOfBreathTime > 0;

    if (speed !== 0) {
      const animationName = this.momentum.sprinting ? "run" : "walk";
      if (sprite.animation?.name !== animationName) sprite.changeAnimation(animationName);
      // Play the legs at the pace the entity actually moves, so the feet don't slide
      const groundSpeed = sprite.animation?.groundSpeed;
      sprite.tempo = groundSpeed ? speed / (groundSpeed * PIXEL_SCALE) : 1;
      return;
    }
    if (sprite.animation?.name !== "idle") sprite.changeAnimation("idle");
    sprite.tempo = 1;
  }

  /**
   * Sprinting leaves the entity out of breath for a while after it stops
   */
  updateBreath(sprinting: boolean): void {
    if (sprinting) this.outOfBreathTime = pp.outOfBreathSeconds * 1000;
    else this.outOfBreathTime = Math.max(0, this.outOfBreathTime - (time.delta ?? 0));
  }

  /**
   * Make final adjustments to speed and direction based
   * on detected collisions (or if the movement is diagonal).
   * Move the entity using the final speed values.
   */
  updateMovement(): void {
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

  move(): void {
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
  getChangeX(speedX: number = this.momentum.speed.x): number {
    return this.moveX.getChangeInThisTick(speedX);
  }

  /**
   * Calculates the change in entity's Y position
   * that would be applied if no collisions were deteceted.
   */
  getChangeY(speedY: number = this.momentum.speed.y): number {
    return this.moveY.getChangeInThisTick(speedY);
  }
}
