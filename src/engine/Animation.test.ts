import { beforeEach, describe, expect, it } from "vite-plus/test";
import Animation, { MultiAnimation } from "./Animation";
import time from "./time";

beforeEach(() => {
  time.now = 0;
  time.delta = 16;
});

describe("Animation", () => {
  it("carries the fractional change over to the next ticks", () => {
    const target = { x: 0 };
    const animation = new Animation(target, "x", 100);

    // 100 units/s * 16 ms = 1.6 units per tick
    animation.next();
    expect(target.x).toBe(1);
    animation.next();
    expect(target.x).toBe(3);
    animation.next();
    expect(target.x).toBe(4);
  });

  it("only changes the property in multiples of the quantum", () => {
    const target = { x: 0 };
    const animation = new Animation(target, "x", 100);
    animation.quantum = 5;

    const values = [];
    for (let i = 0; i < 4; i++) {
      animation.next();
      values.push(target.x);
    }
    expect(values).toEqual([0, 0, 0, 5]);
  });

  it("getChangeInThisTick predicts the next tick without applying it", () => {
    const target = { x: 0 };
    const animation = new Animation(target, "x", 100);
    animation.next();

    const predicted = animation.getChangeInThisTick();
    expect(target.x).toBe(1);

    animation.next();
    expect(target.x).toBe(1 + predicted);
  });

  it("keeps the leftover change when stopped and resumed in the same direction", () => {
    const target = { x: 0 };
    const animation = new Animation(target, "x", 0);
    animation.speed = 100;
    animation.next();

    animation.speed = 0;
    animation.speed = 100;
    animation.next();
    // 0.6 left over + 1.6
    expect(target.x).toBe(3);
  });

  it("drops the leftover change when the direction changes", () => {
    const target = { x: 0 };
    const animation = new Animation(target, "x", 0);
    animation.speed = 100;
    animation.next();

    animation.speed = -100;
    animation.next();
    // Without clearing, 0.6 left over - 1.6 would move by -1
    expect(target.x).toBe(-1);
  });

  it("stops exactly at the goal", () => {
    time.delta = 100;
    const target = { x: 0 };
    const animation = new Animation(target, "x", 100);
    animation.goal = 25;

    expect(animation.next()).toBe(true);
    expect(animation.next()).toBe(true);
    expect(animation.next()).toBe(false);
    expect(target.x).toBe(25);

    expect(animation.next()).toBe(false);
    expect(target.x).toBe(25);
  });

  it("reads the goal from a function every time", () => {
    time.delta = 100;
    const target = { x: 0 };
    let goal = 5;
    const animation = new Animation(target, "x", 100);
    animation.goal = () => goal;

    expect(animation.next()).toBe(false);
    expect(target.x).toBe(5);

    goal = 30;
    expect(animation.next()).toBe(true);
    expect(target.x).toBe(15);
  });

  it("calls the change callback only when the value changes", () => {
    time.delta = 5;
    let calls = 0;
    const animation = new Animation({ x: 0 }, "x", 100);
    animation.setChangeCallback(() => calls++);

    animation.next();
    expect(calls).toBe(0);
    animation.next();
    expect(calls).toBe(1);
  });
});

describe("MultiAnimation", () => {
  it("sets speeds so every property reaches its goal after endAfter seconds", () => {
    const pos = { x: 0, y: 10 };
    const animation = new MultiAnimation([new Animation(pos, "x", 0), new Animation(pos, "y", 0)], {
      endAfter: 2,
    });
    animation.goal = [100, -30];

    expect(animation.animations.map((a) => a.speed)).toEqual([50, -20]);
  });

  it("finishes all properties once endAfter has passed", () => {
    const pos = { x: 0, y: 10 };
    const animation = new MultiAnimation([new Animation(pos, "x", 0), new Animation(pos, "y", 0)], {
      endAfter: 1,
    });
    animation.goal = [100, -30];

    time.now = 1000;
    animation.next();
    expect(pos).toEqual({ x: 100, y: -30 });
  });

  it("keeps going while any property hasn't reached its goal", () => {
    time.delta = 100;
    const target = { x: 0, y: 0 };
    const animation = new MultiAnimation([
      new Animation(target, "x", 100),
      new Animation(target, "y", 100),
    ]);
    animation.goal = [10, 20];

    expect(animation.next()).toBe(true);
    expect(target).toEqual({ x: 10, y: 10 });
    expect(animation.next()).toBe(false);
    expect(target).toEqual({ x: 10, y: 20 });
  });

  it("throws when the number of goals doesn't match the properties", () => {
    const target = { x: 0, y: 0 };
    const animation = new MultiAnimation([
      new Animation(target, "x", 100),
      new Animation(target, "y", 100),
    ]);
    expect(() => (animation.goal = [1])).toThrow("incorrect size");
  });
});
