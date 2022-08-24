/*
  file: src/Player.js
  purpose: Define the Player class for managing the player-controlled
           character
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

import Entity from "./Entity.js";

/**
 * Class for managing the player-controlled character
 */
class Player extends Entity{
  constructor(game, x=0, y=0){
    super("player", x, y, 120);
    this.game = game;
    this.addUserFunctions();
  }
  addUserFunctions(){
    this.game.registerFunction('Move Right');
    this.game.registerFunction('Move Left');
  }
  update(){
    this.running = false;
    this.game.manageRequest(
      'Move Right',
      () => this.moveRightFunc()
    );
    this.game.manageRequest(
      'Move Left',
      () => this.moveLeftFunc()
    );
    if (!this.running && this.sprite.animation.name !== "idle")
      this.sprite.changeAnimation("idle");
  }
  moveRightFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.running = true;
    this.moveRightAnimation.next();
  }
  moveLeftFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.running = true;
    this.moveLeftAnimation.next();
  }
}

export default Player;
