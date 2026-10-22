import Tile from "@/engine/Tile";
import Entity from "@/engine/Entity";
import { ctx } from "@/engine/Browser";
import { createCanvas } from "@/lib/dom";
import { distance, comparePositions, type Point } from "@/lib/utilities";
import { seedRoll } from "@/lib/random";
import { TILE_SIZE } from "@/engine/consts";
import { PERCENTAGE_OF_GENERIC_DECORATION, FOCUS_PARAMETERS } from "@/game/consts";
import Building, { type BuildingType } from "./Building";
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

/* pathInfo keys describe the presence of paths on adjacent squares.
   The first digit describes the top-left adjacent tile. If that tile
   is a path then we represet is as a 1, otherwise as 0.
   The next digit describes the tile over the top edge and so on.
   After checking a whole row we move to the next one.
*/

const defaultStreet = "street";

const pathInfo = new Map<string, string[]>([
  ["00100010", ["path-narrow-side-1", "path-narrow-side-2", "path-narrow-side-3"]],
  ["00100011", ["path-narrow-side-1", "path-narrow-side-2", "path-narrow-side-3"]],
  ["01100010", ["path-narrow-side-1", "path-narrow-side-2", "path-narrow-side-3"]],
  ["01110010", ["path-narrow-side-1", "path-narrow-side-2", "path-narrow-side-3"]],
  ["00001010", ["path-narrrow-corner-1", "path-narrrow-corner-2"]],
  ["00000010", ["path-narrow-end-1", "path-narrow-end-2"]],
  ["10001010", ["path-narrow-fork-1", "path-narrow-fork-2"]],
  ["10101010", ["path-narrow-crossroad-1", "path-narrow-crossroad-2"]],
  ["11111111", ["path-wide-full-1"]],
  ["11111110", ["path-wide-inner-corner-1", "path-wide-inner-corner-2"]],
  ["00111110", ["path-wide-side-1", "path-wide-side-2"]],
  ["01111110", ["path-wide-side-1", "path-wide-side-2"]],
  ["00111111", ["path-wide-side-1", "path-wide-side-2"]],
  ["00001110", ["path-wide-corner-1", "path-wide-corner-2"]],
  //path-wide-fork
  //["11111010","path-wide-corner-1"],
  //path-wider-fork-left
  //["11100010","path-wide-corner-1"],
  //path-wider-fork-right
  //["10100011","path-wide-corner-1"],
]);

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
    this.tiles = Array.from({ length: width }, (_, x) =>
      Array.from({ length: height }, (_, y) => new Tile(background, { x, y })),
    );
    this.awaitAssets = 0;
    this.playerSpawn = { x: 0, y: 0 };
    this.focused = null;
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
    let ruralDecorations = [["cactus-1x"], ["small-stones-1"], ["green-bush-1"]];

    let townDecorations = [
      //["roadsign", 1],
      //["stone-well", 1],
      ["big-bag-3x"],
    ];

    for (let x = 0; x < this.tiles.length; x++)
      for (let y = 0; y < this.tiles[0].length; y++) {
        if (this.tiles[x][y].typeName !== "sand") continue;
        if (this.tiles[x][y].hasEntityOfType(Building)) continue;

        let decorationChoices = null;

        if (!this.nearToBuilding(x, y) && seedRoll(PERCENTAGE_OF_GENERIC_DECORATION.townPercentage))
          decorationChoices = townDecorations;
        else if (
          !this.nearToBuilding(x, y) &&
          seedRoll(PERCENTAGE_OF_GENERIC_DECORATION.ruralPercentage)
        )
          decorationChoices = ruralDecorations;

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
        this.tiles[x][y] = new Tile("sand", { x, y });
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
    let string = "";
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
    surrounding.forEach(([dx, dy]) => {
      string += (streetArray[x + dx]?.[y + dy] ?? true) ? "1" : "0";
    });

    for (const element of [0, 90, 180, 270]) {
      const variants = pathInfo.get(string);
      if (variants) return [variants.srandomElement()!, element];
      string = string.substring(2, 8) + string.substring(0, 2);
    }

    return [defaultStreet, 0];
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
