import { TILE_SIZE, PIXEL_SCALE, MOVEMENT_PARAMETERS as mp, type InputMode } from "./consts";
import { randIntInRange } from "@/lib/random";
import { validateOptions, type Point } from "@/lib/utilities";
import Direction from "./Direction";
import { roundToTile } from "./tileCoords";
import Animation from "./Animation";
import time from "./time";
import Pathfinder from "./Pathfinder";
import type { InputManager } from "@/engine/state/State";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
import type Hitbox from "./HitboxClass";

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
  pos: Point;
  sprite: AnimatedSprite;
  hitbox: Hitbox;
  getCenterPoint(): Point;
  moveTo(x: number, y: number): void;
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

    this.sprintMode = mp.defaultSprintMode;
    this.sneakMode = mp.defaultSneakMode;
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
  manageInputs(keyman: InputManager): void {
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
  /** Time in ms the entity stays out of breath, counting down once it stops sprinting */
  outOfBreathTime: number = 0;

  constructor(
    entity: MovingEntity,
    baseSpeed: number = mp.defaultSpeed,
    sprintMultiplier: number = mp.defaultSprintMultiplier,
    sneakMultiplier: number = mp.defaultSneakMultiplier,
    options: MovementOptions = {},
  ) {
    validateOptions(options, movementOptions, "Movement");
    this.entity = entity;

    this.momentum = new Momentum(baseSpeed, sprintMultiplier, sneakMultiplier);

    this.moveX = new Animation(this.entity.pos, "x", baseSpeed);
    this.moveY = new Animation(this.entity.pos, "y", baseSpeed);

    this.playerControlled = options.playerControlled;
    this.pathfinder = new Pathfinder(this.entity.hitbox.locationArray, this.entity, false);
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

  manageInputs(keyman: InputManager): void {
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
    if (sprinting) this.outOfBreathTime = mp.outOfBreathSeconds * 1000;
    else this.outOfBreathTime = Math.max(0, this.outOfBreathTime - time.delta);
  }

  /**
   * Make final adjustments to speed and direction based
   * on detected collisions (or if the movement is diagonal).
   * Move the entity using the final speed values.
   */
  updateMovement(): void {
    let { speed: currentSpeed, direction } = this.momentum;
    // Collisions
    if (currentSpeed.y < 0 && direction.facesUp() && this.willCollide(0, currentSpeed.y)) {
      this.moveTillCollision(0, currentSpeed.y);
      direction.moveDown();
      currentSpeed.x *= mp.defaultDiagonalOffset;
      currentSpeed.y = 0;
    } else if (currentSpeed.y > 0 && direction.facesDown() && this.willCollide(0, currentSpeed.y)) {
      this.moveTillCollision(0, currentSpeed.y);
      direction.moveUp();
      currentSpeed.x *= mp.defaultDiagonalOffset;
      currentSpeed.y = 0;
    }

    if (currentSpeed.x < 0 && direction.facesLeft() && this.willCollide(currentSpeed.x, 0)) {
      this.moveTillCollision(currentSpeed.x, 0);
      direction.moveRight();
      currentSpeed.x = 0;
      currentSpeed.y *= mp.defaultDiagonalOffset;
    } else if (
      currentSpeed.x > 0 &&
      direction.facesRight() &&
      this.willCollide(currentSpeed.x, 0)
    ) {
      this.moveTillCollision(currentSpeed.x, 0);
      direction.moveLeft();
      currentSpeed.x = 0;
      currentSpeed.y *= mp.defaultDiagonalOffset;
    }

    if (direction.isDiagonal()) {
      currentSpeed.x *= mp.defaultDiagonalOffset;
      currentSpeed.y *= mp.defaultDiagonalOffset;
    }
    this.moveX.speed = currentSpeed.x;
    this.moveY.speed = currentSpeed.y;

    this.move();
  }

  /**
   * Tests whether the entity would collide if it
   * moved this tick at speeds `speedX` and `speedY`.
   */
  private willCollide(speedX: number, speedY: number): boolean {
    const hitbox = this.entity.hitbox;
    return hitbox.willCollideWithTiles(
      this.getChangeX(speedX),
      this.getChangeY(speedY),
      hitbox.locationArray,
    );
  }

  /**
     Move the entity in the direction specified by the speeds
     as many pixels as it is possible without collision. If
     it is possible to move the whole distance in this tick
     without any collisions, then this whole move is executed.

     At the beginning (even if no move is possible) this function
     clears the changeStack of the move Animation on the axis
     which given speed was 0. This is to ensure that movement
     caused by this function is in one axis only.

     On successful move both changeStacks are cleared (the snap
     puts the entity in a halt, so this fixes potential inaccuracies).

     This function was introduced to solve an issue with entities
     stopping a few (commonly 1) pixels before a colliding hitbox.
     This happens when moving the whole distance the Animation
     would move the entity in a particular tick would create
     a collision
     
     Example: Imagine playing on a very low framerate. In every tick
     the player moves by 10 pixels. If he approaches a building that is
     8 pixels away the move will not be executed. It will be stopped
     due to collision detection (a 10 pixel move is not possible).
     This function essentialy tries doing smaller moves and checks
     if they are possible. In this example it would result in an 8
     pixel move.
     
     @param speedX - The speed on the X-axis
     @param speedY - The speed on the Y-axis
  */
  private moveTillCollision(speedX: number, speedY: number): void {
    if (speedX * speedY !== 0)
      throw new Error(
        `moveTillCollision only supports one axis movement. ` +
          `One speed has to be 0. Speeds provided: X=${speedX}, Y=${speedY}.`,
      );

    let dx = this.getChangeX(speedX);
    let dy = this.getChangeY(speedY);

    // change in this tick if no collisions were detected
    // (assumes one of dx and dy numbers is 0)
    let maxChange = Math.abs(dx + dy);

    let direction = new Direction().fromChangeInXAndY(dx, dy);

    const hitbox = this.entity.hitbox;
    let snappedPixelCount = hitbox.distanceTillTileCollision(
      direction,
      maxChange,
      hitbox.locationArray,
    );

    if (snappedPixelCount === 0) return;

    // Snapped a non-zero distance
    if (Math.sign(dx)) {
      this.entity.pos.x += Math.sign(dx) * snappedPixelCount;
      this.moveX.clearChangeStack();
    } else {
      this.entity.pos.y += Math.sign(dy) * snappedPixelCount;
      this.moveY.clearChangeStack();
    }
  }

  move(): void {
    // Change x and y coordinates using Animations.
    this.moveX.next();
    this.moveY.next();

    if (this.moveX.speed === 0 && this.moveY.speed === 0) return;

    this.entity.hitbox.updateTilePresence();
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
