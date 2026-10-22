import Location from "./Location";
import { srandIntInRange, seedRoll } from "@/lib/random";
import { TILE_SIZE } from "@/engine/consts";
import Portal, { PortalType } from "@/game/Entity/Portal";
import type { StreetPreset } from "./townPresets";
import type Game from "@/game/Game";

// the leght of chunk must be at least 10 tiles

let buildingChance = 0.1; // => to consts.js

let newStreet = (x: number, y: number, width: number, height: number): StreetPreset => ({
  start: { x, y },
  width: width,
  height: height,
});

class Travel extends Location {
  private readonly chunkWidth: number;
  private readonly distance: number;
  readonly fromId: number;
  readonly toId: number;

  constructor(game: Game, distance: number, fromId: number, toId: number, background?: string) {
    super(game, 20 * ~~(distance / 20), 16, background);
    this.chunkWidth = 20;
    this.distance = distance;
    this.fromId = fromId;
    this.toId = toId;
    // Spawn player on the left for now
    this.playerSpawn = { x: 3 * TILE_SIZE, y: this.heightPx - 3 * TILE_SIZE };
    this.createLocation();
  }

  numberOfChunks(): number {
    return ~~(this.distance / this.chunkWidth);
  }

  private createLocation(): void {
    const preset: { streets: StreetPreset[] } = { streets: [] };
    preset.streets.push(newStreet(0, this.height - 3, this.width, 1));

    for (let chunk = 0; chunk < this.numberOfChunks(); chunk++) {
      // no event
      // left building
      let yStart = this.height - 5 - srandIntInRange(0, this.height - 5);
      if (seedRoll(buildingChance)) {
        let xStart = this.chunkWidth / 2 - 5 + srandIntInRange(0, 2) + chunk * this.chunkWidth;
        this.placeBuilding({ x: xStart, y: yStart }, 3, 2, "house", {});
        preset.streets.push(newStreet(xStart + 1, yStart + 2, 1, this.height - yStart - 5));
      }
      // right building
      if (seedRoll(buildingChance)) {
        let xStart = this.chunkWidth / 2 + srandIntInRange(0, 2) + chunk * this.chunkWidth;
        this.placeBuilding({ x: xStart, y: yStart }, 3, 2, "house", {});
        preset.streets.push(newStreet(xStart + 1, yStart + 2, 1, this.height - yStart - 4));
      }
    }

    this.portals.push(
      new Portal(
        this.game,
        "decoration-roadsign",
        //(this.width-3)*TILE_SIZE, (this.height-4)*TILE_SIZE,
        { x: 4 * TILE_SIZE, y: (this.height - 4) * TILE_SIZE },
        PortalType.teleport(this.fromId),
      ),
    );
    this.portals.push(
      new Portal(
        this.game,
        "decoration-roadsign",
        { x: 3 * TILE_SIZE, y: (this.height - 4) * TILE_SIZE },
        PortalType.teleport(this.toId),
      ),
    );
    this.placeStreets(preset);
    this.placeGenericDecoration();
    this.prerender();
  }
}
export default Travel;
