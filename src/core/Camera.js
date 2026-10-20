/*
  file: src/Camera.js
  purpose: define the Camera class
  author: Artur Gulik <https://gitlab.com/ArturGulik>
    
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/

import { ctx, getGameCanvasSizeX, getGameCanvasSizeY } from "./Browser.js";
import { CAM_SETTINGS, CAM_STATES } from "@/global/consts.js";
import { makeEven } from "@/utilities/utilities.js";
import { MultiAnimation } from "./Animation.js";

import time from "@/global/time.js";

/**
 Class that makes rendering fragments of the world easier
*/
class Camera {
  constructor(game) {
    this.state = CAM_STATES.FOCUSED;
    this.focusedEntity = game.player;

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
    this.game = game;

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

  render(options = {}) {
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
      Math.min(this.pos.x - this.width / 2, this.game.currentTown.widthPx - this.width),
    );

    const topLeftY = Math.max(
      0,
      Math.min(this.pos.y - this.height / 2, this.game.currentTown.heightPx - this.height),
    );

    let t = this.game.currentTown;
    t.draw(topLeftX, topLeftY, ctx, this.width, this.height);
    let [ignoringDepth, byDepth] = t.entitiesByDepth(t, this.game.player);
    for (const e of ignoringDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug && e.drawDebugInfo) e.drawDebugInfo(topLeftX, topLeftY);
    }
    for (const e of byDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug && e.drawDebugInfo) e.drawDebugInfo(topLeftX, topLeftY);
    }
    if (this.game.app.debugging) {
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
