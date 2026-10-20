import { PixelImage, type RGBA } from "@/utilities/PixelImage.js";
import { createCanvas } from "@/utilities/dom.js";
import { TOWN_PALETTE } from "@/global/consts.js";
import type { Point } from "@/utilities/utilities.js";

export type BuildingPreset = { gridPos: Point; xTiles: number; yTiles: number };
export type StreetPreset = { start: Point; width: number; height: number };
export type TownPreset = { buildings: BuildingPreset[]; streets: StreetPreset[] };
type Palette = Record<string, Partial<RGBA>>;

let newBuilding = (x1: number, y1: number, x2: number, y2: number): BuildingPreset => ({
  gridPos: { x: x1, y: y1 },
  xTiles: x2,
  yTiles: y2,
});
let newStreet = (x1: number, y1: number, width: number, height: number): StreetPreset => ({
  start: { x: x1, y: y1 },
  width: width,
  height: height,
});

const preset1: TownPreset = {
  buildings: [
    newBuilding(27, 1, 5, 3),
    newBuilding(21, 7, 4, 3),
    newBuilding(22, 1, 3, 3),
    newBuilding(27, 7, 3, 3),
    newBuilding(32, 2, 3, 2),
    newBuilding(27, 12, 3, 3),
    newBuilding(20, 12, 5, 3),
    newBuilding(18, 2, 4, 2),
    newBuilding(16, 7, 4, 3),
    newBuilding(15, 2, 3, 2),
  ],
  streets: [
    newStreet(0, 4, 42, 2),
    newStreet(25, 0, 2, 20),
    newStreet(27, 10, 4, 1),
    newStreet(27, 15, 4, 1),
    newStreet(19, 15, 6, 1),
    newStreet(15, 10, 10, 1),
  ],
};

const preset2: TownPreset = {
  buildings: [
    newBuilding(19, 2, 5, 3),
    newBuilding(15, 10, 4, 3),
    //newBuilding(22, 12, 5, 2),
    newBuilding(16, 5, 3, 3),
    newBuilding(24, 3, 3, 2),
    newBuilding(22, 8, 3, 2),
    newBuilding(28, 3, 3, 2),
    newBuilding(12, 11, 3, 2),
    newBuilding(8, 11, 3, 2),
    newBuilding(31, 2, 3, 3),
  ],
  streets: [
    newStreet(19, 5, 3, 9),
    newStreet(0, 13, 22, 2),
    newStreet(20, 5, 22, 2),
    newStreet(15, 8, 4, 1),
    newStreet(22, 14, 6, 1),
    newStreet(22, 10, 3, 1),
  ],
};

const preset3: TownPreset = {
  buildings: [
    newBuilding(13, 3, 4, 3),
    newBuilding(17, 3, 5, 3),
    newBuilding(21, 10, 3, 2),
    newBuilding(22, 4, 4, 2),
    newBuilding(26, 4, 3, 2),
    newBuilding(28, 10, 3, 2),
    newBuilding(24, 10, 3, 2),
    newBuilding(14, 10, 4, 3),
    newBuilding(9, 4, 3, 2),
    newBuilding(30, 4, 3, 2),
    newBuilding(5, 4, 3, 2),
    newBuilding(33, 4, 3, 2),
  ],
  streets: [
    newStreet(0, 6, 42, 3),
    newStreet(18, 9, 3, 12),
    newStreet(13, 13, 5, 1),
    newStreet(21, 12, 10, 1),
  ],
};

const preset4: TownPreset = {
  buildings: [
    newBuilding(20, 9, 5, 3),
    newBuilding(16, 9, 4, 3),
    newBuilding(25, 5, 4, 2),
    newBuilding(12, 10, 3, 2),
    newBuilding(25, 9, 4, 3),
    newBuilding(16, 5, 3, 2),
    newBuilding(20, 4, 4, 3),
    newBuilding(10, 4, 3, 3),
    newBuilding(13, 5, 3, 2),
    newBuilding(32, 10, 4, 2),
    newBuilding(8, 10, 3, 2),
  ],
  streets: [
    newStreet(0, 12, 42, 3),
    newStreet(30, 0, 2, 12),
    newStreet(10, 7, 20, 1),
    newStreet(15, 7, 1, 5),
  ],
};

const preset5: TownPreset = {
  buildings: [
    //newBuilding(16, 11, 5, 2),
    //newBuilding(21, 11, 5, 2),
    newBuilding(11, 6, 3, 3),
    newBuilding(28, 6, 3, 3),
    newBuilding(28, 11, 3, 2),
    newBuilding(16, 6, 3, 3),
    newBuilding(5, 6, 3, 3),
    //newBuilding(7, 2, 5, 2),
    //newBuilding(7, 11, 5, 2),
    newBuilding(16, 1, 3, 3),
    //newBuilding(31, 7, 5, 2),
    newBuilding(36, 11, 3, 2),
    newBuilding(36, 6, 3, 3),
    //newBuilding(31, 2, 5, 2)
  ],
  streets: [
    newStreet(6, 4, 21, 1),
    newStreet(27, 4, 10, 1),
    newStreet(4, 9, 23, 1),
    newStreet(27, 9, 13, 1),
    newStreet(0, 13, 42, 2),
    newStreet(9, 5, 1, 5),
    newStreet(13, 10, 1, 5),
    newStreet(27, 5, 1, 5),
    newStreet(33, 10, 1, 5),
  ],
};

const preset6: TownPreset = {
  buildings: [
    newBuilding(20, 4, 5, 3),
    newBuilding(16, 4, 4, 3),
    newBuilding(25, 4, 5, 3),
    newBuilding(20, 11, 5, 3),
    newBuilding(25, 12, 4, 2),
    newBuilding(30, 4, 3, 3),
    newBuilding(16, 11, 3, 3),
    newBuilding(12, 5, 3, 2),
    newBuilding(12, 12, 4, 2),
    newBuilding(29, 11, 3, 3),
    newBuilding(34, 5, 3, 2),
  ],
  streets: [newStreet(0, 7, 42, 3), newStreet(10, 14, 30, 2), newStreet(19, 10, 1, 4)],
};

const preset7: TownPreset = {
  buildings: [
    newBuilding(18, 7, 5, 3),
    newBuilding(23, 7, 4, 3),
    newBuilding(27, 7, 3, 3),
    newBuilding(20, 14, 5, 3),
    newBuilding(14, 8, 4, 2),
    //newBuilding(15, 3, 5, 2),
    newBuilding(16, 14, 4, 3),
    newBuilding(26, 15, 4, 2),
    newBuilding(30, 14, 3, 3),
    newBuilding(20, 3, 3, 2),
    newBuilding(10, 8, 3, 2),
    newBuilding(31, 8, 3, 2),
  ],
  streets: [
    newStreet(14, 5, 10, 1),
    newStreet(0, 10, 42, 3),
    newStreet(15, 17, 20, 1),
    newStreet(13, 5, 1, 5),
    newStreet(25, 13, 1, 4),
  ],
};

const preset8: TownPreset = {
  buildings: [
    newBuilding(10, 7, 5, 3),
    newBuilding(15, 7, 4, 3),
    newBuilding(16, 2, 4, 3),
    newBuilding(12, 14, 5, 3),
    newBuilding(17, 14, 3, 3),
    newBuilding(20, 7, 4, 3),
    newBuilding(22, 14, 4, 3),
    newBuilding(21, 3, 3, 2),
    newBuilding(24, 8, 3, 2),
    newBuilding(28, 8, 4, 2),
    newBuilding(7, 8, 3, 2),
    newBuilding(32, 8, 3, 2),
  ],
  streets: [
    newStreet(0, 10, 42, 3),
    newStreet(15, 5, 10, 1),
    newStreet(19, 5, 1, 5),
    newStreet(20, 13, 2, 4),
    newStreet(11, 17, 16, 1),
  ],
};

const preset9: TownPreset = {
  buildings: [
    newBuilding(10, 7, 4, 3),
    newBuilding(27, 7, 5, 3),
    newBuilding(14, 7, 3, 3),
    newBuilding(20, 7, 4, 3),
    newBuilding(17, 8, 3, 2),
    newBuilding(24, 8, 3, 2),
    newBuilding(32, 8, 3, 2),
    newBuilding(7, 8, 3, 2),
    newBuilding(36, 8, 3, 2),
    newBuilding(3, 8, 3, 2),
    newBuilding(39, 8, 3, 2),
  ],
  streets: [newStreet(0, 10, 42, 3)],
};

/**
 * Class responsible from parsing an image (presumably) of a town
 * and creating a location out of it. colors of buildings, street and background
 * are described in the "townPaletter" constant variable.
 */
export class LocationInfo {
  preset: TownPreset;

  constructor() {
    this.preset = {
      buildings: [],
      streets: [],
    };
  }

  /**
   * Helper function to mark pixels on a check matrix
   * if there was a bulding in this pixel.
   *
   * @param x - horizontal pixel
   * @param y - vertical pixel
   * @param dx - offset from x (width)
   * @param dy - offset from y (height)
   * @param matrix - binary matrix to set fields to ones
   */
  private markAsChecked(x: number, y: number, dx: number, dy: number, matrix: number[][]): void {
    for (let j = y; j <= dy + y; j++) {
      for (let i = x; i <= dx + x; i++) {
        matrix[i][j] = 1;
      }
    }
  }

  /**
   * Helper function to create newBuilding and/or newStreet
   * and populate the preset field with buildings and streets.
   *
   * @param x - horizontal pixel
   * @param y - vertical pixel
   * @param image - image to be processed
   * @param palette - color pallete to process buildings and streets
   * @param matrix - binary matrix to set fields to ones
   */
  private createBuilding(
    x: number,
    y: number,
    image: PixelImage,
    palette: Palette,
    matrix: number[][],
  ): void {
    for (const color of Object.keys(palette)) {
      if (!image[x][y].isColor(palette[color])) continue;

      let objWidth = 0;
      let objHeight = 0;

      while (image[x + objWidth][y].isColor(palette[color]) && x + objWidth < image.width - 1)
        objWidth++;
      while (image[x][y + objHeight].isColor(palette[color]) && y + objHeight < image.height - 1)
        objHeight++;

      this.markAsChecked(x, y, objWidth, objHeight, matrix);
      if (color === "street") this.preset.streets.push(newStreet(x, y, objWidth, objHeight));
      else this.preset.buildings.push(newBuilding(x, y, objWidth, objHeight));
    }
  }

  /**
   * Helper function to iterate over given image and check against matrix
   * if the function can continue.
   *
   * @param image - image to be processed
   * @param matrix - binary matrix to set fields to ones
   * @param palette - color pallete to process buildings and streets
   */
  private createLocation(image: PixelImage, matrix: number[][], palette: Palette): void {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        if (matrix[x][y]) continue;
        this.createBuilding(x, y, image, palette, matrix);
      }
    }
  }

  /**
   * Function to load image from path "src" and parse it into a location.
   *
   * @param src - path to image to be parsed.
   */
  loadImage(src: string): void {
    let presetImg = new Image();
    presetImg.src = src;
    presetImg.onload = () => {
      const { context: offContext } = createCanvas(presetImg.width, presetImg.height);
      offContext.drawImage(presetImg, 0, 0);
      const checkMatrix = Array.from({ length: presetImg.width }, () =>
        Array.from({ length: presetImg.height }, () => 0),
      );
      let image = PixelImage.fromContext(offContext);
      this.createLocation(image, checkMatrix, TOWN_PALETTE);
    };
  }
}

let presets: TownPreset[] = [
  preset1,
  preset2,
  preset3,
  preset4,
  preset5,
  preset6,
  preset7,
  preset8,
  preset9,
];
export default presets;
