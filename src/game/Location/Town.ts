import presets, { type TownPreset } from "./townPresets";
import { generateID, type Point } from "@/lib/utilities";
import Location from "./Location";
import type { BuildingType } from "./Building";
import { DEFAULT_TOWN_HEIGHT, DEFAULT_TOWN_WIDTH } from "@/game/consts";
import { genTownName } from "@/game/generators/nameGenerators";
import { TILE_SIZE } from "@/engine/consts";
import type Game from "@/game/Game";

export type BuildingCounts = Partial<Record<BuildingType, number>>;

class Town extends Location {
  readonly ID: number;
  readonly name: string;
  readonly pos: Point;
  private readonly buildingCounts: BuildingCounts;
  visited: boolean;
  connectedLocations: number[];

  constructor(game: Game, pos: Point, buildingCounts: BuildingCounts = {}) {
    super(game, DEFAULT_TOWN_WIDTH, DEFAULT_TOWN_HEIGHT);
    this.ID = generateID(Town);
    this.name = genTownName();
    this.pos = pos;
    this.buildingCounts = buildingCounts;
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
    let buildingCount = buildings.length;
    let requiredBuildingCount = 0;
    if (this.buildingCounts.saloon !== undefined)
      requiredBuildingCount += this.buildingCounts.saloon;
    if (this.buildingCounts.sheriff !== undefined)
      requiredBuildingCount += this.buildingCounts.sheriff;
    if (this.buildingCounts.house !== undefined) requiredBuildingCount += this.buildingCounts.house;
    if (requiredBuildingCount > buildingCount) requiredBuildingCount = buildingCount;
    let counter = 0;
    let toPlace: number;

    (["saloon", "sheriff", "house"] as const).forEach((place) => {
      if (!this.buildingCounts[place]) toPlace = 0;
      else if (this.buildingCounts[place] + counter < buildingCount)
        toPlace = this.buildingCounts[place];
      else toPlace = buildingCount - counter;
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
