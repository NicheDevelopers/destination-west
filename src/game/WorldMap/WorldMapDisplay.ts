import { createCanvas, createElement } from "@/lib/dom";
import type { Point } from "@/lib/utilities";
import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import { MAP_PARAMETERS, TOWN_SIZES, WORLD_MAP_DISPLAY } from "@/game/consts";
import Town from "@/game/Location/Town";
import { passesCloseToOtherTown } from "./WorldMap";
import type Game from "@/game/Game";

const DEBUG_COLORS = {
  evenLayer: "#4e341c0f",
  oddLayer: "#4e341c22",
  text: "#33210f",
  hiddenRoad: "#6a4d2c80",
  roadCloseToTown: "#c0301e",
  visitedRing: "#b8902a",
  notVisitedRing: "#8a8070",
} as const;

const INK_COLORS = {
  visitedRoad: "#4e341c",
  unexploredRoad: "#6a4d2c",
  route: "#9c2a1e",
  currentTownRing: "#4f6b3a",
  reachableTownRing: "#9c2a1e",
  townName: "#33210f",
  townNameOutline: "#dcc48f",
} as const;

const TOWN_ICON_INDEX: Record<keyof typeof TOWN_SIZES, number> = {
  small: 0,
  medium: 1,
  large: 2,
};
const HAT_ICON_INDEX = 3;

const MAP_WIDTH = MAP_PARAMETERS.displayWidth + 2 * WORLD_MAP_DISPLAY.margin;
const MAP_HEIGHT = MAP_PARAMETERS.displayHeight + 2 * WORLD_MAP_DISPLAY.margin;

class WorldMapDisplay extends State {
  private readonly game: Game;
  private readonly div: HTMLDivElement;
  private readonly mapCanvas: HTMLCanvasElement;
  private readonly mapCtx: CanvasRenderingContext2D;
  private readonly parchment = loadImage("img/map-parchment.png");
  private readonly compass = loadImage("img/map-compass.png");
  private readonly icons = loadImage("img/map-icons.png");
  readonly actions = ["Toggle Map Display"];
  private drawnInDebugMode = false;

  constructor(game: Game) {
    super();
    this.game = game;
    this.div = createElement("div", MAP_WIDTH, MAP_HEIGHT, ["map-canvas-div"], {
      position: "absolute",
      display: "none",
      zIndex: "1",
    });
    const { canvas, context } = createCanvas(MAP_WIDTH, MAP_HEIGHT);
    this.mapCanvas = canvas;
    this.mapCtx = context;
    this.mapCanvas.id = "map-canvas";
    this.div.appendChild(this.mapCanvas);
    gameContainer.appendChild(this.div);

    window.addEventListener("resize", () => this.fitToContainer());
    window.addEventListener("fullscreenchange", () => this.fitToContainer());
  }

  draw(): void {
    const ctx = this.mapCtx;
    ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    // Remove clickable town divs from the previous draw, keeping only the canvas
    this.div.replaceChildren(this.mapCanvas);

    ctx.drawImage(this.parchment, 0, 0);
    const compassY = MAP_HEIGHT - this.compass.height - WORLD_MAP_DISPLAY.compassInset;
    ctx.drawImage(this.compass, WORLD_MAP_DISPLAY.compassInset, compassY);

    ctx.save();
    ctx.translate(WORLD_MAP_DISPLAY.margin, WORLD_MAP_DISPLAY.margin);
    const visibleTownIds = this.getVisibleTownIds();
    this.drawRoads();
    this.drawTowns(visibleTownIds);
    for (const townId of visibleTownIds) {
      this.drawTownName(this.game.worldMap.getByID(townId));
    }
    this.drawPlayerHat();

    this.drawnInDebugMode = this.game.app.debugging;
    if (this.drawnInDebugMode) this.drawDebugInfo(visibleTownIds);
    ctx.restore();
  }

  private getVisibleTownIds(): number[] {
    const visitedTowns = this.game.worldMap.locations.filter((town) => town.visited);
    return [
      ...new Set(
        visitedTowns
          .flatMap((town) => town.connectedLocations)
          .concat(visitedTowns.map((town) => town.ID)),
      ),
    ];
  }

  private drawRoads(): void {
    const map = this.game.worldMap;
    for (const town of map.locations) {
      if (!town.visited) continue;
      for (const connection of town.connectedLocations) {
        const other = map.getByID(connection);
        if (other.visited && other.ID < town.ID) continue;
        // The route being travelled is drawn only once, in red
        if (this.isCurrentRoute(town, other)) continue;
        if (other.visited) {
          drawInkRoad(this.mapCtx, town, other, INK_COLORS.visitedRoad, false);
        } else {
          drawInkRoad(this.mapCtx, town, other, INK_COLORS.unexploredRoad, true);
        }
      }
    }

    const location = this.game.currentTown;
    if (location instanceof Town) return;
    const from = map.getByID(location.fromId);
    const to = map.getByID(location.toId);
    const isKnownRoad = from.visited && to.visited;
    drawInkRoad(this.mapCtx, from, to, INK_COLORS.route, !isKnownRoad);
  }

  private isCurrentRoute(a: Town, b: Town): boolean {
    const location = this.game.currentTown;
    if (location instanceof Town) return false;
    if (location.fromId === a.ID && location.toId === b.ID) return true;
    return location.fromId === b.ID && location.toId === a.ID;
  }

  private drawTowns(visibleTownIds: number[]): void {
    const map = this.game.worldMap;
    const location = this.game.currentTown;
    const currentTown = location instanceof Town ? location : null;
    const [currentId, reachableIds]: [number, number[]] =
      location instanceof Town
        ? [location.ID, location.connectedLocations]
        : [location.fromId, [location.toId]];

    for (const townId of visibleTownIds) {
      const town = map.getByID(townId);
      if (town.ID === currentId) {
        this.drawTownRing(town, INK_COLORS.currentTownRing, 0);
      } else if (reachableIds.includes(town.ID)) {
        this.drawTownRing(town, INK_COLORS.reachableTownRing, 0);
      }
      this.drawTownIcon(town);

      if (currentTown?.connectedLocations.includes(town.ID)) {
        this.addTownClickArea(town);
      }
    }
  }

  private getRingCenter(town: Town): Point {
    return {
      x: snapToArtPixel(town.pos.x),
      y: snapToArtPixel(town.pos.y + WORLD_MAP_DISPLAY.ringOffsetY),
    };
  }

  private drawTownRing(town: Town, color: string, extraRadius: number): void {
    drawPixelEllipse(
      this.mapCtx,
      this.getRingCenter(town),
      WORLD_MAP_DISPLAY.ringRadiusX + extraRadius,
      WORLD_MAP_DISPLAY.ringRadiusY + extraRadius,
      color,
    );
  }

  private drawTownIcon(town: Town): void {
    const ctx = this.mapCtx;
    const iconIndex = TOWN_ICON_INDEX[this.game.worldMap.sizeByTownId[town.ID]];
    ctx.save();
    if (!town.visited) ctx.globalAlpha = WORLD_MAP_DISPLAY.unvisitedTownAlpha;
    this.drawIcon(iconIndex, town.pos.x, town.pos.y + WORLD_MAP_DISPLAY.iconTopOffset);
    ctx.restore();
  }

  private drawIcon(iconIndex: number, centerX: number, top: number): void {
    const size = WORLD_MAP_DISPLAY.iconSize;
    const left = snapToArtPixel(centerX) - size / 2;
    this.mapCtx.drawImage(
      this.icons,
      iconIndex * size,
      0,
      size,
      size,
      left,
      snapToArtPixel(top),
      size,
      size,
    );
  }

  private addTownClickArea(town: Town): void {
    const center = this.getRingCenter(town);
    const width = 2 * WORLD_MAP_DISPLAY.ringRadiusX + WORLD_MAP_DISPLAY.artPixel;
    const height = 2 * WORLD_MAP_DISPLAY.ringRadiusY + WORLD_MAP_DISPLAY.artPixel;
    const townDiv = createElement("div", null, null, ["town-div"], {
      display: "block",
      position: "absolute",
      width: `${width}px`,
      height: `${height}px`,
      left: `${center.x + WORLD_MAP_DISPLAY.margin - width / 2 + WORLD_MAP_DISPLAY.artPixel / 2}px`,
      top: `${center.y + WORLD_MAP_DISPLAY.margin - height / 2 + WORLD_MAP_DISPLAY.artPixel / 2}px`,
      "border-radius": "50%",
    });
    townDiv.addEventListener("click", () => {
      this.game.travel(town.ID);
    });
    this.div.appendChild(townDiv);
  }

  private drawTownName(town: Town): void {
    const ctx = this.mapCtx;
    ctx.font = WORLD_MAP_DISPLAY.townNameFont;
    const y = town.pos.y + WORLD_MAP_DISPLAY.townNameOffsetY;
    ctx.fillStyle = INK_COLORS.townNameOutline;
    for (const [dx, dy] of [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ]) {
      this.fillCenteredTextInsideCanvas(town.name, town.pos.x + dx, y + dy);
    }
    ctx.fillStyle = INK_COLORS.townName;
    this.fillCenteredTextInsideCanvas(town.name, town.pos.x, y);
  }

  private drawPlayerHat(): void {
    const location = this.game.currentTown;
    if (location instanceof Town) {
      this.drawIcon(
        HAT_ICON_INDEX,
        location.pos.x,
        location.pos.y + WORLD_MAP_DISPLAY.hatTopOffset,
      );
      return;
    }
    const from = this.game.worldMap.getByID(location.fromId).pos;
    const to = this.game.worldMap.getByID(location.toId).pos;
    const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    this.drawIcon(HAT_ICON_INDEX, middle.x, middle.y - WORLD_MAP_DISPLAY.iconSize / 2);
  }

  private drawDebugInfo(visibleTownIds: number[]): void {
    const map = this.game.worldMap;
    const ctx = this.mapCtx;
    ctx.save();

    this.drawDebugLayers();

    for (const town of map.locations) {
      for (const connection of town.connectedLocations) {
        const other = map.getByID(connection);
        if (other.ID < town.ID) continue;
        if (!town.visited && !other.visited) {
          drawInkRoad(ctx, town, other, DEBUG_COLORS.hiddenRoad, true);
        }
        if (passesCloseToOtherTown(town, other, map.locations)) {
          drawInkRoad(ctx, town, other, DEBUG_COLORS.roadCloseToTown, false);
        }
      }
    }

    for (const town of map.locations) {
      if (!visibleTownIds.includes(town.ID)) {
        this.drawTownIcon(town);
        this.drawTownName(town);
      }

      const ringColor = town.visited ? DEBUG_COLORS.visitedRing : DEBUG_COLORS.notVisitedRing;
      this.drawTownRing(town, ringColor, 2 * WORLD_MAP_DISPLAY.artPixel);

      const stats =
        `#${town.ID}, L${map.layerByTownId[town.ID]}, ` +
        `roads ${town.connectedLocations.length}, ${map.sizeByTownId[town.ID]}`;
      ctx.font = "14px Verdana";
      ctx.fillStyle = DEBUG_COLORS.text;
      this.fillCenteredTextInsideCanvas(
        stats,
        town.pos.x,
        town.pos.y + WORLD_MAP_DISPLAY.townNameOffsetY + 22,
      );
    }

    const summary =
      `Towns: ${map.locations.length}, Middle layers: ${map.middleLayerCount}, ` +
      `Outer ring: gold = visited, gray = not visited`;
    ctx.fillStyle = DEBUG_COLORS.text;
    this.fillTextInsideCanvas(summary, 5, MAP_PARAMETERS.displayHeight + 40);
    ctx.restore();
  }

  private drawDebugLayers(): void {
    const map = this.game.worldMap;
    const ctx = this.mapCtx;
    ctx.font = "14px Verdana";
    const layerCount = map.middleLayerCount + 2;
    for (let layer = 0; layer < layerCount; layer++) {
      const { minX, maxX } = map.getLayerXRange(layer);
      ctx.fillStyle = layer % 2 === 0 ? DEBUG_COLORS.evenLayer : DEBUG_COLORS.oddLayer;
      ctx.fillRect(minX, 0, maxX - minX, MAP_PARAMETERS.displayHeight);

      let townCount = 0;
      for (const townLayer of map.layerByTownId) {
        if (townLayer === layer) townCount++;
      }
      ctx.fillStyle = DEBUG_COLORS.text;
      this.fillTextInsideCanvas(`Layer ${layer}, ${townCount} towns`, minX + 5, 20);
    }
  }

  private fillCenteredTextInsideCanvas(text: string, centerX: number, y: number): void {
    const width = this.mapCtx.measureText(text).width;
    this.fillTextInsideCanvas(text, centerX - width / 2, y);
  }

  // Keeps text from running off the canvas, e.g. the last town's name at the right edge.
  private fillTextInsideCanvas(text: string, x: number, y: number): void {
    const minX = -WORLD_MAP_DISPLAY.margin;
    const maxX = MAP_WIDTH - WORLD_MAP_DISPLAY.margin - this.mapCtx.measureText(text).width;
    if (x < minX) x = minX;
    if (x > maxX) x = maxX;
    this.mapCtx.fillText(text, x, y);
  }

  private fitToContainer(): void {
    const scale = Math.min(
      gameContainer.clientWidth / MAP_WIDTH,
      gameContainer.clientHeight / MAP_HEIGHT,
    );
    this.div.style.transform = `scale(${scale})`;
  }

  update(): void {
    if (this.game.app.debugging !== this.drawnInDebugMode) this.draw();
  }

  override startHook(): void {
    this.fitToContainer();
    this.draw();
    this.div.style.display = "block";
    if (!document.fonts.check(WORLD_MAP_DISPLAY.townNameFont)) {
      void document.fonts.load(WORLD_MAP_DISPLAY.townNameFont).then(() => this.draw());
    }
  }
  override endHook(): void {
    this.div.style.display = "none";
  }
}

function loadImage(src: string): HTMLImageElement {
  const image = new Image();
  image.src = src;
  return image;
}

function snapToArtPixel(value: number): number {
  return Math.round(value / WORLD_MAP_DISPLAY.artPixel) * WORLD_MAP_DISPLAY.artPixel;
}

function fillArtPixel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const pixel = WORLD_MAP_DISPLAY.artPixel;
  ctx.fillRect(snapToArtPixel(x), snapToArtPixel(y), pixel, pixel);
}

function drawInkRoad(
  ctx: CanvasRenderingContext2D,
  from: Town,
  to: Town,
  color: string,
  dashed: boolean,
): void {
  if (from.ID > to.ID) [from, to] = [to, from];
  const dx = to.pos.x - from.pos.x;
  const dy = to.pos.y - from.pos.y;
  const length = Math.hypot(dx, dy);
  const normal = { x: -dy / length, y: dx / length };
  const waveCount = Math.max(1, Math.round(length / 250));
  const phase = ((from.ID * 7 + to.ID * 13) % 10) * 0.6;
  const stepCount = Math.ceil(length / WORLD_MAP_DISPLAY.artPixel);

  ctx.fillStyle = color;
  for (let step = 0; step <= stepCount; step++) {
    if (dashed && Math.floor(step / 3) % 2 === 1) continue;
    const t = step / stepCount;
    const wobble =
      WORLD_MAP_DISPLAY.roadWobble *
      Math.sin(Math.PI * t) *
      Math.sin(2 * Math.PI * waveCount * t + phase);
    const x = from.pos.x + dx * t + normal.x * wobble;
    const y = from.pos.y + dy * t + normal.y * wobble;
    fillArtPixel(ctx, x, y);
  }
}

function drawPixelEllipse(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radiusX: number,
  radiusY: number,
  color: string,
): void {
  ctx.fillStyle = color;
  const stepCount = Math.ceil((2 * Math.PI * radiusX) / WORLD_MAP_DISPLAY.artPixel);
  for (let step = 0; step < stepCount; step++) {
    const angle = (step / stepCount) * 2 * Math.PI;
    fillArtPixel(ctx, center.x + Math.cos(angle) * radiusX, center.y + Math.sin(angle) * radiusY);
  }
}

export default WorldMapDisplay;
