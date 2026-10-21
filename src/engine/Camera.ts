import { ctx, getGameCanvasSizeX, getGameCanvasSizeY } from "./Browser";
import { CAM_SETTINGS, CAM_STATES } from "./consts";
import { makeEven, type Point } from "@/lib/utilities";
import { MultiAnimation } from "./Animation";
import type { KeyboardManager } from "./KeyboardManager";

import time from "./time";

interface FocusableEntity {
  getCenterPoint(): Point;
}

interface DrawableEntity {
  draw(cameraX: number, cameraY: number): void;
  drawDebugInfo?(cameraX: number, cameraY: number): void;
}

interface RenderedLocation {
  widthPx: number;
  heightPx: number;
  draw(
    x: number,
    y: number,
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void;
  entitiesByDepth(
    location: RenderedLocation,
    player: FocusableEntity,
  ): [DrawableEntity[], DrawableEntity[]];
}

type DebugDraw = (cameraX: number, cameraY: number) => void;

/**
 Class that makes rendering fragments of the world easier
*/
class Camera {
  state: number;
  focusedEntity: FocusableEntity;
  pos: Point;
  zoomSafetyMultiplier: number;
  zoomMin: number;
  zoomMax: number;
  zoomSpeed: number;
  debugDraws: DebugDraw[];
  singleDebugDraws: DebugDraw[];
  animation: MultiAnimation | null = null;
  width = 0;
  height = 0;
  private currentZoom: number = CAM_SETTINGS.zoom;

  constructor(focusedEntity: FocusableEntity) {
    this.state = CAM_STATES.FOCUSED;
    this.focusedEntity = focusedEntity;

    /**
       The coordinates of the currently focused spot
    */
    this.pos = this.focusedEntity.getCenterPoint();

    //console.log('focus: ', this.focus);

    /* Browsers sometimes struggle to position scaled elements perfectly.
       In order to prevent leaving empty space around the canvas we
       scale it up more than should be needed.
    */
    this.zoomSafetyMultiplier = CAM_SETTINGS.zoomSafetyMultiplier;

    this.zoomMin = CAM_SETTINGS.zoomMin;
    this.zoomMax = CAM_SETTINGS.zoomMax;
    this.zoomSpeed = CAM_SETTINGS.zoomSpeed;

    this.updateSize();

    window.addEventListener("resize", () => this.updateSize());
    window.addEventListener("fullscreenchange", () => this.updateSize());

    // Array of draw functions to be run after drawing everything else
    this.debugDraws = [];

    // Array of draw functions to be run after drawing everything else
    // elements are deleted after drawing
    this.singleDebugDraws = [];
  }

  setFocusedEntity(
    entity: FocusableEntity,
    newZoom: number = CAM_SETTINGS.entityFocusZoom,
    animationTime: number = CAM_SETTINGS.focusChangeTime,
  ): void {
    this.animation = new MultiAnimation(this, ["pos.x", "pos.y", "zoom"], [], {
      endAfter: animationTime,
    });
    this.animation.goal = [
      () => entity.getCenterPoint().x,
      () => entity.getCenterPoint().y,
      newZoom,
    ];

    this.animation.quantums = [1, 1, 0.01];

    this.focusedEntity = entity;

    this.state = CAM_STATES.ANIMATING;
  }

  addDebugDraw(fun: DebugDraw, options: { once?: boolean } = {}): void {
    if (options.once) {
      this.singleDebugDraws.push(fun);
      return;
    }
    this.debugDraws.push(fun);
  }

  removeDebugDraw(index: number): void {
    this.debugDraws.splice(index, 1);
  }

  updateSize(): void {
    const gameContainer = document.querySelector("#game-container");
    const gameCanvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (!gameContainer || !gameCanvas) {
      throw new Error("Missing #game-container or #game-canvas element");
    }

    gameCanvas.width = makeEven(Math.ceil(gameContainer.scrollWidth / this.zoom));
    gameCanvas.height = makeEven(Math.ceil(gameContainer.scrollHeight / this.zoom));
    gameCanvas.style.transform = `scale(${this.zoomSafetyMultiplier * this.zoom})`;
    this.width = getGameCanvasSizeX();
    this.height = getGameCanvasSizeY();
  }

  manageInputs(keyman: Pick<KeyboardManager, "manageInput">): void {
    keyman.manageInput(
      "Camera zoom in",
      () => {
        if (this.zoom < this.zoomMax) {
          this.zoom += this.zoomSpeed * time.delta;
        }
      },
      { once: false },
    );
    keyman.manageInput(
      "Camera zoom out",
      () => {
        if (this.zoom > this.zoomMin) {
          this.zoom -= this.zoomSpeed * time.delta;
        }
      },
      { once: false },
    );
  }

  render(
    location: RenderedLocation,
    player: FocusableEntity,
    options: { debug?: boolean } = {},
  ): void {
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.state === CAM_STATES.FOCUSED) {
      // Mutate instead of reassigning, animations keep a reference to `pos`
      // TODO: rethink this/maybe improve animations to work without mutating
      Object.assign(this.pos, this.focusedEntity.getCenterPoint());
    } else if (this.state === CAM_STATES.ANIMATING && this.animation) {
      if (!this.animation.next()) {
        // Animation finished
        this.state = CAM_STATES.FOCUSED;
      }
    }

    const topLeftX = Math.max(
      0,
      Math.min(this.pos.x - this.width / 2, location.widthPx - this.width),
    );

    const topLeftY = Math.max(
      0,
      Math.min(this.pos.y - this.height / 2, location.heightPx - this.height),
    );

    location.draw(topLeftX, topLeftY, ctx, this.width, this.height);
    let [ignoringDepth, byDepth] = location.entitiesByDepth(location, player);
    for (const e of ignoringDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug && e.drawDebugInfo) e.drawDebugInfo(topLeftX, topLeftY);
    }
    for (const e of byDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug && e.drawDebugInfo) e.drawDebugInfo(topLeftX, topLeftY);
    }
    if (options.debug) {
      for (const draw of this.debugDraws) {
        draw(topLeftX, topLeftY);
      }
      for (const draw of this.singleDebugDraws) {
        draw(topLeftX, topLeftY);
      }
      this.singleDebugDraws.length = 0;
    }
  }

  set zoom(newZoom: number) {
    this.currentZoom = newZoom;
    this.updateSize();
  }

  get zoom(): number {
    return this.currentZoom;
  }
}

export default Camera;
