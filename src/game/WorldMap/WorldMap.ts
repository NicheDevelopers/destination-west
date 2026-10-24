import { seedRoll, srandIntInRange } from "@/lib/random";
import { resetIdFor, distance } from "@/lib/utilities";
import type { Point } from "@/lib/utilities";
import { MAP_PARAMETERS, TOWN_SIZES } from "@/game/consts";
import Town from "@/game/Location/Town";
import type Game from "@/game/Game";

type TownSize = keyof typeof TOWN_SIZES;

class WorldMap {
  private readonly game: Game;
  locations: Town[] = [];
  layerByTownId: number[] = [];
  middleLayerCount = 0;
  sizeByTownId: TownSize[] = [];

  constructor(game: Game) {
    this.game = game;
    // Roads passing close to other towns are removed, which could cut off the last town
    do {
      this.generateLocations(MAP_PARAMETERS.minLocations, MAP_PARAMETERS.maxLocations);
      this.connectLocations();
    } while (!this.isLastTownReachable());
    this.chooseTownSizes();
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
    this.middleLayerCount = srandIntInRange(
      MAP_PARAMETERS.minMiddleLayers,
      MAP_PARAMETERS.maxMiddleLayers + 1,
    );
    const middleY = MAP_PARAMETERS.displayHeight / 2;
    const locations: Town[] = [];
    this.layerByTownId = [];

    locations.push(this.createTown({ x: MAP_PARAMETERS.paddingX, y: middleY }));
    this.layerByTownId.push(0);

    const middleTownCount = numOfLocations - 2;
    for (let i = 0; i < middleTownCount; i++) {
      const layer = 1 + Math.floor((i * this.middleLayerCount) / middleTownCount);
      const pos = this.getValidCoordinates(locations, layer);
      locations.push(this.createTown(pos));
      this.layerByTownId.push(layer);
    }

    const lastTownX = MAP_PARAMETERS.displayWidth - MAP_PARAMETERS.paddingX;
    locations.push(this.createTown({ x: lastTownX, y: middleY }));
    this.layerByTownId.push(this.middleLayerCount + 1);

    this.locations = locations;
  }

  private createTown(pos: Point): Town {
    return new Town(this.game, pos, { sheriff: 1, house: 2, saloon: 11 });
  }

  private connectLocations(): void {
    const layers = this.getLayersSortedTopToBottom();
    for (let layer = 0; layer < layers.length - 1; layer++) {
      connectNeighboringLayers(layers[layer], layers[layer + 1], this.locations);
    }
    for (const layer of layers) {
      connectCloseTownsInLayer(layer, this.locations);
    }
  }

  private isLastTownReachable(): boolean {
    const reachedIds = [0];
    for (let i = 0; i < reachedIds.length; i++) {
      for (const neighborId of this.getByID(reachedIds[i]).connectedLocations) {
        if (!reachedIds.includes(neighborId)) reachedIds.push(neighborId);
      }
    }
    return reachedIds.includes(this.locations.length - 1);
  }

  private chooseTownSizes(): void {
    const lastTownId = this.locations.length - 1;
    const largeCandidates: Town[] = [];
    this.sizeByTownId = [];
    for (const town of this.locations) {
      const roadCount = town.connectedLocations.length;
      let size: TownSize = "small";
      if (roadCount >= MAP_PARAMETERS.minRoadsForMediumTown) size = "medium";
      this.sizeByTownId.push(size);

      const isStartOrLastTown = town.ID === 0 || town.ID === lastTownId;
      if (roadCount >= MAP_PARAMETERS.minRoadsForLargeTown && !isStartOrLastTown) {
        largeCandidates.push(town);
      }
    }
    this.sizeByTownId[lastTownId] = "large";

    for (let i = 0; i < MAP_PARAMETERS.maxLargeTowns; i++) {
      if (largeCandidates.length === 0) break;
      const mostRoads = Math.max(...largeCandidates.map((town) => town.connectedLocations.length));
      const townsWithMostRoads = largeCandidates.filter(
        (town) => town.connectedLocations.length === mostRoads,
      );
      const chosenTown = townsWithMostRoads.srandomElement()!;
      this.sizeByTownId[chosenTown.ID] = "large";
      largeCandidates.popFirst(chosenTown);
    }
  }

  private getLayersSortedTopToBottom(): Town[][] {
    const layers: Town[][] = [];
    for (let layer = 0; layer < this.middleLayerCount + 2; layer++) {
      layers.push([]);
    }
    for (const town of this.locations) {
      layers[this.layerByTownId[town.ID]].push(town);
    }
    for (const layer of layers) {
      layer.sort((a, b) => a.pos.y - b.pos.y);
    }
    return layers;
  }

  getLayerXRange(layer: number): { minX: number; maxX: number } {
    const usableWidth = MAP_PARAMETERS.displayWidth - 2 * MAP_PARAMETERS.paddingX;
    const layerWidth = usableWidth / (this.middleLayerCount + 1);
    const layerCenterX = MAP_PARAMETERS.paddingX + layer * layerWidth;
    return { minX: layerCenterX - layerWidth / 2, maxX: layerCenterX + layerWidth / 2 };
  }

  private getValidCoordinates(existingLocations: Town[], layer: number): Point {
    const { minX, maxX } = this.getLayerXRange(layer);
    const layerCenterX = (minX + maxX) / 2;
    const maxOffsetX = ((maxX - minX) / 2) * MAP_PARAMETERS.townAreaInLayer;
    while (true) {
      const pos: Point = {
        x: srandIntInRange(layerCenterX - maxOffsetX, layerCenterX + maxOffsetX),
        y: srandIntInRange(
          MAP_PARAMETERS.paddingY,
          MAP_PARAMETERS.displayHeight - MAP_PARAMETERS.paddingY,
        ),
      };
      if (
        existingLocations.none(
          (t) => distance(t.pos, pos) < MAP_PARAMETERS.minDistanceBetweenLocations,
        )
      ) {
        return pos;
      }
    }
  }
}

type Road = { left: number; right: number };

function connectNeighboringLayers(leftLayer: Town[], rightLayer: Town[], allTowns: Town[]): void {
  // Roads hold indexes into the layers
  const roads: Road[] = [];
  for (let left = 0; left < leftLayer.length; left++) {
    for (let right = 0; right < rightLayer.length; right++) {
      const leftShareStart = left * rightLayer.length;
      const leftShareEnd = (left + 1) * rightLayer.length;
      const rightShareStart = right * leftLayer.length;
      const rightShareEnd = (right + 1) * leftLayer.length;
      if (leftShareStart >= rightShareEnd || rightShareStart >= leftShareEnd) continue;
      if (passesCloseToOtherTown(leftLayer[left], rightLayer[right], allTowns)) continue;
      roads.push({ left, right });
    }
  }

  for (let left = 0; left < leftLayer.length; left++) {
    if (!seedRoll(MAP_PARAMETERS.extraRoadChance)) continue;
    const connectedRights = roads.filter((road) => road.left === left).map((road) => road.right);
    if (connectedRights.length === 0) continue;
    // Try the town right above the connected ones or right below them
    let right = Math.min(...connectedRights) - 1;
    if (seedRoll(0.5)) right = Math.max(...connectedRights) + 1;
    if (right < 0 || right >= rightLayer.length) continue;
    if (crossesAnyRoad(roads, { left, right })) continue;
    const length = distance(leftLayer[left].pos, rightLayer[right].pos);
    if (length > MAP_PARAMETERS.maxExtraRoadLength) continue;
    if (passesCloseToOtherTown(leftLayer[left], rightLayer[right], allTowns)) continue;
    roads.push({ left, right });
  }

  for (const road of roads) {
    connectTowns(leftLayer[road.left], rightLayer[road.right]);
  }
}

export function passesCloseToOtherTown(a: Town, b: Town, allTowns: Town[]): boolean {
  for (const town of allTowns) {
    if (town === a || town === b) continue;
    const distanceToRoad = distanceToSegment(town.pos, a.pos, b.pos);
    if (distanceToRoad < MAP_PARAMETERS.minRoadDistanceFromTown) return true;
  }
  return false;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  // How far along the segment the closest point is, from 0 at start to 1 at end
  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  return distance(point, { x: start.x + t * dx, y: start.y + t * dy });
}

function crossesAnyRoad(roads: Road[], newRoad: Road): boolean {
  for (const road of roads) {
    if (road.left < newRoad.left && road.right > newRoad.right) return true;
    if (road.left > newRoad.left && road.right < newRoad.right) return true;
  }
  return false;
}

function connectCloseTownsInLayer(layer: Town[], allTowns: Town[]): void {
  for (let i = 0; i < layer.length - 1; i++) {
    const upper = layer[i];
    const lower = layer[i + 1];
    if (distance(upper.pos, lower.pos) >= MAP_PARAMETERS.maxSameLayerRoadLength) continue;
    if (passesCloseToOtherTown(upper, lower, allTowns)) continue;
    connectTowns(upper, lower);
  }
}

function connectTowns(a: Town, b: Town): void {
  a.connectedLocations.push(b.ID);
  b.connectedLocations.push(a.ID);
}

export default WorldMap;
