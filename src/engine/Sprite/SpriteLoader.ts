import Sprite, { type SpriteOptions } from "./Sprite";
import { preloadAnimationImages } from "./AnimatedSprite";
import { setImgInfo, type ImageInfoType } from "./imgInfo";

/**
 * SpriteLoader is a class for using preloaded sprites.
 * The game loop should wait for all sprites to be loaded before starting.
 *
 * The needed sprites should be defined in the array `spritesToLoad` in `loadSprites`.
 *
 * Sprites use image tags or even canvas elements to load (or generate) images,
 * so they are asynchronous by nature.
 */
class SpriteLoader {
  /**
   *  Mapping: SpriteRecipe -> Sprite
   */
  loadedSprites: Map<string, Sprite>;

  constructor() {
    this.loadedSprites = new Map();
  }

  loadSprites(imgInfo: Map<string, ImageInfoType>): Promise<unknown[]> {
    setImgInfo(imgInfo);
    /**
     * A list of sprites to load in the format:
     * [typeName, options]
     * which is the same format as the arguments for the Sprite constructor.
     *
     * Currently only Sprites (and not subclasses) are supported, but that's
     * enough to handle sprite loading issues.
     */
    const spritesToLoad: [string, SpriteOptions][] = Array.from(imgInfo.keys(), (key) => [key, {}]);
    return Promise.all([
      preloadAnimationImages(),
      ...spritesToLoad.map((args) => {
        return new Promise<void>((resolve) => {
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

  getSprite(typeName: string, options: SpriteOptions): Sprite {
    const recipe = Sprite.createRecipe(typeName, options);
    const sprite = this.loadedSprites.get(recipe);
    if (!sprite) {
      const recipeDesc = Sprite.getRecipeDescription(recipe);
      const argsLine = `[${typeName}, ${JSON.stringify(options)}],`;
      throw new Error(
        `SpriteLoader: Not loaded: '${recipeDesc}'. ` +
          `Add it to SpriteLoader.js with the following line:\n${argsLine}`,
      );
    }
    return sprite;
  }
}

export default new SpriteLoader();
