import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import time from "@/engine/time";
import { roll } from "@/lib/random";
import AnimatedSprite from "./AnimatedSprite";
import { setImgInfo, type ImageInfoType } from "./imgInfo";

vi.mock("@/engine/Browser", () => ({ ctx: {} }));
vi.mock("@/lib/random", () => ({ roll: vi.fn(), randIntInRange: () => 0 }));
vi.stubGlobal(
  "Image",
  class {
    src = "";
    complete = false;
    style = {};
  },
);

const runner: ImageInfoType = {
  src: "run.png",
  width: 32,
  height: 32,
  spriteWidth: 32,
  spriteHeight: 32,
  defaultAnimation: "run",
  animations: new Map([
    [
      "run",
      {
        name: "run",
        src: "run.png",
        frameDurations: [100, 100],
        rareVariant: { src: "run-hat.png", chance: 0.05 },
      },
    ],
  ]),
};

function playOneCycle(sprite: AnimatedSprite) {
  time.delta = 200;
  sprite.next();
}

describe("AnimatedSprite rare variant", () => {
  beforeEach(() => {
    setImgInfo(new Map([["runner", runner]]));
    vi.mocked(roll).mockReset();
  });

  it("plays the animation's own sheet when the roll fails", () => {
    vi.mocked(roll).mockReturnValue(false);
    const sprite = new AnimatedSprite("runner");
    expect(sprite.cycleSrc).toBe("run.png");
  });

  it("plays the variant for a whole cycle when the roll succeeds, then rolls again", () => {
    vi.mocked(roll).mockReturnValueOnce(true).mockReturnValue(false);
    const sprite = new AnimatedSprite("runner");
    expect(sprite.cycleSrc).toBe("run-hat.png");
    expect(roll).toHaveBeenCalledWith(0.05);

    time.delta = 100;
    sprite.next();
    expect(sprite.frame).toBe(1);
    expect(sprite.cycleSrc).toBe("run-hat.png");

    playOneCycle(sprite);
    expect(sprite.cycleSrc).toBe("run.png");
  });
});
