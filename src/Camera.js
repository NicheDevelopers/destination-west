/*
  file: src/Game.js
  purpose: define the Game class
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

function makeEven(x){
  if (x%2 == 1)
    x++;
  return x;
}
/*
 * Render fragments of the world easily
 */
class Camera {
  constructor(game) {
    this.x = 0;
    this.y = 0;
    this.zoom = 3;
    this.zoomMin = 1.8;
    this.zoomMax = 5;
    /* Browsers sometimes struggle to position scaled elements perfectly.
       In order to prevent leaving empty space around the canvas we
       scale it up more than should be needed.
       */
    this.zoomSafetyMultiplier = 1.05;
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
    window.addEventListener('fullscreenchange', () => this.updateSize());
    this.game = game;
  }
  updateSize(){
    const gcon = document.querySelector("#game-container");
    const gc = document.querySelector("#game-canvas");
    gc.width = makeEven(Math.ceil(gcon.scrollWidth / this.zoom));
    gc.height = makeEven(Math.ceil(gcon.scrollHeight / this.zoom));
    gc.style.transform = `scale(${this.zoomSafetyMultiplier*this.zoom})`;
    this.width = getGameCanvasSizeX();
    this.height = getGameCanvasSizeY();
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }
  render() {
    this.game.app.manageRequest(
      'Camera zoom in',
      () => {
	if (this.zoom < this.zoomMax) {
	  this.zoom += 0.05;
	  this.updateSize();
	}
      }
    );
    this.game.app.manageRequest(
      'Camera zoom out',
      () => {
	if (this.zoom > this.zoomMin) {
	  this.zoom -= 0.05;
	  this.updateSize();
	}
      }
    );
    ctx.clearRect(0, 0, this.width, this.height);
    const playerX = this.game.player.x
      + this.game.player.spriteCenterPoint.x;
    const playerY = this.game.player.y
      + this.game.player.spriteCenterPoint.y - 5;

    const topLeftX = this.x + Math.max(0, Math.min(
      playerX - this.width / 2,
      this.game.currentTown.widthPx - this.width));
    const topLeftY = this.y + Math.max(0, Math.min(
      playerY - this.height / 2,
      this.game.currentTown.heightPx - this.height));

    this.game.currentTown.draw(topLeftX, topLeftY, ctx,
			       this.width, this.height);

    this.game.player.draw(this.game.player.x - topLeftX,
      this.game.player.y - topLeftY);

    this.game.player.draw(this.game.player.x - topLeftX,
      this.game.player.y - topLeftY);
  }
}

export default Camera;
