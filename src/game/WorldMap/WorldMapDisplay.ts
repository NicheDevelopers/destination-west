import { createCanvas, createElement } from "@/lib/dom";
import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import { MAP_PARAMETERS, TOWN_SIZES, WORLD_MAP_DISPLAY } from "@/game/consts";
import Town from "@/game/Location/Town";
import { passesCloseToOtherTown } from "./WorldMap";
import type Game from "@/game/Game";

const DEBUG_COLORS = {
  evenLayer: "#ffffff14",
  oddLayer: "#ffffff28",
  text: "#ffffffcc",
  hiddenRoad: "#00000066",
  hiddenTown: "#00000066",
  roadCloseToTown: "#ff3030",
  visitedRing: "#ffd700",
  notVisitedRing: "#9e9e9e",
} as const;

class WorldMapDisplay extends State {
  private readonly game: Game;
  private readonly div: HTMLDivElement;
  private readonly mapCanvas: HTMLCanvasElement;
  private readonly mapCtx: CanvasRenderingContext2D;
  readonly actions = ["Toggle Map Display"];
  private drawnInDebugMode = false;

  constructor(game: Game) {
    super();
    this.game = game;
    this.div = createElement(
      "div",
      MAP_PARAMETERS.displayWidth,
      MAP_PARAMETERS.displayHeight,
      ["map-canvas-div"],
      {
        position: "absolute",
        display: "none",
        zIndex: "1",
      },
    );
    const { canvas, context } = createCanvas(
      MAP_PARAMETERS.displayWidth,
      MAP_PARAMETERS.displayHeight,
    );
    this.mapCanvas = canvas;
    this.mapCtx = context;
    this.mapCanvas.id = "map-canvas";
    //this.mapCanvas.style.background = 'rgba(150,130,100, 0.8)';
    this.div.appendChild(this.mapCanvas);
    gameContainer.appendChild(this.div);
  }

  draw(): void {
    const map = this.game.worldMap;
    const location = this.game.currentTown;
    const currentTown = location instanceof Town ? location : null;
    // While travelling there is no current town, so highlight the route's endpoints instead
    const [currentId, highlightedIds]: [number, number[]] =
      location instanceof Town
        ? [location.ID, location.connectedLocations]
        : [location.fromId, [location.toId]];
    const ctx = this.mapCtx;
    ctx.fillStyle = "white";
    ctx.font = "20px Verdana";
    ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    // Remove clickable town divs from the previous draw, keeping only the canvas
    this.div.replaceChildren(this.mapCanvas);
    const visitedTowns = map.locations.filter((town) => town.visited);
    const visibleTowns = [
      ...new Set(
        visitedTowns
          .flatMap((town) => town.connectedLocations)
          .concat(visitedTowns.map((town) => town.ID)),
      ),
    ];

    // Draw all connections so that they get completely overlapped by towns
    for (const location of map.locations) {
      for (const connection of location.connectedLocations) {
        const other = map.getByID(connection);
        if (location.visited && (other.visited || visibleTowns.includes(other.ID))) {
          drawLine(ctx, location.pos.x, location.pos.y, other.pos.x, other.pos.y, "black", 3);
        }
      }
    }

    for (const town of map.locations) {
      const size = this.computeTownSize(town);

      // if the town has been visited, is the current town or can be reached from the current town, draw it
      if (
        town.visited ||
        visitedTowns.some((visitedTown) => visitedTown.connectedLocations.includes(town.ID))
      ) {
        if (currentTown?.connectedLocations.includes(town.ID) && town.ID !== currentTown.ID) {
          const townDiv = createElement("div", null, null, ["town-div"], {
            display: "block",
            position: "absolute",
            height: `${size * 2}px`,
            width: `${size * 2}px`,
            left: `${town.pos.x - size}px`,
            top: `${town.pos.y - size}px`,
            "border-radius": "100%",
          });
          townDiv.addEventListener("click", () => {
            this.game.travel(town.ID);
          });
          this.div.appendChild(townDiv);
        }
        let townColor = "black";
        if (currentId === town.ID) townColor = "green";
        if (highlightedIds.includes(town.ID)) townColor = "red";
        drawCircle(ctx, town.pos.x, town.pos.y, size, 2, townColor);
      }
    }
    for (const town of visibleTowns.map((townId) => map.getByID(townId))) {
      ctx.fillStyle = "white";
      this.fillTextInsideCanvas(
        town.name,
        town.pos.x + WORLD_MAP_DISPLAY.townNameOffsetX,
        town.pos.y + WORLD_MAP_DISPLAY.townNameOffsetY,
      );
    }

    this.drawnInDebugMode = this.game.app.debugging;
    if (this.drawnInDebugMode) this.drawDebugInfo(visibleTowns);
  }

  private drawDebugInfo(visibleTownIds: number[]): void {
    const map = this.game.worldMap;
    const ctx = this.mapCtx;
    ctx.save();
    ctx.font = "14px Verdana";

    const layerCount = map.middleLayerCount + 2;
    for (let layer = 0; layer < layerCount; layer++) {
      const { minX, maxX } = map.getLayerXRange(layer);
      ctx.fillStyle = layer % 2 === 0 ? DEBUG_COLORS.evenLayer : DEBUG_COLORS.oddLayer;
      ctx.fillRect(minX, 0, maxX - minX, this.mapCanvas.height);

      let townCount = 0;
      for (const townLayer of map.layerByTownId) {
        if (townLayer === layer) townCount++;
      }
      ctx.fillStyle = DEBUG_COLORS.text;
      this.fillTextInsideCanvas(`Layer ${layer}, ${townCount} towns`, minX + 5, 20);
    }

    for (const town of map.locations) {
      for (const connection of town.connectedLocations) {
        const other = map.getByID(connection);
        if (!town.visited && !other.visited) {
          drawLine(
            ctx,
            town.pos.x,
            town.pos.y,
            other.pos.x,
            other.pos.y,
            DEBUG_COLORS.hiddenRoad,
            2,
          );
        }
      }
    }

    for (const town of map.locations) {
      for (const connection of town.connectedLocations) {
        const other = map.getByID(connection);
        if (passesCloseToOtherTown(town, other, map.locations)) {
          drawLine(
            ctx,
            town.pos.x,
            town.pos.y,
            other.pos.x,
            other.pos.y,
            DEBUG_COLORS.roadCloseToTown,
            3,
          );
        }
      }
    }

    for (const town of map.locations) {
      const size = this.computeTownSize(town);
      if (!visibleTownIds.includes(town.ID)) {
        drawCircle(ctx, town.pos.x, town.pos.y, size, 2, DEBUG_COLORS.hiddenTown);
        ctx.fillStyle = DEBUG_COLORS.text;
        this.fillTextInsideCanvas(
          town.name,
          town.pos.x + WORLD_MAP_DISPLAY.townNameOffsetX,
          town.pos.y + WORLD_MAP_DISPLAY.townNameOffsetY,
        );
      }

      ctx.beginPath();
      ctx.arc(town.pos.x, town.pos.y, size + 4, 0, 2 * Math.PI);
      ctx.lineWidth = 3;
      ctx.strokeStyle = town.visited ? DEBUG_COLORS.visitedRing : DEBUG_COLORS.notVisitedRing;
      ctx.stroke();

      const stats =
        `#${town.ID}, L${map.layerByTownId[town.ID]}, ` +
        `roads ${town.connectedLocations.length}, ${map.sizeByTownId[town.ID]}`;
      ctx.fillStyle = DEBUG_COLORS.text;
      this.fillTextInsideCanvas(
        stats,
        town.pos.x + WORLD_MAP_DISPLAY.townNameOffsetX,
        town.pos.y + WORLD_MAP_DISPLAY.townNameOffsetY + 18,
      );
    }

    const summary =
      `Towns: ${map.locations.length}, Middle layers: ${map.middleLayerCount}, ` +
      `Ring: gold = visited, gray = not visited`;
    ctx.fillStyle = DEBUG_COLORS.text;
    this.fillTextInsideCanvas(summary, 5, this.mapCanvas.height - 8);
    ctx.restore();
  }

  // Keeps text from running off the canvas, e.g. the last town's name at the right edge
  private fillTextInsideCanvas(text: string, x: number, y: number): void {
    const maxX = this.mapCanvas.width - this.mapCtx.measureText(text).width;
    if (x < 0) x = 0;
    if (x > maxX) x = maxX;
    this.mapCtx.fillText(text, x, y);
  }

  computeTownSize(town: Town): number {
    return TOWN_SIZES[this.game.worldMap.sizeByTownId[town.ID]];
  }

  update(): void {
    if (this.game.app.debugging !== this.drawnInDebugMode) this.draw();
  }

  override startHook(): void {
    this.draw();
    this.div.style.display = "block";
  }
  override endHook(): void {
    this.div.style.display = "none";
  }
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  strokeWidth: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  strokeStyle: string,
  lineWidth: number,
): void {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

export default WorldMapDisplay;
