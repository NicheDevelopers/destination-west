/*
  file: src/Tile.js
  purpose: define the Tile class, the base of the game world structure
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

import Sprite from "./Sprite/Sprite.js";

import ctx from "./global/ctx.js";
import Hitbox from "./Hitbox.js";
/**
 * Class for creating tiles - the base of the game world structure
 */
class Tile {
  constructor(typeName, x = 0, y = 0, options = {}) {
    this.typeName = typeName;
    this.options = options;
    if (typeName.substring(0, 9) === 'building-' ||
      typeName.substring(0, 11) === 'decoration-' ||
      typeName.substring(0, 5) === 'path-') this.background = new Sprite('sand');
    this.sprite = new Sprite(typeName, options);
    this.x = x;
    this.y = y;
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.relativeCenterPoint = {x:~~(this.width/2), y:~~(this.height/2)};
    this.walkable = true;
    
    this.hitbox = new Hitbox
    (this,
     {up: this.relativeCenterPoint.y-1,
      left: this.relativeCenterPoint.x-1,
      right: this.width-this.relativeCenterPoint.x,
      down: this.height-this.relativeCenterPoint.y});
    this.debug = false;
    this.items = [];
  }
  draw(x, y, context = ctx) {
    this.background?.draw(x, y, context);
    this.sprite.draw(x, y, context);
  }
  drawDebugInfo(cameraX, cameraY, context = ctx, options={}) {
    this.hitbox.draw(cameraX, cameraY, context, options);
  }
  getCenterPoint() {
    return {x: this.x + this.relativeCenterPoint.x,
	    y: this.y + this.relativeCenterPoint.y};
  }
}

export default Tile;
