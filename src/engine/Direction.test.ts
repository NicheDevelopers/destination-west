import { describe, expect, it } from "vite-plus/test";
import { DIRECTIONS } from "./consts";
import Direction from "./Direction";

describe("Direction", () => {
  it("defaults to none", () => {
    const direction = new Direction();
    expect(direction.is(DIRECTIONS.none)).toBe(true);
    expect(direction.toString()).toBe("none");
  });

  it("knows which way each direction faces", () => {
    const upLeft = new Direction(DIRECTIONS.upLeft);
    expect(upLeft.facesUp()).toBe(true);
    expect(upLeft.facesLeft()).toBe(true);
    expect(upLeft.facesDown()).toBe(false);
    expect(upLeft.facesRight()).toBe(false);

    const down = new Direction(DIRECTIONS.down);
    expect(down.facesDown()).toBe(true);
    expect(down.facesUp()).toBe(false);
    expect(down.facesLeft()).toBe(false);
    expect(down.facesRight()).toBe(false);

    const none = new Direction(DIRECTIONS.none);
    expect(none.facesUp()).toBe(false);
    expect(none.facesDown()).toBe(false);
    expect(none.facesLeft()).toBe(false);
    expect(none.facesRight()).toBe(false);
  });

  it("is diagonal only for the four corner directions", () => {
    const diagonal = Object.entries(DIRECTIONS)
      .filter(([, value]) => new Direction(value).isDiagonal())
      .map(([name]) => name);
    expect(diagonal).toEqual(["upLeft", "upRight", "downLeft", "downRight"]);
  });

  it.each([
    [1, 0, "right"],
    [-1, 0, "left"],
    [0, 1, "down"],
    [0, -1, "up"],
    [3, 5, "downRight"],
    [-3, 5, "downLeft"],
    [3, -5, "upRight"],
    [-3, -5, "upLeft"],
    [0, 0, "none"],
  ])("fromChangeInXAndY(%d, %d) is %s", (dx, dy, expected) => {
    expect(new Direction(DIRECTIONS.up).fromChangeInXAndY(dx, dy).toString()).toBe(expected);
  });

  it("combines moves into a diagonal", () => {
    const direction = new Direction();
    direction.moveUp();
    direction.moveRight();
    expect(direction.is(DIRECTIONS.upRight)).toBe(true);
  });

  it("throws when moving past the edge of the grid", () => {
    expect(() => new Direction(DIRECTIONS.up).moveUp()).toThrow();
    expect(() => new Direction(DIRECTIONS.downRight).moveRight()).toThrow();
    expect(() => new Direction(DIRECTIONS.downLeft).moveDown()).toThrow();
    expect(() => new Direction(DIRECTIONS.left).moveLeft()).toThrow();
  });

  it("returns axis multipliers matching the direction", () => {
    const downLeft = new Direction(DIRECTIONS.downLeft);
    expect(downLeft.xAxisMultiplier()).toBe(-1);
    expect(downLeft.yAxisMultiplier()).toBe(1);

    const right = new Direction(DIRECTIONS.right);
    expect(right.xAxisMultiplier()).toBe(1);
    expect(right.yAxisMultiplier()).toBe(0);
  });

  it("resets to none", () => {
    const direction = new Direction(DIRECTIONS.upRight);
    direction.reset();
    expect(direction.is(DIRECTIONS.none)).toBe(true);
  });
});
