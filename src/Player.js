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
    super("player", x, y);
    this.game = game;
    this.addUserFunctions();
  }
  addUserFunctions(){
    this.game.registerFunction('Move Right');
    this.game.registerFunction('Move Left');
  }
  update(){
    this.previousX = this.x;
    this.running = false;
    this.game.manageRequest(
      'Move Right',
      () => {this.running = true; this.moveRight()}
    );
    this.game.manageRequest(
      'Move Left',
      () => {this.running = true; this.moveLeft()}
    );
    if (!this.running && this.sprite.animation.name !== "idle")
      this.sprite.changeAnimation("idle");
  }
  moveRight(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    /*
    if (this.awaitingRun) {console.log('awaiting RUN'); return;}
    this.awaitingRun = true;
    setTimeout(() => {this.x+=2; this.awaitingRun = false;}, 50);
    */
    this.x++;
  }
  moveLeft(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.x--;
  }
}

export default Player;
