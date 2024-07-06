/*
  file: src/Entity.js
  purpose: Define the Entity super class for creating entity classes
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Kamil Małecki <https://gitlab.com/gaussx>
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

import Sprite from "../Sprite/Sprite.js";
import AnimatedSprite from "../Sprite/AnimatedSprite.js";
import { animationSpeed, defaultEntityHp } from "../global/consts.js";
import { generateID, validateOptions } from "../global/utilities.js";
import {
  addTraits,
  centerPointTrait,
  HitboxTrait,
  MovementTrait,
} from "../traits.js";
import imgInfo from "../static/imgInfo.js";

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

/**
 * The super class for entity classes to derive from
 @abstract
 */
class Entity {
  constructor(game, typeName, x = 0, y = 0, options = {}) {
    this.game = game;
    validateOptions(options, entityOptions, `Entity (${typeName})`);
    this.typeName = typeName;
    this.x = x;
    this.y = y;
    this.hp = defaultEntityHp;
    this.id = generateID(Entity);

    if (!options.animated)
      this.sprite = new Sprite(typeName, { callback: options.callback });
    else
      this.sprite = new AnimatedSprite(typeName, {
        animationSpeed: animationSpeed,
        callback: options.callback,
      });

    this.ignoreDepth = imgInfo.get(typeName).nodepth;

    if (options.hitbox && !imgInfo.get(typeName).nocollision) {
      let { relativeCenterPoint: spriteRcp, boundingDistance: spriteBd } =
        this.sprite.getSpriteHitboxInfo();
      let rcp = options.relativeCenterPoint ?? spriteRcp;
      let bd = options.boundingDistance ?? spriteBd;
      addTraits(this, HitboxTrait(this, options.hitbox, rcp, bd));
    } else if (!this.ignoreDepth) {
      // Entity does not have a hitbox, but it should have a centerPoint
      // for depth sorting
      let rcp =
        options.relativeCenterPoint ??
        this.sprite.getSpriteHitboxInfo({ getBaselineRcp: true });
      addTraits(this, centerPointTrait(rcp));
    }

    if (!options.movement) return;

    let mOpts = options.movement;
    addTraits(
      this,
      MovementTrait(
        this,
        mOpts?.speed,
        mOpts?.sprintMultiplier,
        mOpts?.sneakMultiplier,
        { playerControlled: mOpts?.playerControlled },
      ),
    );
  }

  drawDebugInfo(cameraX, cameraY) {}

  drawRaw(x, y, context) {
    this.sprite.draw(x, y, context);
  }

  draw(cameraX, cameraY) {
    this.sprite.draw(this.x - cameraX, this.y - cameraY);
  }
  
  // enable drawing on different canvases while still using the camera
  drawWithCtx(cameraX, cameraY, ctx) {
    this.sprite.draw(this.x - cameraX, this.y - cameraY, ctx);
  }
}

export default Entity;
