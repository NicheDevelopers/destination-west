import { describe, expect, it } from "vite-plus/test";
import seed, { deriveSeed } from "./seed";

function drawNumbers(count: number): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(seed.random());
  }
  return numbers;
}

describe("deriveSeed", () => {
  it("gives the same seed for the same values", () => {
    expect(deriveSeed(1234, 5)).toBe(deriveSeed(1234, 5));
  });

  it("gives different seeds for different IDs", () => {
    expect(deriveSeed(1234, 5)).not.toBe(deriveSeed(1234, 6));
  });

  it("gives different seeds for different world seeds", () => {
    expect(deriveSeed(1234, 5)).not.toBe(deriveSeed(1235, 5));
  });

  it("depends on the order of the values", () => {
    expect(deriveSeed(1234, 2, 3)).not.toBe(deriveSeed(1234, 3, 2));
  });

  it("does not depend on what was drawn before", () => {
    seed.set(deriveSeed(1234, 5));
    const firstTime = drawNumbers(5);

    seed.set(99);
    drawNumbers(17);

    seed.set(deriveSeed(1234, 5));
    expect(drawNumbers(5)).toEqual(firstTime);
  });
});
