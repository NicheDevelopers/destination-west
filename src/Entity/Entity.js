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
import Animation from "../Animation.js";
import { animationSpeed } from "../global/consts.js";
import { validateOptions } from "../global/utilities.js";

const entityOptions = new Map([
  ["animated",
   "Boolean. Determines whether the entity has an animated sprite"],
  ["speed",
   "Number. Provides the speed for the entity's movement. " +
    "Undefined means the entity is stationary"],
  ["ignoreDepth",
   "Boolean. Determines whether the entity should be considered when " +
    "calculating depth. For example, small rocks should always be drawn first so they don't get overlayed on a barrel."]
]);

/**
 * The super class for entity classes to derive from
 @abstract
 */
class Entity {
  constructor(typeName, x = 0, y = 0, options={}) {
    validateOptions(options, entityOptions, "Entity");

    this.typeName = typeName;
    this.x = x;
    this.y = y;
    
    if (!options.animated)
      this.sprite = new Sprite(typeName);
    else
      this.sprite = new AnimatedSprite(
        typeName, { 
        animationSpeed: animationSpeed 
      });

    if (options.speed !== undefined) {
      this.moveX = new Animation(this, "x", options.speed);
      this.moveY = new Animation(this, "y", options.speed);
    }
    this.ignoreDepth = Boolean(options.ignoreDepth);
  }

  drawDebugInfo(cameraX, cameraY) {
  }
  
  draw(cameraX, cameraY) {
    this.sprite.draw(this.x - cameraX, this.y -cameraY);
  }
}

export default Entity;
