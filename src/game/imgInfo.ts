import { SAND_VARIANTS, TILE_SIZE } from "@/engine/consts";
import type { AnimationInfo, AnimationName, ImageInfoType } from "@/engine/Sprite/imgInfo";
import { pathShapes, pathTileName } from "@/game/Location/path-tiles";

// How often a run cycle lets the hat fly up once and land a frame late
const HAT_JUMP_CHANCE = 0.15;

function uniformDurations(frameCount: number, duration: number): number[] {
  return Array.from({ length: frameCount }, () => duration);
}

/**
 * A dev treadmill sheet: "walk" moves the belt 1 art pixel per frame, left or down;
 * the treadmill plays it backwards for the other way, and holds it still when idle.
 * A flat sheet is walked over and drawn under everything; the standing wheel is
 * drawn by depth and has a hitbox.
 */
function treadmillInfo(
  name: string,
  width: number,
  height: number,
  frameCount: number,
  flat = true,
): [string, ImageInfoType] {
  const src = `img/${name}.png`;
  return [
    name,
    {
      src,
      width,
      height,
      spriteWidth: width,
      spriteHeight: height,
      nocollision: flat,
      nodepth: flat,
      defaultAnimation: "walk",
      animations: new Map<AnimationName, AnimationInfo>([
        [
          "walk",
          { name: "walk", src, frameDurations: uniformDurations(frameCount, 100), groundSpeed: 10 },
        ],
      ]),
    },
  ];
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
    let col = 0,
      row = 0;
    for (const element of this.elements) {
      let args = Array.from(spriteSheetOptions.keys())
        .map((arg) => ({ argument: arg, position: element.indexOf(`_${arg}`) }))
        .filter((arg) => arg.position !== -1);

      let argumentStartIndex = args.minBy("position")?.position ?? Infinity;

      const spriteName = element.substring(0, argumentStartIndex);
      map.set(spriteName, {
        src: this.path,
        width: this.spriteWidth,
        height: this.spriteHeight,
        row,
        col,
        defaultAnimation: this.options.defaultAnimation,
        animations: this.options.animations,
        random: this.options.random,
        nocollision: args.some((arg) => arg.argument === "nc"),
        nodepth: args.some((arg) => arg.argument === "nd"),
      });
      col++;
      if (col === this.width) {
        col = 0;
        row++;
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
  ["torso", createImage("img/torso.png")],
  [
    // Side sheets exported from docs/art-pipeline/Gunslinger_order, the art faces right.
    // North (back) and south (front) sheets come from docs/art-pipeline/directions.
    "player",
    {
      src: "img/gunslinger/idle.png",
      width: 32,
      height: 32,
      spriteWidth: 32,
      spriteHeight: 32,
      mirrorAxis: 15.5,
      defaultAnimation: "idle",
      animations: new Map([
        [
          "idle",
          {
            name: "idle",
            src: "img/gunslinger/idle.png",
            // Rested breathing holds the exhaled pose (first frame) for two frames
            frameDurations: [400, 200, 200, 200, 200],
            outOfBreathFrameDurations: uniformDurations(5, 200),
          },
        ],
        [
          "walk",
          {
            name: "walk",
            src: "img/gunslinger/walk.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 30,
          },
        ],
        [
          "run",
          {
            name: "run",
            src: "img/gunslinger/run.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 65,
            rareVariant: { src: "img/gunslinger/run-hat.png", chance: HAT_JUMP_CHANCE },
          },
        ],
        [
          "idle-north",
          {
            name: "idle-north",
            src: "img/gunslinger/idle-north.png",
            frameDurations: [400, 200, 200, 200, 200],
            outOfBreathFrameDurations: uniformDurations(5, 200),
            flipsWhenMirrored: false,
          },
        ],
        [
          "idle-south",
          {
            name: "idle-south",
            src: "img/gunslinger/idle-south.png",
            frameDurations: [400, 200, 200, 200, 200],
            outOfBreathFrameDurations: uniformDurations(5, 200),
            flipsWhenMirrored: false,
          },
        ],
        [
          "walk-north",
          {
            name: "walk-north",
            src: "img/gunslinger/walk-north.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 30,
            flipsWhenMirrored: false,
          },
        ],
        [
          "walk-south",
          {
            name: "walk-south",
            src: "img/gunslinger/walk-south.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 30,
            flipsWhenMirrored: false,
          },
        ],
        [
          "run-north",
          {
            name: "run-north",
            src: "img/gunslinger/run-north.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 65,
            rareVariant: { src: "img/gunslinger/run-north-hat.png", chance: HAT_JUMP_CHANCE },
            flipsWhenMirrored: false,
          },
        ],
        [
          "run-south",
          {
            name: "run-south",
            src: "img/gunslinger/run-south.png",
            frameDurations: uniformDurations(8, 100),
            groundSpeed: 65,
            rareVariant: { src: "img/gunslinger/run-south-hat.png", chance: HAT_JUMP_CHANCE },
            flipsWhenMirrored: false,
          },
        ],
        [
          "death",
          {
            name: "death",
            src: "img/gunslinger/death.png",
            frameDurations: uniformDurations(26, 90),
            loop: false,
          },
        ],
      ]),
    },
  ],
  // Dev treadmill (dev-setup.ts)
  treadmillInfo("treadmill-horizontal", 80, 32, 16),
  treadmillInfo("treadmill-vertical", 48, 64, 16),
  treadmillInfo("treadmill-horizontal-wheel", 80, 32, 16, false),
  treadmillInfo("treadmill-vertical-wheel", 48, 64, 16, false),
]);

const townPropList = ["decoration-roadsign", "decoration-stone-well", "decoration-big-bag-3x"];
const townPropSheet = new Spritesheet("img/town-props.png", 3, 1, townPropList);

const itemsList = ["apple", "cigar", "revolver-1", "revolver-2", "broken-bottle", "whisky"];
const itemsSheet = new Spritesheet("img/items.png", 6, 1, itemsList);

const rockList = [
  "decoration-pebbles-1_nc_nd",
  "decoration-rock-small-1",
  "decoration-rock-banded-1",
  "decoration-rock-ledge-1",
  "decoration-hoodoo-1",
  "decoration-rock-split-1",
  "decoration-rock-rubble-1",
  "decoration-rock-slab-1_nc_nd",
  "decoration-rock-boulders-1",
];
const rockSheet = new Spritesheet("img/rocks.png", 9, 1, rockList);

const sandList: string[] = [];
for (let variant = 1; variant <= SAND_VARIANTS; variant++) sandList.push(`sand-${variant}`);
const sandSheet = new Spritesheet("img/sand.png", SAND_VARIANTS, 1, sandList);

const plantList = [
  "decoration-grass-1_nc_nd",
  "decoration-grass-2_nc_nd",
  "decoration-sagebrush-1_nc",
  "decoration-creosote-1_nc",
  "decoration-dead-brush-1_nc_nd",
  "decoration-yucca-1",
  "decoration-prickly-pear-1",
  "decoration-marigolds-1_nc_nd",
  "decoration-ocotillo-1_nc",
  "decoration-barrel-cactus-1",
  "decoration-cholla-1",
  "decoration-brittlebush-1_nc",
  "decoration-agave-1",
  "decoration-tall-grass-1_nc",
  "decoration-saguaro-1",
  "decoration-hedgehog-cactus-1",
];
const plantSheet = new Spritesheet("img/plants.png", 16, 1, plantList);

const pathTypeList: string[] = [];
for (const [shape, variantCount] of pathShapes) {
  for (let variant = 1; variant <= variantCount; variant++) {
    pathTypeList.push(pathTileName(shape, variant));
  }
}
const pathSheet = new Spritesheet("img/path.png", pathTypeList.length, 1, pathTypeList);

const buildingSizes = [
  { xTiles: 3, yTiles: 2 },
  { xTiles: 4, yTiles: 2 },
  { xTiles: 3, yTiles: 3 },
  { xTiles: 4, yTiles: 3 },
  { xTiles: 5, yTiles: 3 },
];
for (const buildingImage of ["house", "bank", "sheriff", "saloon"]) {
  for (const { xTiles, yTiles } of buildingSizes) {
    const name = `${buildingImage}-${xTiles}x${yTiles}`;
    const height = TILE_SIZE * yTiles;
    const width = TILE_SIZE * xTiles;
    imgInfo.set(name, createImage(`img/${name}.png`, height, width, 0, 0, height, width));
  }
}

townPropSheet.saveToMap(imgInfo);
sandSheet.saveToMap(imgInfo);
pathSheet.saveToMap(imgInfo);
itemsSheet.saveToMap(imgInfo);
rockSheet.saveToMap(imgInfo);
plantSheet.saveToMap(imgInfo);

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
let buildings = ["sheriff", "house", "saloon", "bank"];

buildings.forEach((building) => {
  buildingParts.forEach((buildingPart) => {
    imgInfo.set("building-" + building + "-" + buildingPart.name, {
      src: `img/${building}.png`,
      height: TILE_SIZE,
      width: TILE_SIZE,
      row: buildingPart.row,
      col: buildingPart.col,
    });
  });
});

export default imgInfo;
