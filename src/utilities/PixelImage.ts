import { TRANSPARENCY_ALPHA_TOLERANCE } from "../global/consts.js";
import "./utilities.js"; // String prototype extensions

/**
 * Informs whether a pixel with a given alpha should
 * be considered transparent
 */
export function transparent(alpha: number): boolean {
  return alpha < TRANSPARENCY_ALPHA_TOLERANCE;
}

export type RGBA = { r: number; g: number; b: number; a: number };

/**
 * An accessor object for reading and modifying pixels in PixelImages
 */
class Pixel {
  img: PixelImage;
  index: number;

  constructor(parentImage: Pixel["img"], pixelIndex: Pixel["index"]) {
    this.img = parentImage;
    this.index = pixelIndex;
  }
  /**
   * Sets the pixel's color components accordint to the provided object
   * @param color {RGBA} - An object with r, g, b, a keys
   * @example
   * pixel.setColor({r: 255});
   * // sets the red component of the pixel's color to the maximum value
   * @example
   * pixel.setColor({r: 0, g: 255, b: 0, a: 255});
   * // sets the pixel's color to green
   */
  setColor(color: Partial<RGBA>): void {
    for (const comp of Object.keys(color) as Array<keyof RGBA>) {
      const value = color[comp];
      if (value !== undefined) this[comp] = value;
    }
  }
  get r(): number {
    return this.img.imgData.data[this.index];
  }
  get g(): number {
    return this.img.imgData.data[this.index + 1];
  }
  get b(): number {
    return this.img.imgData.data[this.index + 2];
  }
  get a(): number {
    return this.img.imgData.data[this.index + 3];
  }

  set r(val: number) {
    this.img.imgData.data[this.index] = val;
  }
  set g(val: number) {
    this.img.imgData.data[this.index + 1] = val;
  }
  set b(val: number) {
    this.img.imgData.data[this.index + 2] = val;
  }
  set a(val: number) {
    this.img.imgData.data[this.index + 3] = val;
  }

  /**
   * Informs whether the pixel should be considered transparent
   */
  isTransparent(): boolean {
    return transparent(this.a);
  }

  isColor(color: Partial<RGBA>): boolean {
    for (const comp of Object.keys(color) as Array<keyof RGBA>) {
      if (this[comp] !== color[comp]) return false;
    }
    return true;
  }
}

/**
 * A Proxy wrapper for the ImageData interface.
 */
export class PixelImage {
  [column: number]: Record<number, Pixel>;
  width: number;
  height: number;
  imgData: ImageData;

  constructor(width: number, height: number, imgData: ImageData) {
    this.width = width;
    this.height = height;
    this.imgData = imgData;

    return new Proxy(this, { get: PixelImage.get, set: PixelImage.set });
  }

  static fromContext(ctx: CanvasRenderingContext2D): PixelImage {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    return new PixelImage(width, height, imgData);
  }

  fromCanvas(canvas: HTMLCanvasElement): PixelImage {
    this.width = canvas.width;
    this.height = canvas.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context not available");
    this.imgData = context.getImageData(0, 0, this.width, this.height);
    return this;
  }

  drawToContext(ctx: CanvasRenderingContext2D): void {
    if (!this.imgData) throw new Error(`Attempt to draw unloaded PixelImage`);
    ctx.putImageData(this.imgData, 0, 0);
  }

  /**
   * Print a simplified text representation of the image
   * to the console.
   */
  log(): void {
    let out = "";
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        out += transparent(this[x][y].a) ? " " : "X";
      }
      out += "\n";
    }
    console.log(out);
  }

  /**
   * Get the number of pixels in the image
   * @returns The number of pixels or null if no image was loaded
   */
  pixelCount(): number {
    return this.width * this.height;
  }

  /**
   * Get ImagaData entries with bound checking
   */
  getDataAt(index: number): number {
    if (index < 0 || index > this.width * this.height * 4)
      throw new Error(`getDataAt: index is out of bounds (${index})`);
    return this.imgData.data[index];
  }

  /**
   * Set ImagaData entries with bound checking
   */
  setDataAt(index: number, val: number): void {
    if (!this.imgData) throw new Error(`Attempt to write pixel data in unloaded PixelImage`);
    if (index < 0 || index > this.width * this.height * 4)
      throw new Error(`setDataAt: index is out of bounds (${index})`);
    this.imgData.data[index] = val;
  }

  pixel(index: number): Pixel {
    return this[index % this.width][(index / this.width) | 0];
  }

  /**
   * The get handler of the PixelImage Proxy
   * @this {void}
   */
  static get(self: PixelImage, prop: string | symbol, _receiver: unknown) {
    if (typeof prop === "symbol" || !prop.isNumber())
      return Reflect.get(self, prop, _receiver as object);
    let col = prop.toNumber();
    if (col < 0 || col >= self.width)
      throw new Error(
        `Attempt to read pixel from column ${col} ` + `in ${self.width}px width image`,
      );

    return new Proxy(self, {
      get: PixelImage.colGet(col),
      set: PixelImage.colSet,
    });
  }

  /**
   * The set handler of the PixelImage Proxy
   * @this {void}
   */
  static set(_self: PixelImage, prop: string | symbol, _val: unknown, _receiver: unknown) {
    if (typeof prop === "string" && prop.isNumber())
      throw new Error(`Direct assignment to PixelImage column is forbidden`);

    return Reflect.set(_self, prop, _val, _receiver);
  }

  /**
   * A get handler for column proxies returned by the top-level
   * PixelImage Proxy
   */
  static colGet(col: number) {
    return (self: PixelImage, prop: string | symbol, _receiver: unknown): Pixel => {
      if (typeof prop === "symbol" || !prop.isNumber())
        throw new Error(`Given image row is not a number: ${String(prop)}`);
      const row = prop.toNumber();
      if (row < 0 || row >= self.height)
        throw new Error(
          `Attempt to read pixel from row ${row} ` + `in ${self.height}px height image`,
        );
      let pixelIndex = (col + row * self.width) * 4;

      return new Pixel(self, pixelIndex);
    };
  }

  /**
   * A set handler for column proxies returned by the top-level
   * PixelImage Proxy
   * @this {void}
   */
  static colSet(
    _self: PixelImage,
    _prop: string | symbol,
    _val: unknown,
    _receiver: unknown,
  ): boolean {
    throw new Error(
      `Direct assignment to PixelImage's Pixel is forbidden.` +
        ` Use methods of the Pixel object instead.`,
    );
  }
}
