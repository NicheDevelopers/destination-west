import { srandIntInRange } from "@/lib/random";
import { resetIdFor, distance } from "@/lib/utilities";
import type { Point } from "@/lib/utilities";
import { MAP_PARAMETERS as mp } from "@/game/consts";
import Town from "@/game/Location/Town";
import type Game from "@/game/Game";

class WorldMap {
  private readonly game: Game;
  locations: Town[] = [];

  constructor(game: Game) {
    this.game = game;
    do {
      this.generateLocations(mp.minLocations, mp.maxLocations);
      this.connectLocations();
    } while (!this.locationsConnected());
  }

  getByID(id: number): Town {
    if (id > this.locations.length - 1 || id < 0) {
      throw new Error(
        `WorldMap: no town with ID ${id} - locations length is ${this.locations.length}`,
      );
    }
    return this.locations[id];
  }

  private generateLocations(min: number, max: number): void {
    resetIdFor(Town);
    const numOfLocations = srandIntInRange(min, max);
    const locations: Town[] = [];

    for (let i = 0; i < numOfLocations; i++) {
      const pos = this.getValidCoordinates(locations);
      locations.push(new Town(this.game, pos, { sheriff: 1, house: 2, saloon: 11 }));
    }
    this.locations = locations;
  }

  private connectLocations(): void {
    for (const location of this.locations) {
      const nearby = this.locations
        .filter(
          (l) => l !== location && distance(l.pos, location.pos) < mp.minDistanceForConnection,
        )
        .map((l) => l.ID);
      location.connectedLocations = nearby;
    }
  }

  private locationsConnected(): boolean {
    return this.dfs().length === this.locations.length;
  }

  intoNeighborList(): Map<number, number[]> {
    const map = new Map<number, number[]>();
    for (const location of this.locations) {
      map.set(location.ID, location.connectedLocations);
    }
    return map;
  }

  private dfs(): number[] {
    const g = this.intoNeighborList();
    const visited: number[] = [];
    const dfsUtil = (start: number) => {
      visited.push(start);
      for (const v of g.get(start) ?? []) {
        if (!visited.includes(v)) {
          dfsUtil(v);
        }
      }
    };
    dfsUtil(0);
    return visited;
  }

  private getValidCoordinates(existingLocations: Town[]): Point {
    while (true) {
      const pos: Point = {
        x: srandIntInRange(mp.paddingX, mp.displayWidth - mp.paddingX),
        y: srandIntInRange(mp.paddingY, mp.displayHeight - mp.paddingY),
      };
      if (existingLocations.none((t) => distance(t.pos, pos) < mp.minDistanceBetweenLocations)) {
        return pos;
      }
    }
  }
}

export default WorldMap;
