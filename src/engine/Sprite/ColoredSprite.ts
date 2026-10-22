import { ctx } from "@/engine/Browser";
import Sprite from "./Sprite";
import { createCanvas } from "@/lib/dom";
import { hexToRgb } from "@/lib/color";
import { PixelImage } from "@/lib/PixelImage";

/**
 * Create sprites to display grayscale-source sprites in color
 */
class ColoredSprite extends Sprite {
  color: string;
  canvas: HTMLCanvasElement;
  offscreenContext: CanvasRenderingContext2D;
  image: PixelImage;
  brightness: Uint8ClampedArray;
  alpha: Uint8ClampedArray;

  constructor(spriteName: Sprite["typeName"], updateCallback: () => void, options = {}) {
    super(spriteName, options);
    this.color = "#000000";
    const createdCanvas = createCanvas(this.width, this.height);
    this.canvas = createdCanvas.canvas;
    this.offscreenContext = createdCanvas.context;

    this.offscreenContext.drawImage(
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

    this.image = PixelImage.fromContext(this.offscreenContext);

    /*
      Brightness and alpha of pixels needs to be stores as the colors
      may be modified. Only their initial state is relevant.
     */
    this.brightness = new Uint8ClampedArray(this.image.pixelCount());
    this.alpha = new Uint8ClampedArray(this.image.pixelCount());

    for (let pixelIndex = 0; pixelIndex < this.image.pixelCount(); ++pixelIndex) {
      this.brightness[pixelIndex] = 255 - this.image.getDataAt(pixelIndex * 4);
      this.alpha[pixelIndex] = this.image.getDataAt(pixelIndex * 4 + 3);
    }
    this.img = new Image();
    this.img.onload = updateCallback;
    this.setColor("#00FF00");
  }
  setColor(colorHex: string, _areaID: number = 0) {
    let rgb = hexToRgb(colorHex);

    for (let pixelIndex = 0; pixelIndex < this.image.pixelCount(); ++pixelIndex) {
      if (this.image.pixel(pixelIndex).a === 0) continue;

      let brightness = this.brightness[pixelIndex];

      this.image.pixel(pixelIndex).setColor({
        r: rgb.r - brightness,
        g: rgb.g - brightness,
        b: rgb.b - brightness,
        a: this.alpha[pixelIndex],
      });
    }
    this.offscreenContext.clearRect(0, 0, this.width, this.height);

    this.image.drawToContext(this.offscreenContext);
    this.img.src = this.canvas.toDataURL("image/png");
  }
  override draw(x: number, y: number, context = ctx) {
    context.drawImage(this.img, x, y);
  }
}

export default ColoredSprite;
