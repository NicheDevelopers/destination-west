/*
  file: src/static/imgInfo.js
  purpose: describe spirtesheets that come with the game
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Michał Miłek <https://gitlab.com/mmilek>
  
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
import { TILE_SIZE } from "@/global/consts.js";

export type AnimationName = "idle" | "run";

export interface AnimationInfo {
  name: AnimationName;
  row: number;
  frames: number;
  mirroredRow?: number;
}

export interface ImageInfoType {
  src: string;
  width: number;
  height: number;
  row?: number;
  col?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  defaultAnimation?: AnimationName;
  animations?: Map<AnimationName, AnimationInfo>;
  random?: boolean;
  nocollision?: boolean;
  nodepth?: boolean;
}

function createImage(
  src: ImageInfoType["src"],
  height: ImageInfoType["height"] = TILE_SIZE,
  width: ImageInfoType["width"] = TILE_SIZE,
  row: ImageInfoType["row"] = 0,
  col: ImageInfoType["col"] = 0,
  spriteHeight?: ImageInfoType["spriteHeight"],
  spriteWidth?: ImageInfoType["spriteWidth"],
  defaultAnimation?: AnimationName,
  animations?: Map<AnimationName, AnimationInfo>,
  random?: boolean,
  nocollision?: boolean,
  nodepth?: boolean,
): ImageInfoType {
  return {
    src: src,
    width: width,
    height: height,
    row: row,
    col: col,
    spriteHeight: spriteHeight,
    spriteWidth: spriteWidth,
    defaultAnimation: defaultAnimation,
    animations: animations,
    random: random,
    nocollision: nocollision,
    nodepth: nodepth,
  };
}

const spriteSheetOptions = new Map([
  ["nc", "no collisions"],
  ["nd", "no depth"],
]);
export interface SpritesheetOptions {
  defaultAnimation?: AnimationName;
  animations?: Map<AnimationName, AnimationInfo>;
  random?: boolean;
  spriteWidth?: number;
  spriteHeight?: number;
}

class Spritesheet {
  private path: string;
  private width: number;
  private height: number;
  private spriteWidth: number;
  private spriteHeight: number;
  private elements: string[];
  private options: SpritesheetOptions;

  constructor(
    path: string,
    width: number,
    height: number,
    elements: string[],
    options: SpritesheetOptions = {},
  ) {
    if (width * height < elements.length)
      throw new Error(
        `Spritesheet element count is greater ` +
          `than the specified spritesheet size (${path})\n` +
          `Size: ${width * height} (${width}*${height})\n` +
          `Numer of elements: ${elements.length}`,
      );
    this.path = path;
    this.width = width;
    this.height = height;
    this.spriteWidth = options.spriteWidth ?? TILE_SIZE;
    this.spriteHeight = options.spriteHeight ?? TILE_SIZE;
    /**
       Array of strings created according to the following format:
       "spriteName"[_nc][_nd]
       
       Legend:
       "value" - user provided, nonliteral value
       [value] - optional flag, literally named value
    */
    this.elements = elements;
    this.options = options;
  }
  saveToMap(map: Map<string, ImageInfoType>): void {
    let x = 0,
      y = 0;
    for (let e of this.elements) {
      let args = Array.from(spriteSheetOptions.keys())
        .map((arg) => ({ argument: arg, position: e.indexOf(`_${arg}`) }))
        .filter((arg) => arg.position !== -1);

      let argumentStartIndex = args.minBy("position")?.position ?? Infinity;

      e = e.substring(0, argumentStartIndex);
      map.set(e, {
        src: this.path,
        width: this.spriteWidth,
        height: this.spriteHeight,
        row: y,
        col: x,
        defaultAnimation: this.options.defaultAnimation,
        animations: this.options.animations,
        random: this.options.random,
        nocollision: args.some((arg) => arg.argument === "nc"),
        nodepth: args.some((arg) => arg.argument === "nd"),
      });
      x++;
      if (x === this.width) {
        x = 0;
        y++;
      }
    }
  }
}

/**
 Map describing spritesheets that come with the game
*/
const imgInfo: Map<string, ImageInfoType> = new Map([
  ["jacket", createImage("img/clothes.png", TILE_SIZE, TILE_SIZE, 0, 0)],
  ["pants", createImage("img/clothes.png", TILE_SIZE, TILE_SIZE, 0, 1)],
  ["barrel", createImage("img/barrel.png")],
  ["chuck-a-luck-table", createImage("img/chuck-a-luck-table.png")],
  ["32_kaktus4", createImage("img/32_kaktus4.png")],
  ["torso", createImage("img/torso.png")],
  [
    "bank-3x2",
    createImage(
      "img/bank-3x2.png",
      TILE_SIZE * 2,
      TILE_SIZE * 3,
      0,
      0,
      TILE_SIZE * 2,
      TILE_SIZE * 3,
    ),
  ],
  [
    "bank-4x2",
    createImage(
      "img/bank-4x2.png",
      TILE_SIZE * 2,
      TILE_SIZE * 4,
      0,
      0,
      TILE_SIZE * 2,
      TILE_SIZE * 4,
    ),
  ],
  [
    "bank-3x3",
    createImage(
      "img/bank-3x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 3,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 3,
    ),
  ],
  [
    "bank-4x3",
    createImage(
      "img/bank-4x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 4,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 4,
    ),
  ],
  [
    "bank-5x3",
    createImage(
      "img/bank-5x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 5,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 5,
    ),
  ],
  [
    "bank-3x2",
    createImage(
      "img/bank-3x2.png",
      TILE_SIZE * 2,
      TILE_SIZE * 3,
      0,
      0,
      TILE_SIZE * 2,
      TILE_SIZE * 3,
    ),
  ],
  [
    "bank-4x2",
    createImage(
      "img/bank-4x2.png",
      TILE_SIZE * 2,
      TILE_SIZE * 4,
      0,
      0,
      TILE_SIZE * 2,
      TILE_SIZE * 4,
    ),
  ],
  [
    "bank-3x3",
    createImage(
      "img/bank-3x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 3,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 3,
    ),
  ],
  [
    "bank-4x3",
    createImage(
      "img/bank-4x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 4,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 4,
    ),
  ],
  [
    "bank-5x3",
    createImage(
      "img/bank-5x3.png",
      TILE_SIZE * 3,
      TILE_SIZE * 5,
      0,
      0,
      TILE_SIZE * 3,
      TILE_SIZE * 5,
    ),
  ],
  [
    "player",
    createImage(
      "img/player.png",
      74,
      100,
      0,
      0,
      74,
      100,
      "idle",
      new Map([
        ["idle", { name: "idle", row: 0, frames: 3, mirroredRow: 1 }],
        ["run", { name: "run", row: 2, frames: 6, mirroredRow: 3 }],
      ]),
    ),
  ],
  // [
  //   "player",
  //   {
  //     src: "img/player.png",
  //     spriteHeight: 74,
  //     spriteWidth: 100,
  //     defaultAnimation: "idle",
  //     animations: new Map([
  //       [
  //         "idle",
  //         {
  //           name: "idle",
  //           row: 0,
  //           frames: 3,
  //           mirroredRow: 1,
  //         },
  //       ],
  //       [
  //         "run",
  //         {
  //           name: "run",
  //           row: 2,
  //           frames: 6,
  //           mirroredRow: 3,
  //         },
  //       ],
  //     ]),
  //   },
  // ],
]);

const townPropList = [
  "street",
  "sand",
  "decoration-small-stones-1_nc_nd",
  "decoration-cactus-1x",
  "decoration-roadsign",
  "decoration-stone-well",
  "decoration-big-bag-3x",
  "decoration-green-bush-1_nc",
];
const townPropSheet = new Spritesheet("img/town-props.png", 3, 3, townPropList);

const itemsList = ["apple", "cigar", "revolver-1", "revolver-2", "broken-bottle", "whisky"];
const itemsSheet = new Spritesheet("img/items.png", 6, 1, itemsList);

const pathTypeList = [
  "path-narrow-side-1",
  "path-narrow-side-2",
  "path-narrow-side-3",
  "path-narrrow-corner-1",
  "path-narrrow-corner-2",
  "path-narrow-end-1",
  "path-narrow-end-2",
  "path-narrow-fork-1",
  "path-narrow-fork-2",
  "path-narrow-crossroad-1",
  "path-narrow-crossroad-2",
  "path-wide-full-1",
  "path-wide-inner-corner-1",
  "path-wide-inner-corner-2",
  "path-wide-side-1",
  "path-wide-side-2",
  "path-wide-corner-1",
  "path-wide-corner-2",
];
const pathSheet = new Spritesheet("img/path.png", 18, 1, pathTypeList);

townPropSheet.saveToMap(imgInfo);
pathSheet.saveToMap(imgInfo);
itemsSheet.saveToMap(imgInfo);

export interface BuildingPart {
  name: string;
  col: number;
  row: number;
}
export function newBuildingPart(name: string, col: number, row: number): BuildingPart {
  return { name: name, col: col, row: row };
}
let buildingParts = [
  newBuildingPart("leftwallwindow", 0, 2),
  newBuildingPart("leftwall", 1, 2),
  newBuildingPart("door", 2, 2),
  newBuildingPart("window", 3, 2),
  newBuildingPart("wall", 4, 2),
  newBuildingPart("rightwall", 5, 2),
  newBuildingPart("rightwallwindow", 6, 2),

  newBuildingPart("upleftwallwindow", 0, 1),
  newBuildingPart("upleftwall", 1, 1),
  newBuildingPart("updoor", 2, 1),
  newBuildingPart("upwindow", 3, 1),
  newBuildingPart("upwall", 4, 1),
  newBuildingPart("uprightwall", 5, 1),
  newBuildingPart("uprightwallwindow", 6, 1),

  newBuildingPart("leftroof", 1, 0),
  newBuildingPart("roof", 2, 0),
  newBuildingPart("sign", 3, 0),
  newBuildingPart("rightroof", 4, 0),

  newBuildingPart("leftpedestal", 1, 3),
  newBuildingPart("doorpedestal", 2, 3),
  newBuildingPart("pedestal", 3, 3),
  newBuildingPart("rightpedestal", 4, 3),
];
let buildings = ["sheriff", "house", "saloon"];

buildings.forEach((building) => {
  buildingParts.forEach((buildingPart) => {
    imgInfo.set("building-" + building + "-" + buildingPart.name, {
      src: "img/bank.png",
      height: TILE_SIZE,
      width: TILE_SIZE,
      row: buildingPart.row,
      col: buildingPart.col,
    });
  });
});

export default imgInfo;
