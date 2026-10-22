import { createCanvas, createElement } from "@/lib/dom";
import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import { MAP_PARAMETERS, TOWN_SIZES, WORLD_MAP_DISPLAY as wmd } from "@/game/consts";
import Town from "@/game/Location/Town";
import type Game from "@/game/Game";

class WorldMapDisplay extends State {
  private readonly game: Game;
  private readonly div: HTMLDivElement;
  private readonly mapCanvas: HTMLCanvasElement;
  private readonly mapCtx: CanvasRenderingContext2D;
  readonly actions = ["Toggle Map Display"];

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
    const visitedTowns = map.locations.filter((t) => t.visited);
    const visibleTowns = [
      ...new Set(
        visitedTowns.flatMap((m) => m.connectedLocations).concat(visitedTowns.map((x) => x.ID)),
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
      if (town.visited || visitedTowns.some((t) => t.connectedLocations.includes(town.ID))) {
        if (currentTown?.connectedLocations.includes(town.ID) && town.ID !== currentTown.ID) {
          const d = createElement("div", null, null, ["town-div"], {
            display: "block",
            position: "absolute",
            height: `${size * 2}px`,
            width: `${size * 2}px`,
            left: `${town.pos.x - size}px`,
            top: `${town.pos.y - size}px`,
            "border-radius": "100%",
          });
          d.addEventListener("click", () => {
            this.game.travel(town.ID);
          });
          this.div.appendChild(d);
        }
        let townColor = "black";
        if (currentId === town.ID) townColor = "green";
        if (highlightedIds.includes(town.ID)) townColor = "red";
        drawCircle(ctx, town.pos.x, town.pos.y, size, 2, townColor);
      }
    }
    for (const t of visibleTowns.map((r) => map.getByID(r))) {
      ctx.fillStyle = "white";
      ctx.fillText(t.name, t.pos.x + wmd.townNameOffsetX, t.pos.y + wmd.townNameOffsetY);
    }
  }

  computeTownSize(town: Town): number {
    // make the last town large
    if (town.ID === this.game.worldMap.locations.last?.ID) return TOWN_SIZES.large;
    if (town.connectedLocations.length < wmd.lowConnection) return TOWN_SIZES.small;
    if (town.connectedLocations.length < wmd.mediumConnection) return TOWN_SIZES.medium;
    return TOWN_SIZES.large;
  }

  update(): void {}

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
