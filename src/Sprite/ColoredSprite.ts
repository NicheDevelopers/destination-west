import { ctx } from "@/core/Browser.js";
import Sprite from "./Sprite.js";
import { createCanvas } from "@/utilities/dom.js";
import { hexToRgb } from "@/utilities/color.js";
import { PixelImage } from "@/utilities/PixelImage.js";

/**
 * Create sprites to display grayscale-source sprites in color
 */
class ColoredSprite extends Sprite {
  color: string;
  canvas: HTMLCanvasElement;
  offCtx: CanvasRenderingContext2D;
  image: PixelImage;
  brightness: Uint8ClampedArray;
  alpha: Uint8ClampedArray;

  constructor(spriteName: Sprite["typeName"], updateCallback: () => void, options = {}) {
    super(spriteName, options);
    this.color = "#000000";
    const createdCanvas = createCanvas(this.width, this.height);
    this.canvas = createdCanvas.canvas;
    this.offCtx = createdCanvas.context;

    this.offCtx.drawImage(
      this.img,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width,
      this.height,
      0,
      0,
      this.width * this.scaleX,
      this.height * this.scaleY,
    );

    this.image = PixelImage.fromContext(this.offCtx);

    /*
      Brightness and alpha of pixels needs to be stores as the colors
      may be modified. Only their initial state is relevant.
     */
    this.brightness = new Uint8ClampedArray(this.image.pixelCount());
    this.alpha = new Uint8ClampedArray(this.image.pixelCount());

    for (let x = 0; x < this.image.pixelCount(); ++x) {
      this.brightness[x] = 255 - this.image.getDataAt(x * 4);
      this.alpha[x] = this.image.getDataAt(x * 4 + 3);
    }
    this.img = new Image();
    this.img.onload = updateCallback;
    this.setColor("#00FF00");
  }
  setColor(colorHex: string, _areaID: number = 0) {
    let rgb = hexToRgb(colorHex);

    for (let x = 0; x < this.image.pixelCount(); ++x) {
      if (this.image.pixel(x).a === 0) continue;

      let br = this.brightness[x];

      this.image.pixel(x).setColor({
        r: rgb.r - br,
        g: rgb.g - br,
        b: rgb.b - br,
        a: this.alpha[x],
      });
    }
    this.offCtx.clearRect(0, 0, this.width, this.height);

    this.image.drawToContext(this.offCtx);
    this.img.src = this.canvas.toDataURL("image/png");
  }
  draw(x: number, y: number, context = ctx) {
    context.drawImage(this.img, x, y);
  }
}

export default ColoredSprite;
