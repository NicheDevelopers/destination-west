import presets, { type TownPreset } from "./townPresets.js";
import { generateID, type Point } from "@/utilities/utilities.js";
import Location from "./Location.js";
import type { BuildingType } from "./Building.js";
import { DEFAULT_TOWN_HEIGHT, DEFAULT_TOWN_WIDTH } from "@/global/consts.js";
import { genTownName } from "@/generators/nameGenerators.js";
import { TILE_SIZE } from "@/global/consts.js";
import type Game from "@/game/Game.js";

export type BuildingCounts = Partial<Record<BuildingType, number>>;

class Town extends Location {
  readonly ID: number;
  readonly name: string;
  readonly pos: Point;
  private readonly numBldInTown: BuildingCounts;
  visited: boolean;
  connectedLocations: number[];

  constructor(game: Game, pos: Point, numBldInTown: BuildingCounts = {}) {
    super(game, DEFAULT_TOWN_WIDTH, DEFAULT_TOWN_HEIGHT);
    this.ID = generateID(Town);
    this.name = genTownName();
    this.pos = pos;
    this.numBldInTown = numBldInTown;
    this.visited = false;
    this.connectedLocations = [];
    this.playerSpawn = { x: 3 * TILE_SIZE, y: 5 * TILE_SIZE };
  }

  createTown(): void {
    // see https://gitlab.com/niche-devs/destination-west/-/wikis/Technical-Documentation/Classes/Town/Town-Presets
    let preset = presets.srandomElement()!;
    this.placeStreets(preset);
    this.placeBuildings(preset);
    this.placeGenericDecoration();
    this.prerender();
  }

  private placeBuildings(preset: TownPreset): void {
    let buildings = preset.buildings;
    // `buildings` holds an array with objects describing
    // building positions and sizes
    let numBlds = buildings.length;
    let requiredNumBlds = 0;
    if (this.numBldInTown.saloon !== undefined) requiredNumBlds += this.numBldInTown.saloon;
    if (this.numBldInTown.sheriff !== undefined) requiredNumBlds += this.numBldInTown.sheriff;
    if (this.numBldInTown.house !== undefined) requiredNumBlds += this.numBldInTown.house;
    if (requiredNumBlds > numBlds) requiredNumBlds = numBlds;
    let counter = 0;
    let toPlace: number;

    (["saloon", "sheriff", "house"] as const).forEach((place) => {
      if (!this.numBldInTown[place]) toPlace = 0;
      else if (this.numBldInTown[place] + counter < numBlds) toPlace = this.numBldInTown[place];
      else toPlace = numBlds - counter;
      for (let i = 0; i < toPlace; i++) {
        this.awaitAssets++;
        this.placeBuilding(
          buildings[counter].gridPos,
          buildings[counter].xTiles,
          buildings[counter].yTiles,
          place,
          { callback: () => this.awaitAssets-- },
        );
        counter++;
      }
    });
  }
}

export default Town;
