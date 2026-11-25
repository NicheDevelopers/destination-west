import { describe, expect, it, vi } from "vite-plus/test";
import { DIRECTIONS, type DirectionValue } from "./consts";
import Movement from "./Movement";
import type Hitbox from "./Hitbox";
import type AnimatedSprite from "./Sprite/AnimatedSprite";
import { ANIMATION_NAMES, type AnimationName } from "./Sprite/imgInfo";

vi.mock("./Browser", () => ({ ctx: {} }));

/** A sprite that only records which animation it was switched to */
function fakeSprite(animationNames: AnimationName[]) {
  const animations = new Map(animationNames.map((name) => [name, { name }]));
  const sprite = {
    animations,
    animation: animations.get("idle"),
    mirrored: false,
    tempo: 1,
    outOfBreath: false,
    changeAnimation(name: AnimationName) {
      sprite.animation = animations.get(name);
    },
  };
  return sprite;
}

function makeMovement(animationNames: AnimationName[]) {
  const sprite = fakeSprite(animationNames);
  const entity = {
    pos: { x: 0, y: 0 },
    sprite: sprite as unknown as AnimatedSprite,
    hitbox: { locationArray: [] } as unknown as Hitbox,
    getCenterPoint: () => ({ x: 0, y: 0 }),
    moveTo: () => {},
  };
  return { movement: new Movement(entity), sprite };
}

function move(movement: Movement, direction: DirectionValue) {
  movement.momentum.direction.setTo(direction);
  const moving = direction !== DIRECTIONS.none;
  movement.moveX.speed = moving ? 1 : 0;
  movement.moveY.speed = 0;
  movement.updateSprite();
}

describe("Movement.updateSprite", () => {
  it("shows the back when moving up and the front when moving down", () => {
    const { movement, sprite } = makeMovement([...ANIMATION_NAMES]);
    move(movement, DIRECTIONS.up);
    expect(sprite.animation?.name).toBe("walk-north");
    move(movement, DIRECTIONS.down);
    expect(sprite.animation?.name).toBe("walk-south");
  });

  it("shows the side when moving diagonally", () => {
    const { movement, sprite } = makeMovement([...ANIMATION_NAMES]);
    move(movement, DIRECTIONS.upLeft);
    expect(sprite.animation?.name).toBe("walk");
    expect(sprite.mirrored).toBe(true);
  });

  it("keeps the last view when stopping", () => {
    const { movement, sprite } = makeMovement([...ANIMATION_NAMES]);
    move(movement, DIRECTIONS.down);
    move(movement, DIRECTIONS.none);
    expect(sprite.animation?.name).toBe("idle-south");
  });

  it("uses the run animation of the view when sprinting", () => {
    const { movement, sprite } = makeMovement([...ANIMATION_NAMES]);
    movement.momentum.sprinting = true;
    move(movement, DIRECTIONS.up);
    expect(sprite.animation?.name).toBe("run-north");
  });

  it("falls back to the side animations when the sprite has no others", () => {
    const { movement, sprite } = makeMovement(["idle", "walk", "run"]);
    move(movement, DIRECTIONS.up);
    expect(sprite.animation?.name).toBe("walk");
  });
});
