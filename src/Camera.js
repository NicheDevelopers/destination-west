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

import ctx, { getGameCanvasSizeX, getGameCanvasSizeY } from "./global/ctx.js";
import { camSettings, playerCenterPoint } from "./global/consts.js";
import { makeEven } from "./global/utilities.js";

import time from "./global/time.js";

/*
 * Render fragments of the world easily
 */
class Camera {
  constructor(game) {
    this.x = 0;
    this.y = 0;
    this.zoom = camSettings.zoom;
    this.zoomMin = camSettings.zoomMin;
    this.zoomMax = camSettings.zoomMax;
    this.zoomSpeed = camSettings.zoomSpeed;
    /* Browsers sometimes struggle to position scaled elements perfectly.
       In order to prevent leaving empty space around the canvas we
       scale it up more than should be needed.
       */
    this.zoomSafetyMultiplier = camSettings.zoomSafetyMultiplier;
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
    window.addEventListener('fullscreenchange', () => this.updateSize());
    this.game = game;

    // Array of draw functions to be run after drawing everything else
    this.debugDraws = [];
    
    // Array of draw functions to be run after drawing everything else
    // elements are deleted after drawing
    this.singleDebugDraws = [];
  }
  addDebugDraw(fun, options={}) {
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
  render(options={}) {
    this.game.app.manageRequest(
      'Camera zoom in',
      () => {
        if (this.zoom < this.zoomMax) {
          this.zoom += this.zoomSpeed * time.delta;
          this.updateSize();
        }
      }
    );
    this.game.app.manageRequest(
      'Camera zoom out',
      () => {
        if (this.zoom > this.zoomMin) {
          this.zoom -= this.zoomSpeed * time.delta;
          this.updateSize();
        }
      }
    );
    ctx.clearRect(0, 0, this.width, this.height);
    
    const playerX = this.game.player.x + playerCenterPoint.x;
    const playerY = this.game.player.y + playerCenterPoint.y - 5;

    const topLeftX = this.x + Math.max(0, Math.min(
      playerX - this.width / 2,
      this.game.currentTown.widthPx - this.width));
    const topLeftY = this.y + Math.max(0, Math.min(
      playerY - this.height / 2,
      this.game.currentTown.heightPx - this.height));

    let t = this.game.currentTown;
    t.draw(topLeftX, topLeftY, ctx, this.width, this.height);
    let [ignoringDepth, byDepth] = t.entitiesByDepth(t, this.game.player);
    for (const e of ignoringDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug) e.drawDebugInfo(topLeftX, topLeftY);
    }
    for (const e of byDepth) {
      e.draw(topLeftX, topLeftY);
      if (options.debug) e.drawDebugInfo(topLeftX, topLeftY);
    }
    if (this.game.app.debugging) {
      this.debugDraws.forEach((draw, ix) => {
	draw(topLeftX, topLeftY);
      });
      this.singleDebugDraws.forEach((draw) => {
	draw(topLeftX, topLeftY);
      });
      this.singleDebugDraws.length = 0;
    }
  }
}

export default Camera;



