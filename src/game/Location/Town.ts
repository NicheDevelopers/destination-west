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
    const typesLeft: BuildingType[] = [];
    for (const type of ["saloon", "sheriff", "house"] as const) {
      const count = this.buildingCounts[type] ?? 0;
      for (let i = 0; i < count; i++) {
        typesLeft.push(type);
      }
    }
    while (typesLeft.length < preset.buildings.length) {
      typesLeft.push("house");
    }

    for (const spot of preset.buildings) {
      const type = typesLeft.srandomElement()!;
      typesLeft.popFirst(type);

      this.awaitAssets++;
      this.placeBuilding(spot.gridPos, spot.xTiles, spot.yTiles, type, {
        callback: () => this.awaitAssets--,
      });
    }
  }
}

export default Town;
