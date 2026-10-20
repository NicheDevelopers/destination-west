import AnimatedSprite from "@/Sprite/AnimatedSprite.js";
import { ANIMATION_SPEED, DEFAULT_ENTITY_HP } from "@/global/consts.js";
import { generateID, validateOptions, type Point } from "@/utilities/utilities.js";
import { addTraits, centerPointTrait, HitboxTrait, MovementTrait } from "@/traits.js";
import imgInfo from "@/static/imgInfo.js";
import SpriteLoader from "@/Sprite/SpriteLoader.js";
import type Hitbox from "@/game/HitboxClass.js";
import type Game from "@/game/Game.js";
import type Sprite from "@/Sprite/Sprite.js";
import type Tile from "@/game/Tile.js";

const entityOptions = new Map([
  ["animated", "Boolean. Determines whether the entity has an animated sprite"],
  [
    "movement",
    "Boolean or {speed, sprintMultiplier, sneakMultiplier} object. " +
      "Falsy value means the entity is stationary, any truthy value " +
      "means the entity has movement. Movement construction arguments " +
      "If an object is passed, it provides the arguments for the entity's " +
      "Movement constructor.",
  ],
  ["callback", "function(). Callback function passed to the created Sprite"],
  [
    "hitbox",
    "array[][]. A 2d array of the location the entity is in. If passed," +
      " the entity will have a hitbox and its position will be stored" +
      " on the tiles that intersect with its hitbox (in tile.entities[])",
  ],
  [
    "relativeCenterPoint",
    "{x, y}. Only has effect if provided `hitbox` option" +
      " is truthy. Provides the relativeCenterPoint for the Hitbox" +
      " constructor. By default getSpriteRelativeCenterPoint is run on the" +
      " Entity's Sprite to get this value",
  ],
  [
    "boundingDistance",
    "{left, right, up, down}. Only has effect if provided `hitbox` option" +
      " is truthy. Provides the boundingDistance for the Hitbox constructor." +
      " By default getSpriteBoundingDistance is run on the Entity's Sprite" +
      " to get this value",
  ],
]);

export type EntityOptions = {
  animated?: boolean;
  movement?: {
    speed?: number;
    sprintMultiplier?: number;
    sneakMultiplier?: number;
    playerControlled?: boolean;
  };
  callback?: () => void;
  hitbox?: Tile[][];
  relativeCenterPoint?: Point;
  boundingDistance?: { left: number; right: number; up: number; down: number };
};

class Entity {
  game: Game;
  typeName: string;
  readonly pos: Point;
  hp: number;
  id: number;
  sprite: Sprite | AnimatedSprite;
  hitbox: Hitbox | null;
  callback: () => void;
  isDead: boolean;
  ignoreDepth: boolean;

  constructor(
    game: Entity["game"],
    typeName: Entity["typeName"],
    pos: Point,
    options: EntityOptions = {},
  ) {
    this.game = game;
    validateOptions(options, entityOptions, `Entity (${typeName})`);
    this.typeName = typeName;
    this.pos = { x: pos.x, y: pos.y };
    this.hp = DEFAULT_ENTITY_HP;
    this.id = generateID(Entity);

    if (!options.animated) {
      this.sprite = SpriteLoader.getSprite(typeName, {});
      options.callback?.();
    } else
      this.sprite = new AnimatedSprite(typeName, {
        animationSpeed: ANIMATION_SPEED,
        callback: options.callback,
      });

    const imgInfoEntry = imgInfo.get(typeName);
    if (!imgInfoEntry)
      throw new Error(`Image info for typeName "${typeName}" not found in imgInfo.`);
    this.ignoreDepth = imgInfoEntry.nodepth ?? false;

    if (options.hitbox && !imgInfoEntry.nocollision) {
      const { relativeCenterPoint: spriteRcp, boundingDistance: spriteBd } =
        this.sprite.getSpriteHitboxInfoWithBoundingDistances();
      let rcp = options.relativeCenterPoint ?? spriteRcp;
      let bd = options.boundingDistance ?? spriteBd;
      addTraits(this, HitboxTrait(this, options.hitbox, rcp, bd));
    } else if (!this.ignoreDepth) {
      // Entity does not have a hitbox, but it should have a centerPoint
      // for depth sorting
      let rcp = options.relativeCenterPoint ?? this.sprite.getSpriteHitboxInfoBaselineRcp();
      addTraits(this, centerPointTrait(rcp));
    }

    if (!options.movement) return;

    let mOpts = options.movement;
    addTraits(
      this,
      MovementTrait(this, mOpts?.speed, mOpts?.sprintMultiplier, mOpts?.sneakMultiplier, {
        playerControlled: mOpts?.playerControlled,
      }),
    );
  }

  drawDebugInfo(_cameraX: number, _cameraY: number): void {}

  drawRaw(x: number, y: number, context: CanvasRenderingContext2D): void {
    this.sprite.draw(x, y, context);
  }

  draw(cameraX: number, cameraY: number): void {
    this.sprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
  }

  // enable drawing on different canvases while still using the camera
  drawWithCtx(cameraX: number, cameraY: number, ctx: CanvasRenderingContext2D): void {
    this.sprite.draw(this.pos.x - cameraX, this.pos.y - cameraY, ctx);
  }
}

export default Entity;
