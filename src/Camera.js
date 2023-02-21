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

import ctx from "./global/ctx.js";

/*
 * Render fragments of the world easily
 */
class Camera {
  constructor(game) {
    this.x = 0;
    this.y = 0;
    this.width = 672;
    this.height = 288;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.game = game;
  }
  render() {
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

    this.game.currentTown.draw(topLeftX, topLeftY);
    this.game.player.draw(this.game.player.x - topLeftX,
      this.game.player.y - topLeftY);

    ctx.font = "16px serif";
    ctx.fillText(`FPS: ${this.game.app.fps}`, 606, 16);
  }
}

export default Camera;
