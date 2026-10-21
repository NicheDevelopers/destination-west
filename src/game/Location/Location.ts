import Tile from "@/engine/Tile";
import Entity from "@/engine/Entity";
import { ctx } from "@/engine/Browser";
import { createCanvas } from "@/lib/dom";
import { distance, comparePositions, type Point } from "@/lib/utilities";
import { seedRoll } from "@/lib/random";
import { TILE_SIZE } from "@/engine/consts";
import { PERCENTAGE_OF_GENERIC_DECORATION as pGD, FOCUS_PARAMETERS } from "@/game/consts";
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

// Members added at runtime by centerPointTrait (traits.js is not typed yet)
type CenterPointed = { getCenterPoint(): Point; relativeCenterPoint?: Point };

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
  array: Tile[][];
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
    this.array = Array.from({ length: width }, (_, x) =>
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
    const { canvas, context: offCtx } = createCanvas(this.widthPx, this.heightPx);
    offCtx.clearRect(0, 0, this.widthPx, this.heightPx);

    this.drawRaw(0, 0, offCtx);
    this.image = new Image(this.widthPx, this.heightPx);
    this.image.onload = () => {
      this.created = true;
    };
    this.image.src = canvas.toDataURL("image/png");
  }

  // check if there's a builing in the 5x5 square surrounding a tile
  nearToBuilding(xPos: number, yPos: number, maxDist: number = 2): boolean {
    for (let i = -maxDist; i <= maxDist; i++)
      for (let j = -maxDist; j <= maxDist; j++) {
        if (xPos + i < 0 || xPos + i >= this.array.length) continue;
        if (yPos + j < 0 || yPos + j >= this.array[0].length) continue;
        if (this.array[xPos + i][yPos + j].hasEntityOfType(Building)) return true;
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
    let rural_generic_decorations = [["cactus-1x"], ["small-stones-1"], ["green-bush-1"]];

    let town_generic_decorations = [
      //["roadsign", 1],
      //["stone-well", 1],
      ["big-bag-3x"],
    ];

    for (let i = 0; i < this.array.length; i++)
      for (let j = 0; j < this.array[0].length; j++) {
        if (this.array[i][j].typeName !== "sand") continue;
        if (this.array[i][j].hasEntityOfType(Building)) continue;

        let array = null;

        if (!this.nearToBuilding(i, j) && seedRoll(pGD.town_percentage))
          array = town_generic_decorations;
        else if (!this.nearToBuilding(i, j) && seedRoll(pGD.rural_percentage))
          array = rural_generic_decorations;

        if (array)
          this.decorations.push(
            new Entity(
              "decoration-" + array.srandomElement()!,
              { x: i * TILE_SIZE, y: j * TILE_SIZE },
              { hitbox: this.array },
            ),
          );
      }
  }

  getNumOfTiles(): number {
    return this.array.length * this.array[0].length;
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
        this.array[x][y] = new Tile("sand", { x, y });
      }
    }
    let width = widthInTiles * TILE_SIZE;
    let height = heightInTiles * TILE_SIZE;
    let rcp = {
      x: ~~(width / 2),
      y: ~~(height / 2),
    };
    let bd = {
      left: width - rcp.x - 1,
      right: width - rcp.x - 1,
      up: height - rcp.y - 1 - TILE_SIZE / 2,
      down: height - rcp.y - 1,
    };
    this.buildings.push(
      new Building(
        { x: gridPos.x * TILE_SIZE, y: gridPos.y * TILE_SIZE },
        widthInTiles,
        heightInTiles,
        buildingType,
        Object.assign(options, {
          hitbox: this.array,
          relativeCenterPoint: rcp,
          boundingDistance: bd,
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
      for (let i = street.start.x; i < street.start.x + street.width; ++i)
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          streetArray[i][j] = true;
        }
    });

    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i) {
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          this.awaitAssets++;
          let nameAndDegree = this.chooseStreet(streetArray, i, j);
          this.array[i][j] = new Tile(
            nameAndDegree[0],
            { x: i, y: j },
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
    let minDist = FOCUS_PARAMETERS.minDist;

    const playerCp = (player as Player & CenterPointed).getCenterPoint();

    for (const item of this.getInteractibles()) {
      const itemCp = (item as LocationInteractible & CenterPointed).getCenterPoint();
      let d = distance(itemCp, playerCp);

      if (
        (player.isFacingRight() && itemCp.x > playerCp.x) ||
        (!player.isFacingRight() && itemCp.x < playerCp.x)
      ) {
        d += FOCUS_PARAMETERS.facingPenalty;
      }

      if (d < minDist) {
        minDist = d;
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
    for (let x = 0; x < this.array.length; ++x)
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.draw(x0 + tile.gridPos.x * TILE_SIZE, y0 + tile.gridPos.y * TILE_SIZE, context);
      }
  }
  drawDebugInfo(cameraX: number, cameraY: number): void {
    for (let x = 0; x < this.array.length; ++x)
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.drawDebugInfo(cameraX, cameraY);
      }
  }

  /* Returns two arrays:
     1. Entities that should be drawn first and depth doesn't matter.
     2. Entities where depth matters, sorted in drawing order. */
  entitiesByDepth(location: Location, player: Player): [Drawable[], Drawable[]] {
    let arr: (Drawable & Partial<CenterPointed> & { ignoreDepth?: boolean })[] = [
      location.droppedItems,
      location.containers,
      location.npcs,
      location.decorations,
      location.buildings,
      location.portals,
      player,
    ].flat();

    let sorted = arr
      .filter((e) => !e.ignoreDepth)
      .sort((e1, e2) => {
        const y1 =
          (e1.relativeCenterPoint ? e1.pos.y + e1.relativeCenterPoint.y : 0) || e1.pos.y + 64;
        const y2 =
          (e2.relativeCenterPoint ? e2.pos.y + e2.relativeCenterPoint.y : 0) || e2.pos.y + 64;

        return y1 - y2;
      });

    return [arr.filter((e) => e.ignoreDepth), sorted];
  }

  update(player: Player): void {
    this.npcs.forEach((npc) => npc.update());

    if (this.lastPlayerPos && comparePositions(player.pos, this.lastPlayerPos)) return;

    this.updateFocus(player);
    this.lastPlayerPos = { ...player.pos };
  }
}

export default Location;
