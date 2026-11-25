import Interactible from "./Interactible";
import Entity from "@/engine/Entity";
import { PIXEL_SCALE } from "@/engine/consts";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
import type Game from "@/game/Game";
import type Location from "@/game/Location/Location";
import type { Point } from "@/lib/utilities";

type Orientation = "horizontal" | "vertical";
type Rect = { left: number; right: number; top: number; bottom: number };

// All positions are in screen pixels from the sprite's top left corner.
// The frame sheet and the wheel sheet are the same size and drawn in the same place.

/** The belt */
const BELT: Record<Orientation, Rect> = {
  horizontal: { left: 18, right: 100, top: 10, bottom: 38 },
  vertical: { left: 12, right: 40, top: 16, bottom: 98 },
};
/** The solid parts of the frame; the edges left out are where you step on */
const FRAME_WALLS: Record<Orientation, Rect[]> = {
  // Open at the left end
  horizontal: [
    { left: 2, right: 115, top: 0, bottom: 9 }, // top rail
    { left: 2, right: 115, top: 38, bottom: 61 }, // bottom rail, front face and legs
    { left: 100, right: 115, top: 10, bottom: 37 }, // right roller and end
  ],
  // Open along both rails
  vertical: [
    { left: 2, right: 49, top: 0, bottom: 15 }, // top end and roller
    { left: 2, right: 49, top: 98, bottom: 127 }, // lower roller, front face and legs
  ],
};
/** The bottom middle of the wheel's post */
const WHEEL_FOOT: Record<Orientation, Point> = {
  horizontal: { x: 139, y: 62 },
  vertical: { x: 73, y: 128 },
};
/** Half the width of the wheel's hitbox, at the foot of its post */
const WHEEL_HALF_WIDTH = 14;
/** How far from the belt's middle, along the belt, the player's feet are held */
const HOLD_DISTANCE = 8;
/**
 * How far from the belt's middle line the feet may be for it to hold them.
 * Along its edges you walk normally, which is how you get off the belt.
 */
const HOLD_WIDTH = 5;

/**
 * Dev tool for watching the player's walk and run animations in place.
 * Running along the belt with the feet on its middle moves the belt instead
 * of the player. Interacting with it turns it between horizontal and vertical.
 *
 * The treadmill itself is flat and drawn under everything. Its wheel stands
 * beside it as a separate entity, drawn by depth, so you can walk behind it,
 * and the closed edges of the frame are invisible solid pieces.
 */
class Treadmill extends Interactible {
  orientation: Orientation;
  location: Location;
  /** The belt runs right or up: its loop is played backwards */
  backwards = false;
  wheel: TreadmillWheel;
  walls: FrameWall[];
  declare sprite: AnimatedSprite;

  constructor(game: Game, location: Location, orientation: Orientation, center: Point) {
    super(game, location, `treadmill-${orientation}`, center, { animated: true });
    this.orientation = orientation;
    this.location = location;
    const width = this.sprite.width * PIXEL_SCALE;
    const height = this.sprite.height * PIXEL_SCALE;
    this.pos.x = center.x - width / 2;
    this.pos.y = center.y - height / 2;
    // Focus is measured from here, so it has to be the middle of the treadmill
    this.relativeCenterPoint = { x: width / 2, y: height / 2 };

    this.wheel = new TreadmillWheel(this);
    location.decorations.push(this.wheel);
    this.walls = FRAME_WALLS[orientation].map((rect) => new FrameWall(this, rect));
  }

  override interact(): void {
    const turned = this.orientation === "horizontal" ? "vertical" : "horizontal";
    this.remove();
    const treadmill = new Treadmill(this.game, this.location, turned, this.getCenterPoint());
    const npcs = this.location.npcs;
    npcs.splice(npcs.indexOf(this), 1, treadmill);

    // Turning must not shut the player inside a solid part: put them on the belt
    const player = this.game.player;
    const solids = [treadmill.wheel, ...treadmill.walls];
    if (solids.some((solid) => solid.hitbox && player.hitbox.willCollide(0, 0, solid.hitbox))) {
      const middle = treadmill.beltMiddle();
      player.moveTo(middle.x, middle.y);
      player.hitbox.updateTilePresence();
    }
  }

  private remove(): void {
    const decorations = this.location.decorations;
    decorations.splice(decorations.indexOf(this.wheel), 1);
    for (const solid of [this.wheel, ...this.walls]) solid.hitbox?.leaveAllTiles();
  }

  override update(): void {
    const player = this.game.player;
    const movement = player.movement;
    const speedAlongBelt =
      this.orientation === "horizontal" ? movement.moveX.speed : movement.moveY.speed;

    // Standing still, the belt and wheel stay where they stopped
    if (speedAlongBelt === 0 || !this.holdsFeet(player.getCenterPoint())) return;

    // Put the feet back on the belt's middle, so only the belt moves
    const feet = player.getCenterPoint();
    const middle = this.beltMiddle();
    if (this.orientation === "horizontal") player.moveTo(middle.x, feet.y);
    else player.moveTo(feet.x, middle.y);
    player.hitbox.updateTilePresence();

    // The loop moves the belt surface left or down, under someone running right or up
    const backwards = speedAlongBelt < 0 === (this.orientation === "horizontal");
    if (backwards !== this.backwards) {
      // Carry on from the frame on screen, now counted the other way
      this.backwards = backwards;
      this.sprite.frame = this.drawnFrame();
    }
    const groundSpeed = this.sprite.animation?.groundSpeed ?? 1;
    this.sprite.tempo = Math.abs(speedAlongBelt) / (groundSpeed * PIXEL_SCALE);
    this.sprite.next();
  }

  private holdsFeet(feet: Point): boolean {
    const belt = BELT[this.orientation];
    const left = this.pos.x + belt.left;
    const right = this.pos.x + belt.right;
    const top = this.pos.y + belt.top;
    const bottom = this.pos.y + belt.bottom;
    if (feet.x < left || feet.x > right || feet.y < top || feet.y > bottom) return false;

    const middle = this.beltMiddle();
    const along = this.orientation === "horizontal" ? feet.x - middle.x : feet.y - middle.y;
    const across = this.orientation === "horizontal" ? feet.y - middle.y : feet.x - middle.x;
    return Math.abs(along) <= HOLD_DISTANCE && Math.abs(across) <= HOLD_WIDTH;
  }

  private beltMiddle(): Point {
    const belt = BELT[this.orientation];
    return {
      x: this.pos.x + (belt.left + belt.right) / 2,
      y: this.pos.y + (belt.top + belt.bottom) / 2,
    };
  }

  // Always the moving belt: the outlined focus sprite would hide it
  override draw(cameraX: number, cameraY: number): void {
    const sprite = this.sprite;
    const frame = sprite.frame;
    sprite.frame = this.drawnFrame();
    sprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
    sprite.frame = frame;
  }

  /** The sheet frame on screen: played backwards, frame 1 shows the sheet's last one */
  drawnFrame(): number {
    const frameCount = this.sprite.animation?.frameDurations.length ?? 1;
    const frame = this.sprite.frame;
    return this.backwards ? (frameCount - frame) % frameCount : frame;
  }
}

/** The treadmill's flywheel, post and drive belt, turning with its belt */
class TreadmillWheel extends Entity {
  treadmill: Treadmill;
  declare sprite: AnimatedSprite;

  constructor(treadmill: Treadmill) {
    const foot = WHEEL_FOOT[treadmill.orientation];
    super(`treadmill-${treadmill.orientation}-wheel`, treadmill.pos, {
      animated: true,
      hitbox: treadmill.location.tiles,
      relativeCenterPoint: { x: foot.x, y: foot.y - 3 },
      boundingDistance: { left: WHEEL_HALF_WIDTH, right: WHEEL_HALF_WIDTH, up: 2, down: 2 },
    });
    this.treadmill = treadmill;
  }

  override draw(cameraX: number, cameraY: number): void {
    this.sprite.frame = this.treadmill.drawnFrame();
    super.draw(cameraX, cameraY);
  }
}

/**
 * A solid part of the treadmill's frame: only its hitbox matters, and it is
 * never drawn. Entities need a sprite, so it borrows the wheel's.
 */
class FrameWall extends Entity {
  constructor(treadmill: Treadmill, rect: Rect) {
    super(`treadmill-${treadmill.orientation}-wheel`, treadmill.pos, {
      hitbox: treadmill.location.tiles,
      relativeCenterPoint: { x: rect.left, y: rect.top },
      boundingDistance: {
        left: 0,
        up: 0,
        right: rect.right - rect.left,
        down: rect.bottom - rect.top,
      },
    });
  }
}

export default Treadmill;
