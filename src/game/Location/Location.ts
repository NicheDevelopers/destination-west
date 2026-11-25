import Tile from "@/engine/Tile";
import Entity from "@/engine/Entity";
import { ctx } from "@/engine/Browser";
import { createCanvas } from "@/lib/dom";
import { distance, comparePositions, type Point } from "@/lib/utilities";
import { seedRoll, srandIntInRange } from "@/lib/random";
import { TILE_SIZE } from "@/engine/consts";
import { PERCENTAGE_OF_GENERIC_DECORATION, FOCUS_PARAMETERS, PLANT_PATCHES } from "@/game/consts";
import Building, { type BuildingType } from "./Building";
import { pathShapes, pathTileName } from "./path-tiles";
import type { StreetPreset } from "./townPresets";
import type Game from "@/game/Game";
import type Player from "@/game/Entity/Player";
import type Interactible from "@/game/Entity/Interactible";
import type Container from "@/game/Entity/Container";
import type Portal from "@/game/Entity/Portal";
import DroppedItem from "@/game/Item/DroppedItem";
import type Item from "@/game/Item/Item";
import type { EntityOptions } from "@/engine/Entity";

export type LocationInteractible = Interactible;

type Drawable = Entity | LocationInteractible | Player;

class Location {
  game: Game;
  tiles: Tile[][];
  created: boolean;
  readonly width: number;
  readonly height: number;
  readonly widthPx: number;
  readonly heightPx: number;
  protected awaitAssets: number;
  playerSpawn: Point;
  private image?: HTMLImageElement;
  private lastPlayerPos: Point | null = null;
  //temporary
  containers: Container[] = [];
  droppedItems: DroppedItem[] = [];
  npcs: Interactible[] = [];
  decorations: Entity[] = [];
  buildings: Building[] = [];
  portals: Portal[] = [];
  focused: LocationInteractible | null;

  constructor(game: Game, width: number, height: number, background: string = "sand") {
    this.game = game;
    this.created = false;
    this.width = width;
    this.height = height;
    this.widthPx = this.width * TILE_SIZE;
    this.heightPx = this.height * TILE_SIZE;
    this.awaitAssets = 0;
    this.tiles = Array.from({ length: width }, (_, x) =>
      Array.from({ length: height }, (_, y) => this.createAwaitedTile(background, { x, y })),
    );
    this.playerSpawn = { x: 0, y: 0 };
    this.focused = null;
  }

  private createAwaitedTile(typeName: string, gridPos: Point): Tile {
    this.awaitAssets++;
    return new Tile(typeName, gridPos, { callback: () => this.awaitAssets-- });
  }

  prerender(): void {
    if (this.awaitAssets > 0) {
      setTimeout(() => this.prerender(), 0);
      return;
    }
    const { canvas, context: offscreenContext } = createCanvas(this.widthPx, this.heightPx);
    offscreenContext.clearRect(0, 0, this.widthPx, this.heightPx);

    this.drawRaw(0, 0, offscreenContext);
    this.image = new Image(this.widthPx, this.heightPx);
    this.image.onload = () => {
      this.created = true;
    };
    this.image.src = canvas.toDataURL("image/png");
  }

  // check if there's a building in the 5x5 square surrounding a tile
  nearToBuilding(tileX: number, tileY: number, maxDist: number = 2): boolean {
    for (let offsetX = -maxDist; offsetX <= maxDist; offsetX++)
      for (let offsetY = -maxDist; offsetY <= maxDist; offsetY++) {
        const x = tileX + offsetX;
        const y = tileY + offsetY;
        if (x < 0 || x >= this.tiles.length) continue;
        if (y < 0 || y >= this.tiles[0].length) continue;
        if (this.tiles[x][y].hasEntityOfType(Building)) return true;
      }
    return false;
  }

  /**
   * Place generic decorations according to tiles' proximity to buildings.
   * Generic decorations are objects like cacti, stones, bushes. We don't care about their placement that much.
   * Special decorations are more unique objects such as roadsigns, wells, things that shouldn't appear as often.
   * Tiles within a 5x5 square of a building are considered to be close to it.
   */
  placeGenericDecoration(): void {
    const ruralDecorations = [
      "saguaro-1",
      "saguaro-1",
      "barrel-cactus-1",
      "barrel-cactus-1",
      "sagebrush-1",
      "pebbles-1",
      "rock-small-1",
      "rock-banded-1",
      "rock-ledge-1",
      "hoodoo-1",
      "rock-split-1",
      "rock-rubble-1",
      "rock-slab-1",
      "rock-boulders-1",
    ];
    const townDecorations = ["big-bag-3x"];

    for (let x = 0; x < this.tiles.length; x++)
      for (let y = 0; y < this.tiles[0].length; y++) {
        if (this.tiles[x][y].typeName !== "sand") continue;
        if (this.tiles[x][y].hasEntityOfType(Building)) continue;

        let decorationChoices = null;
        if (this.nearToBuilding(x, y)) {
          if (seedRoll(PERCENTAGE_OF_GENERIC_DECORATION.townPercentage))
            decorationChoices = townDecorations;
        } else if (seedRoll(PERCENTAGE_OF_GENERIC_DECORATION.ruralPercentage)) {
          decorationChoices = ruralDecorations;
        }

        if (decorationChoices)
          this.decorations.push(
            new Entity(
              "decoration-" + decorationChoices.srandomElement()!,
              { x: x * TILE_SIZE, y: y * TILE_SIZE },
              { hitbox: this.tiles },
            ),
          );
      }
  }

  /**
   * Grow plants in large irregular patches. Each patch is a few overlapping
   * blobs, densest in the middle of each blob and thinning out toward its edge.
   */
  placePlantPatches(): void {
    // grass and small plants are listed more than once so they show up more often
    const plants = [
      "grass-1",
      "grass-1",
      "grass-1",
      "grass-2",
      "grass-2",
      "marigolds-1",
      "marigolds-1",
      "sagebrush-1",
      "sagebrush-1",
      "creosote-1",
      "creosote-1",
      "dead-brush-1",
      "yucca-1",
      "prickly-pear-1",
      "tall-grass-1",
      "tall-grass-1",
      "brittlebush-1",
      "brittlebush-1",
      "ocotillo-1",
      "barrel-cactus-1",
      "barrel-cactus-1",
      "cholla-1",
      "cholla-1",
      "prickly-pear-1",
      "saguaro-1",
      "saguaro-1",
      "hedgehog-cactus-1",
      "hedgehog-cactus-1",
      "agave-1",
    ];
    const occupied = new Set<string>();
    for (const decoration of this.decorations) {
      occupied.add(`${decoration.pos.x / TILE_SIZE},${decoration.pos.y / TILE_SIZE}`);
    }

    const patchCount = Math.ceil((this.width * this.height) / PLANT_PATCHES.tilesPerPatch);
    for (let patch = 0; patch < patchCount; patch++) {
      const patchCenter = {
        x: srandIntInRange(0, this.width),
        y: srandIntInRange(0, this.height),
      };
      for (let blob = 0; blob < PLANT_PATCHES.blobsPerPatch; blob++) {
        const radius = srandIntInRange(
          PLANT_PATCHES.minBlobRadius,
          PLANT_PATCHES.maxBlobRadius + 1,
        );
        const blobCenter = {
          x: patchCenter.x + srandIntInRange(-radius, radius + 1),
          y: patchCenter.y + srandIntInRange(-radius, radius + 1),
        };
        for (let x = blobCenter.x - radius; x <= blobCenter.x + radius; x++) {
          for (let y = blobCenter.y - radius; y <= blobCenter.y + radius; y++) {
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
            const tile = this.tiles[x][y];
            if (tile.typeName !== "sand" || tile.entities.length > 0) continue;
            if (occupied.has(`${x},${y}`) || this.nearToBuilding(x, y, 1)) continue;

            const closeness = 1 - distance(blobCenter, { x, y }) / radius;
            if (closeness <= 0) continue;
            if (!seedRoll(Math.min(1, PLANT_PATCHES.density * closeness * 1.6))) continue;

            occupied.add(`${x},${y}`);
            // nudge each plant off the tile grid so a patch doesn't look like rows
            const maxNudge = PLANT_PATCHES.maxNudge;
            const nudgedX = x * TILE_SIZE + srandIntInRange(-maxNudge, maxNudge + 1);
            const nudgedY = y * TILE_SIZE + srandIntInRange(-maxNudge, maxNudge + 1);
            const pos = {
              x: Math.min(Math.max(nudgedX, 0), this.widthPx - TILE_SIZE),
              y: Math.min(Math.max(nudgedY, 0), this.heightPx - TILE_SIZE),
            };
            this.decorations.push(
              new Entity("decoration-" + plants.srandomElement()!, pos, { hitbox: this.tiles }),
            );
          }
        }
      }
    }
  }

  getNumOfTiles(): number {
    return this.tiles.length * this.tiles[0].length;
  }

  placeBuilding(
    gridPos: Point,
    widthInTiles: number,
    heightInTiles: number,
    buildingType: BuildingType,
    options: EntityOptions,
  ): void {
    for (let y = gridPos.y; y < gridPos.y + heightInTiles; ++y) {
      for (let x = gridPos.x; x < gridPos.x + widthInTiles; ++x) {
        this.tiles[x][y] = this.createAwaitedTile("sand", { x, y });
      }
    }
    let width = widthInTiles * TILE_SIZE;
    let height = heightInTiles * TILE_SIZE;
    let relativeCenterPoint = {
      x: ~~(width / 2),
      y: ~~(height / 2),
    };
    let boundingDistance = {
      left: width - relativeCenterPoint.x - 1,
      right: width - relativeCenterPoint.x - 1,
      up: height - relativeCenterPoint.y - 1 - TILE_SIZE / 2,
      down: height - relativeCenterPoint.y - 1,
    };
    this.buildings.push(
      new Building(
        { x: gridPos.x * TILE_SIZE, y: gridPos.y * TILE_SIZE },
        widthInTiles,
        heightInTiles,
        buildingType,
        Object.assign(options, {
          hitbox: this.tiles,
          relativeCenterPoint,
          boundingDistance,
        }),
      ),
    );
  }

  chooseStreet(streetArray: boolean[][], x: number, y: number): [string, number] {
    const surrounding = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
    const isPath = surrounding.map(([dx, dy]) => streetArray[x + dx]?.[y + dy] ?? true);
    // a diagonal only changes the shape when both tiles beside it are path too
    for (let i = 1; i < 8; i += 2) {
      if (!isPath[i - 1] || !isPath[(i + 1) % 8]) isPath[i] = false;
    }

    let shape = isPath.map((path) => (path ? "1" : "0")).join("");
    for (const rotation of [0, 90, 180, 270]) {
      const variantCount = pathShapes.get(shape);
      if (variantCount)
        return [pathTileName(shape, srandIntInRange(1, variantCount + 1)), rotation];
      shape = shape.substring(2, 8) + shape.substring(0, 2);
    }
    throw new Error(`No path tile for neighbours ${shape}`);
  }

  placeStreets(preset: { streets: StreetPreset[] }): void {
    let streetArray = Array.from({ length: this.width }, () =>
      Array.from({ length: this.height }, () => false),
    );

    preset.streets.forEach((street) => {
      for (let x = street.start.x; x < street.start.x + street.width; ++x)
        for (let y = street.start.y; y < street.start.y + street.height; ++y) {
          streetArray[x][y] = true;
        }
    });

    preset.streets.forEach((street) => {
      for (let x = street.start.x; x < street.start.x + street.width; ++x) {
        for (let y = street.start.y; y < street.start.y + street.height; ++y) {
          this.awaitAssets++;
          let nameAndDegree = this.chooseStreet(streetArray, x, y);
          this.tiles[x][y] = new Tile(
            nameAndDegree[0],
            { x, y },
            {
              rotation: nameAndDegree[1],
              callback: () => {
                this.awaitAssets--;
              },
            },
          );
        }
      }
    });
  }

  dropItem(item: Item, pos: Point): void {
    this.droppedItems.push(new DroppedItem(this.game, item, pos));
  }

  getInteractibles(): LocationInteractible[] {
    return [...this.droppedItems, ...this.npcs, ...this.containers, ...this.portals];
  }

  /*
    Assign true to property `focus` of the element which is
    the closest to `point`.
  */
  updateFocus(player: Player): void {
    if (this.focused) {
      this.focused.focus = false;
      this.focused = null;
    }
    let bestFocusScore = FOCUS_PARAMETERS.minDist;

    const playerCenter = player.getCenterPoint();

    for (const item of this.getInteractibles()) {
      const itemCenter = item.getCenterPoint();
      let focusScore = distance(itemCenter, playerCenter);

      if (
        (player.isFacingRight() && itemCenter.x > playerCenter.x) ||
        (!player.isFacingRight() && itemCenter.x < playerCenter.x)
      ) {
        focusScore += FOCUS_PARAMETERS.facingPenalty;
      }

      if (focusScore < bestFocusScore) {
        bestFocusScore = focusScore;
        this.focused = item;
      }
    }

    if (!this.focused) return;
    this.focused.focus = true;
  }

  draw(
    x: number = 0,
    y: number = 0,
    context: CanvasRenderingContext2D = ctx,
    width: number = 672,
    height: number = 288,
  ): void {
    if (!this.created || !this.image) return;
    context.drawImage(this.image, x, y, width, height, 0, 0, width, height);
  }

  drawRaw(x0: number = 0, y0: number = 0, context: CanvasRenderingContext2D = ctx): void {
    for (let x = 0; x < this.tiles.length; ++x)
      for (let y = 0; y < this.tiles[0].length; ++y) {
        let tile = this.tiles[x][y];
        tile.draw(x0 + tile.gridPos.x * TILE_SIZE, y0 + tile.gridPos.y * TILE_SIZE, context);
      }
  }
  drawDebugInfo(cameraX: number, cameraY: number): void {
    for (let x = 0; x < this.tiles.length; ++x)
      for (let y = 0; y < this.tiles[0].length; ++y) {
        let tile = this.tiles[x][y];
        tile.drawDebugInfo(cameraX, cameraY);
      }
  }

  /* Returns two arrays:
     1. Entities that should be drawn first and depth doesn't matter.
     2. Entities where depth matters, sorted in drawing order. */
  entitiesByDepth(location: Location, player: Player): [Drawable[], Drawable[]] {
    let drawables: Drawable[] = [
      location.droppedItems,
      location.containers,
      location.npcs,
      location.decorations,
      location.buildings,
      location.portals,
      player,
    ].flat();

    let sorted = drawables
      .filter((e) => !e.ignoreDepth)
      .sort((a, b) => a.getCenterPoint().y - b.getCenterPoint().y);

    return [drawables.filter((e) => e.ignoreDepth), sorted];
  }

  update(player: Player): void {
    this.npcs.forEach((npc) => npc.update());

    if (this.lastPlayerPos && comparePositions(player.pos, this.lastPlayerPos)) return;

    this.updateFocus(player);
    this.lastPlayerPos = { ...player.pos };
  }
}

export default Location;
