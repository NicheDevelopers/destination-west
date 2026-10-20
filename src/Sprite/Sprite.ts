/*
  file: src/Sprite.js
  purpose: define the Sprite class for displaying sprites
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/
import { ctx } from "@/core/Browser.js";
import {
  TILE_SIZE,
  SPRITE_SCALE,
  DEFAULT_HITBOX_HEIGHT,
  AUTO_BOUNDARY_X_LOOSENESS,
} from "@/global/consts.js";
import { createCanvas } from "@/utilities/dom.js";
import { randIntInRange } from "@/utilities/random.js";
import { forbidProperty } from "@/utilities/utilities.js";
import { PixelImage } from "@/utilities/PixelImage.js";
import type { Point, Size } from "@/utilities/utilities.js";
import imgInfo from "@/static/imgInfo.js";

function toKey(name: string, rotation: number | undefined, outline: boolean | undefined): string {
  return name + "/" + (rotation === undefined ? "n" : rotation) + "/" + (outline ? "y" : "n");
}

const cachedSprites: Map<string, HTMLImageElement> = new Map(); // String -> Image
const cacheCallbacks: Map<string, Function[]> = new Map(); // String -> functions[]

export type SpriteOptions = {
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  outline?: boolean;
  nocache?: boolean;
  crop?: boolean;
  callback?: () => void;
};

export type SheetInfo = {
  src: string;
  width: number;
  height: number;
  row?: number;
  col?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  random?: boolean;
};

interface SpriteHitboxInfo {
  centerPixel: number;
  startX: number;
  endX: number;
  endY: number;
}

interface SpriteHitboxInfoWithBoundingDistances {
  relativeCenterPoint: Point;
  boundingDistance: { left: number; right: number; up: number; down: number };
}

class Sprite {
  typeName: string;
  scale: number;
  scaleX: number;
  scaleY: number;
  sheetInfo: SheetInfo;
  width: number;
  height: number;
  spriteSheetRow: number;
  spriteSheetCol: number;
  callback: () => void;
  nocache: boolean;
  rotation?: number;
  outline?: boolean;
  // outline?: boolean; // TODO: not boolean, outline.corners (?) never used + innerOutline ?
  img: HTMLImageElement;
  imageToProcess?: HTMLImageElement;
  processingImage?: boolean;

  constructor(typeName: string, options: SpriteOptions = {}, isColored: boolean = false) {
    if (!imgInfo.has(typeName)) {
      throw new Error(`type name is not recognized: ${typeName}`);
    }
    forbidProperty(this, "animation");

    this.typeName = typeName;

    this.scale = options.scale ?? SPRITE_SCALE;
    this.scaleX = options.scaleX ?? this.scale;
    this.scaleY = options.scaleY ?? this.scale;

    const sheetInfo = imgInfo.get(typeName);
    if (!sheetInfo) throw new Error(`Sprite: No image info found for sprite: ${typeName}`);
    this.sheetInfo = sheetInfo;

    this.height = this.sheetInfo.spriteHeight ?? TILE_SIZE;
    this.width = this.sheetInfo.spriteWidth ?? TILE_SIZE;
    this.spriteSheetRow = this.sheetInfo.row ?? 0;
    this.spriteSheetCol = this.sheetInfo.col ?? 0;

    if (this.sheetInfo.random) {
      this.spriteSheetRow = randIntInRange(0, this.sheetInfo.height);
      this.spriteSheetCol = randIntInRange(0, this.sheetInfo.width);
    }

    this.callback = options.callback ?? (() => {});

    //if (options.debug) debugger;
    this.nocache = options.nocache ?? false;
    this.rotation = options.crop ? 0 : options.rotation;
    this.outline = options.outline;

    if (isColored) return;

    if (this.sheetInfo.src === undefined)
      throw new Error(`Sprite: No image path provided for sprite: ${typeName}`);

    this.processingImage = this.rotation !== undefined || this.outline !== undefined;

    const spriteKey = toKey(this.typeName, this.rotation, this.outline);

    if (!this.nocache && cachedSprites.has(spriteKey)) {
      const img = cachedSprites.get(spriteKey);
      if (!img) throw new Error(`Cached sprite image not found for key: ${spriteKey}`);
      this.img = img;

      if (this.img.complete) {
        // Image is already loaded
        if (this.processingImage) {
          this.spriteSheetCol = 0;
          this.spriteSheetRow = 0;
        }
        this.callback();
      } else {
        // We need to wait for the image to load
        const cacheCallback = cacheCallbacks.get(spriteKey);
        if (!cacheCallback) throw new Error(`Cache callbacks not found for key: ${spriteKey}`);
        cacheCallback.push(this.callback);
      }
      //console.log(`Cached: ${spriteKey}: ${this.img.src}`);
      return;
    }

    this.img = new Image();
    this.img.style.display = "block";
    //console.log(`---caching: ${spriteKey}`);
    cachedSprites.set(spriteKey, this.img);
    cacheCallbacks.set(spriteKey, [this.callback]);

    if (!this.processingImage) {
      this.img.onload = () => {
        cacheCallbacks.get(spriteKey)?.forEach((f) => f());
      };
      this.img.src = this.sheetInfo.src;
      return;
    }

    this.imageToProcess = new Image();

    this.imageToProcess.onload = () => {
      if (this.rotation !== undefined) {
        this.rotate((this.rotation * Math.PI) / 180, () => {
          if (this.outline) {
            this.drawOutline(this.img, () => {
              cacheCallbacks.get(spriteKey)?.forEach((f) => f());
            });
          } else cacheCallbacks.get(spriteKey)?.forEach((f) => f());
        });
      } else if (this.outline) {
        this.drawOutline(this.imageToProcess, () => {
          cacheCallbacks.get(spriteKey)?.forEach((f) => f());
        });
      }
    };
    this.imageToProcess.src = this.sheetInfo.src;
  }

  getSpriteHitboxInfo(
    options: Size = { width: this.width, height: this.height },
  ): SpriteHitboxInfo {
    if (!this.img?.complete) {
      throw new Error(`Attempt to getSpriteHitboxInfo of an unloaded sprite: ${this.typeName}`);
    }
    const { context: offContext } = createCanvas(options.width, options.height);
    this.draw(0, 0, offContext);

    let image = PixelImage.fromContext(offContext);

    /*
      startX and endX are respectively the smallest
      and the biggest X coordinates on which a non-transparent
      pixel can be found within the image
    */
    let startX, endX;
    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.height; ++y) {
        if (!image[x][y].isTransparent()) {
          startX = x;
          break;
        }
      }
      if (startX !== undefined) break;
    }

    for (let x = this.width - 1; x >= 0; --x) {
      for (let y = 0; y < this.height; ++y) {
        if (!image[x][y].isTransparent()) {
          endX = x;
          break;
        }
      }
      if (endX !== undefined) break;
    }

    /*
      endY is the biggest Y coordinate on which a non-transparent
      pixel can be found within the image.
      
      We do not look for startY because it does not have an important
      meaning when it comes to hitbox dimensions
    */
    let endY;
    for (let y = this.height - 1; y >= 0; --y) {
      for (let x = 0; x < this.width; ++x) {
        if (!image[x][y].isTransparent()) {
          endY = y;
          break;
        }
      }
      if (endY !== undefined) break;
    }

    /**
       The center pixel of the non-transparent sprite area
    */
    let centerPixel = ~~((startX + endX) / 2);
    return {
      centerPixel: centerPixel,
      startX: startX,
      endX: endX,
      endY: endY,
    };
  }

  /**
     Analyzes the sprite to guess the best values for
     the relativeCenterPoint and the boundingDistance.

     This is done by looking for the sprite's visual
     bounds (i.e. finding the first/last rows/columns where
     non-transparent pixels are located).
  */
  getSpriteHitboxInfoBaselineRcp(options?: Size): Point {
    const { centerPixel, endY } = this.getSpriteHitboxInfo(options);
    return { x: centerPixel, y: endY };
  }

  getSpriteHitboxInfoWithBoundingDistances(options?: Size): SpriteHitboxInfoWithBoundingDistances {
    const { centerPixel, endY, startX, endX } = this.getSpriteHitboxInfo(options);
    let boundingDistanceHeight = ~~(DEFAULT_HITBOX_HEIGHT / 2);

    /**
       Detected relative center point of the sprite
    */
    let rcp = { x: centerPixel, y: endY - boundingDistanceHeight };

    let hitboxWidth = endX - startX + 1;

    /**
       Amount of pixels subtracted from the hitbox's dimensions
       on the x-axis.
       See documentation for AUTO_BOUNDARY_X_LOOSENESS.
    */
    let looseness = ~~((AUTO_BOUNDARY_X_LOOSENESS * hitboxWidth) / 2);

    return {
      relativeCenterPoint: rcp,
      boundingDistance: {
        up: boundingDistanceHeight,
        down: boundingDistanceHeight,
        left: rcp.x - startX - looseness,
        right: endX - rcp.x - looseness,
      },
    };
  }

  rotate(angle: number, callback: () => void): void {
    const { canvas, context: offCtx } = createCanvas(this.width, this.height);
    offCtx.translate(this.width / 2, this.height / 2);
    offCtx.rotate(angle);
    offCtx.translate(-this.width / 2, -this.height / 2);

    offCtx.drawImage(
      this.imageToProcess,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width,
      this.height,
      0,
      0,
      this.width * this.scaleX,
      this.height * this.scaleY,
    );

    this.spriteSheetCol = 0;
    this.spriteSheetRow = 0;

    this.img.onload = callback;
    this.img.src = canvas.toDataURL("image/png");
  }

  drawOutline(image: HTMLImageElement, callback: () => void): void {
    let borderCoordinates = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];
    if (this.outline) {
      borderCoordinates.concat([
        { x: -1, y: -1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
      ]);
    }
    let color = { r: 255, g: 255, b: 255, a: 255 };
    const { canvas, context: offCtx } = createCanvas(this.width, this.height);
    offCtx.drawImage(
      image,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width,
      this.height,
      0,
      0,
      this.width * this.scaleX,
      this.height * this.scaleY,
    );

    this.spriteSheetCol = 0;
    this.spriteSheetRow = 0;

    let imgRef = PixelImage.fromContext(offCtx);
    let imgData = PixelImage.fromContext(offCtx);

    for (let y = 1; y < this.height - 1; ++y) {
      for (let x = 1; x < this.width - 1; ++x) {
        if (imgRef[x][y].isTransparent()) continue;

        borderCoordinates.forEach(({ x: dx, y: dy }) => {
          if (imgRef[x + dx][y + dy].isTransparent()) {
            imgData[x + dx][y + dy].setColor(color);
          }
        });
      }
    }
    imgData.drawToContext(offCtx);

    this.img.onload = callback;
    this.img.src = canvas.toDataURL("image/png");
  }

  /**
   * Draw the sprite on the #game-canvas
   * @param {number} x - Position x of the draw location
   * @param {number} y - Position y of the draw location
   */
  draw(
    x: number,
    y: number,
    context: CanvasRenderingContext2D | null = ctx,
    options: { innerOutline?: boolean } = {},
  ): void {
    if (!context) throw new Error("No context provided for drawing the sprite.");
    context.drawImage(
      this.img,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width,
      this.height,
      x,
      y,
      this.width * this.scaleX,
      this.height * this.scaleY,
    );
    if (options.innerOutline) {
      context.fillStyle = "black";
      context.fillRect(x, y, this.width * this.scaleX, 1);
    }
  }
  /**
   * Fill a rect over the region where the sprite is normally drawn
   */
  drawOverlay(
    x: number,
    y: number,
    fillStyle: string = "#00ffff22",
    context: CanvasRenderingContext2D | null = ctx,
  ): void {
    if (!context) throw new Error("No context provided for drawing the sprite overlay.");
    context.fillStyle = fillStyle;
    context.fillRect(x, y, this.width * this.scaleX, this.height * this.scaleY);
  }

  /**
   * Returns a string of arguments used to construct this sprite,
   * which can be used to compare sprites.
   */
  getRecipe(): string {
    return [
      this.typeName,
      this.scale,
      this.scaleX,
      this.scaleY,
      this.rotation,
      this.outline,
      this.nocache,
    ].join("|");
  }

  /**
   * Returns a string of the given arguments which can be used
   * to see if some sprite has the same recipe as the given one.
   */
  static createRecipe(...args): string {
    const typeName = args[0];
    const options = args[1];

    const scale = options.scale ?? SPRITE_SCALE;
    const scaleX = options.scaleX ?? scale;
    const scaleY = options.scaleY ?? scale;
    const rotation = options.crop ? 0 : options.rotation;
    const outline = options.outline;
    const nocache = options.nocache ?? false;

    return [typeName, scale, scaleX, scaleY, rotation, outline, nocache].join("|");
  }

  /**
   * Returns a readable description of the given recipe.
   */
  static getRecipeDescription(recipe: string): string {
    const [typeName, scale, scaleX, scaleY, rotation, outline, nocache] = recipe.split("|");

    const scaleDesc = `, scale:` + (scaleX === scaleY) ? `${scale}` : `(${scaleX}, ${scaleY})`;
    const rotationDesc = rotation ? `, rotation: ${rotation}` : ``;
    const outlineDesc = outline ? `, outline ${outline}` : ``;
    const nocacheDesc = nocache === "true" ? `, nocache` : ``;
    return `Sprite ${typeName}${scaleDesc}${rotationDesc}${outlineDesc}${nocacheDesc}`;
  }
}

export default Sprite;
