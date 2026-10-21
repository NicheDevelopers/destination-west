import { ctx, getGameCanvasSizeX, getGameCanvasSizeY } from "./Browser";
import { CAM_SETTINGS, CAM_STATES } from "./consts";
import { makeEven } from "@/lib/utilities";
import { MultiAnimation } from "./Animation";

import time from "./time";

/**
 Class that makes rendering fragments of the world easier
*/
class Camera {
  constructor(focusedEntity) {
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

    // Run zoom's setter
    this.zoom = CAM_SETTINGS.zoom;

    window.addEventListener("resize", () => this.updateSize());
    window.addEventListener("fullscreenchange", () => this.updateSize());

    // Array of draw functions to be run after drawing everything else
    this.debugDraws = [];

    // Array of draw functions to be run after drawing everything else
    // elements are deleted after drawing
    this.singleDebugDraws = [];
  }

  setFocusedEntity(
    entity,
    newZoom = CAM_SETTINGS.entityFocusZoom,
    animationTime = CAM_SETTINGS.focusChangeTime,
  ) {
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

  addDebugDraw(fun, options = {}) {
    if (options.once) {
      this.singleDebugDraws.push(fun);
      return;
    }
    this.debugDraws.push(fun);
  }

  removeDebugDraw(index) {
    this.debugDraws.splice(index, 1);
  }

  updateSize() {
    const gcon = document.querySelector("#game-container");
    const gc = document.querySelector("#game-canvas");
    gc.width = makeEven(Math.ceil(gcon.scrollWidth / this.zoom));
    gc.height = makeEven(Math.ceil(gcon.scrollHeight / this.zoom));
    gc.style.transform = `scale(${this.zoomSafetyMultiplier * this.zoom})`;
    this.width = getGameCanvasSizeX();
    this.height = getGameCanvasSizeY();
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  manageInputs(keyman) {
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

  render(location, player, options = {}) {
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.state === CAM_STATES.FOCUSED) {
      // Mutate instead of reassigning, animations keep a reference to `pos`
      // TODO: rethink this/maybe improve animations to work without mutating
      Object.assign(this.pos, this.focusedEntity.getCenterPoint());
    } else if (this.state === CAM_STATES.ANIMATING) {
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
      this.debugDraws.forEach((draw, _ix) => {
        draw(topLeftX, topLeftY);
      });
      this.singleDebugDraws.forEach((draw) => {
        draw(topLeftX, topLeftY);
      });
      this.singleDebugDraws.length = 0;
    }
  }

  set zoom(newZoom) {
    this._zoom = newZoom;
    this.updateSize();
  }

  get zoom() {
    return this._zoom;
  }
}

export default Camera;
