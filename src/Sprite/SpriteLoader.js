import Sprite from "./Sprite.js";
import { preloadAnimationImages } from "./AnimatedSprite.js";
import imgInfo from "@/static/imgInfo.js";

/**
 * A list of sprites to load in the format:
 * [typeName, options]
 * which is the same format as the arguments for the Sprite constructor.
 *
 * Currently only Sprites (and not subclasses) are supported, but that's
 * enough to handle sprite loading issues.
 */
const spritesToLoad = imgInfo.keys().map((key) => [key, {}]);

/**
 * SpriteLoader is a class for using preloaded sprites.
 * The game loop should wait for all sprites to be loaded before starting.
 *
 * The needed sprites should be defined in the array `spritesToLoad` above.
 *
 * Sprites use image tags or even canvas elements to load (or generate) images,
 * so they are asynchronous by nature.
 */
class SpriteLoader {
  constructor() {
    /**
     *  Mapping: SpriteRecipe -> Sprite
     */
    this.loadedSprites = new Map();
  }

  loadSprites() {
    return Promise.all([
      preloadAnimationImages(),
      ...spritesToLoad.map((args) => {
        return new Promise((resolve) => {
          const [typeName, options] = args;
          const originalCallback = options.callback;
          const sprite = new Sprite(
            typeName,
            Object.assign(options, {
              callback: () => {
                originalCallback?.();
                resolve();
              },
            }),
          );
          const recipe = sprite.getRecipe();
          this.loadedSprites.set(recipe, sprite);
        });
      }),
    ]);
  }

  getSprite(...args) {
    const [typeName, options] = args;
    const recipe = Sprite.createRecipe(...args);
    if (!this.loadedSprites.has(recipe)) {
      const recipeDesc = Sprite.getRecipeDescription(recipe);
      const argsLine = `[${typeName}, ${JSON.stringify(options)}],`;
      throw new Error(
        `SpriteLoader: Not loaded: '${recipeDesc}'. ` +
          `Add it to SpriteLoader.js with the following line:\n${argsLine}`,
      );
    }
    return this.loadedSprites.get(recipe);
  }
}

export default new SpriteLoader();
