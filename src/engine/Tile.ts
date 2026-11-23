import Sprite, { type SpriteOptions } from "@/engine/Sprite/Sprite";

import { ctx } from "./Browser";
import { SAND_VARIANTS, TILE_SIZE } from "./consts";

import Hitbox, { Box } from "./Hitbox";
import type Entity from "./Entity";
import { randIntInRange } from "@/lib/random";
import type { Point } from "@/lib/utilities";

const backgroundPrefixes = ["building-", "decoration-", "path-"];

// Picking a random variant and turning it a random way hides the repeating texture
function randomSandSprite(callback: () => void): Sprite {
  return new Sprite(`sand-${randIntInRange(1, SAND_VARIANTS + 1)}`, {
    rotation: randIntInRange(0, 4) * 90,
    callback,
  });
}

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
  entities: Entity[];
  hitbox?: Hitbox;

  /**
   * @param gridPos - Indexes of the tile in its location's tile array
   */
  constructor(typeName: string, gridPos: Point = { x: 0, y: 0 }, options: SpriteOptions = {}) {
    this.typeName = typeName;
    this.options = options;

    const hasBackground = backgroundPrefixes.some((prefix) => typeName.startsWith(prefix));
    let spritesLoading = hasBackground ? 2 : 1;
    const onSpriteLoaded = (): void => {
      spritesLoading--;
      if (spritesLoading === 0) options.callback?.();
    };

    if (hasBackground) this.background = randomSandSprite(onSpriteLoaded);
    if (typeName === "sand") {
      this.sprite = randomSandSprite(onSpriteLoaded);
    } else {
      this.sprite = new Sprite(typeName, { ...options, callback: onSpriteLoaded });
    }
    this.gridPos = gridPos;
    this.width = this.sprite.width;
    this.height = this.sprite.height;
    this.entities = [];
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
    return this.entities.some((e) => e.constructor === entityClass);
  }

  addEntity(entity: Entity): void {
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
