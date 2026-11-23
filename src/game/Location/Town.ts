import presets, { type TownPreset } from "./townPresets";
import { generateID, type Point } from "@/lib/utilities";
import Location from "./Location";
import type Building from "./Building";
import type { BuildingType } from "./Building";
import {
  DEFAULT_TOWN_HEIGHT,
  DEFAULT_TOWN_WIDTH,
  TOWNSFOLK_COUNT_BY_TOWN_SIZE,
} from "@/game/consts";
import { genNpcName, genTownName } from "@/game/generators/nameGenerators";
import Npc from "@/game/Entity/Npc";
import greetingDialogue from "@/game/Dialogue/greeting.dwd?raw";
import { TILE_SIZE } from "@/engine/consts";
import type Tile from "@/engine/Tile";
import { seedRoll } from "@/lib/random";
import seed, { deriveSeed } from "@/lib/seed";
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
    seed.set(deriveSeed(this.game.worldSeed, this.ID));
    // see https://gitlab.com/niche-devs/destination-west/-/wikis/Technical-Documentation/Classes/Town/Town-Presets
    const preset = presets.srandomElement()!;
    this.placeStreets(preset);
    this.placeBuildings(preset);
    this.placeGenericDecoration();
    this.placeResidents(preset);
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

  private placeResidents(preset: TownPreset): void {
    const tilesInFront = this.getStreetTilesInFrontOfBuildings(preset);
    this.placeSheriff(tilesInFront);

    const townSize = this.game.worldMap.sizeByTownId[this.ID];
    const townsfolkCount = TOWNSFOLK_COUNT_BY_TOWN_SIZE[townSize];
    for (let i = 0; i < townsfolkCount; i++) {
      const tile = this.takeFreeTile(tilesInFront);
      if (!tile) return;
      const isMale = seedRoll(0.5);
      this.placeResident(tile, genNpcName(isMale, false));
    }
  }

  private placeSheriff(tilesInFront: Tile[]): void {
    const office = this.buildings.find((building) => building.buildingType === "sheriff");
    if (!office) return;

    let tile = this.findFreeTileBesideDoor(office);
    if (!tile) tile = this.takeFreeTile(tilesInFront);
    if (!tile) return;
    this.placeResident(tile, genNpcName(true, true));
  }

  private findFreeTileBesideDoor(building: Building): Tile | null {
    const doorstep = building.getDoorstep();
    if (doorstep.y >= this.height) return null;

    for (const x of [doorstep.x + 1, doorstep.x - 1]) {
      if (x < 0 || x >= this.width) continue;
      const tile = this.tiles[x][doorstep.y];
      if (this.isFreeTile(tile)) return tile;
    }
    return null;
  }

  private getStreetTiles(preset: TownPreset): Tile[] {
    const streetTiles: Tile[] = [];
    for (const street of preset.streets) {
      for (let x = street.start.x; x < street.start.x + street.width; x++) {
        for (let y = street.start.y; y < street.start.y + street.height; y++) {
          const tile = this.tiles[x][y];
          if (!streetTiles.includes(tile)) streetTiles.push(tile);
        }
      }
    }
    return streetTiles;
  }

  private getStreetTilesInFrontOfBuildings(preset: TownPreset): Tile[] {
    const streetTiles = this.getStreetTiles(preset);
    const tilesInFront: Tile[] = [];
    for (const building of this.buildings) {
      const buildingX = building.pos.x / TILE_SIZE;
      const frontY = building.pos.y / TILE_SIZE + building.yTiles;
      if (frontY >= this.height) continue;

      for (let x = buildingX; x < buildingX + building.xTiles; x++) {
        const tile = this.tiles[x][frontY];
        if (streetTiles.includes(tile)) tilesInFront.push(tile);
      }
    }
    return tilesInFront;
  }

  private takeFreeTile(tiles: Tile[]): Tile | null {
    while (tiles.length > 0) {
      const tile = tiles.srandomElement()!;
      tiles.popFirst(tile);
      if (this.isFreeTile(tile)) return tile;
    }
    return null;
  }

  private isFreeTile(tile: Tile): boolean {
    if (tile.entities.length > 0) return false;
    if (this.isDoorstep(tile)) return false;
    const isPlayerSpawn =
      tile.gridPos.x === Math.floor(this.playerSpawn.x / TILE_SIZE) &&
      tile.gridPos.y === Math.floor(this.playerSpawn.y / TILE_SIZE);
    return !isPlayerSpawn;
  }

  private isDoorstep(tile: Tile): boolean {
    for (const building of this.buildings) {
      const doorstep = building.getDoorstep();
      if (tile.gridPos.x === doorstep.x && tile.gridPos.y === doorstep.y) return true;
    }
    return false;
  }

  private placeResident(tile: Tile, name: string): void {
    const pos = { x: tile.gridPos.x * TILE_SIZE, y: tile.gridPos.y * TILE_SIZE };
    const resident = new Npc(this.game, this, pos, name, greetingDialogue);
    resident.moveTo(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2);
    resident.hitbox.updateTilePresence();
    resident.canMove = false;
    this.npcs.push(resident);
  }
}

export default Town;
