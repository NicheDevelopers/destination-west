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

import Sprite, { type SpriteOptions } from "@/Sprite/Sprite.js";

import { ctx } from "@/core/Browser.js";
import { TILE_SIZE } from "@/global/consts.js";

import Hitbox, { Box } from "@/game/HitboxClass.js";
import type Entity from "@/Entity/Entity.js";
import type { Point } from "@/utilities/utilities.js";

const backgroundPrefixes = ["building-", "decoration-", "path-"];

type EntityWithHitbox = Entity & { hitbox: Hitbox };

/**
 * Class for creating tiles - the base of the game world structure
 */
class Tile {
  typeName: string;
  options: SpriteOptions;
  background?: Sprite;
  sprite: Sprite;
  gridPos: Point;
  width: number;
  height: number;
  walkable: boolean;
  entities: EntityWithHitbox[];
  items: unknown[];
  hitbox?: Hitbox;

  /**
   * @param gridPos - Indexes of the tile in its location's tile array
   */
  constructor(typeName: string, gridPos: Point = { x: 0, y: 0 }, options: SpriteOptions = {}) {
    this.typeName = typeName;
    this.options = options;
    if (backgroundPrefixes.some((prefix) => typeName.startsWith(prefix)))
      this.background = new Sprite("sand");
    this.sprite = new Sprite(typeName, options);
    this.gridPos = gridPos;
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.walkable = true;
    this.entities = [];
    this.items = [];
  }

  getBoundingBox(): Box {
    const left = this.gridPos.x * TILE_SIZE;
    const top = this.gridPos.y * TILE_SIZE;
    return new Box(left, left + this.width, top, top + this.height);
  }

  /**
     Checks whether there is an entity of certain type on a tile.
     @param entityClass - The class which members we are looking for on the tile (for example Player or Entity).
   */
  hasEntityOfType(entityClass: abstract new (...args: never[]) => Entity): boolean {
    return this.entities.some((e) => e.constructor.name === entityClass.name);
  }

  addEntity(entity: EntityWithHitbox): void {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity): void {
    this.entities = this.entities.filter((e) => e.id !== entity.id);
  }

  draw(x: number, y: number, context: CanvasRenderingContext2D = ctx): void {
    this.background?.draw(x, y, context);
    this.sprite.draw(x, y, context);
  }
  drawDebugInfo(
    cameraX: number,
    cameraY: number,
    context: CanvasRenderingContext2D = ctx,
    options: { color?: string } = {},
  ): void {
    if (this.hitbox) this.hitbox.draw(cameraX, cameraY, context, options);
    else {
      this.sprite.drawOverlay(
        this.gridPos.x * TILE_SIZE - cameraX,
        this.gridPos.y * TILE_SIZE - cameraY,
        options.color,
        context,
      );
    }
  }
}

export default Tile;
