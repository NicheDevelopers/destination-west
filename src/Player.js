/*
  file: src/Player.js
  purpose: Define the Player class for managing the player-controlled
           character
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

import Entity from "./Entity.js";

/**
 * A constant representing the default player speed value
 */
const defaultPlayerSpeed = 100;

/**
 * A constant representing the change in player's speed value while running on diagonals
 */
const defaultDiagonalOffset = 0.71;

/**
 * Class for managing the player-controlled character
 */
class Player extends Entity{
  constructor(game, x=0, y=0){
    super("player", x, y, defaultPlayerSpeed);
    this.game = game;
    this.states = [this.moveLeftUpFunc, this.moveUpFunc, this.moveRightUpFunc, 
                   this.moveLeftFunc, this.idleFunc, this.moveRightFunc, 
                   this.moveLeftDownFunc, this.moveDownFunc, this.moveRightDownFunc];
    this.default_direction = 4; //the default direction being staying idle, on index 4 in the state array
    this.addUserActions();
  }
  addUserActions(){
    this.game.registerAction('Move Right');
    this.game.registerAction('Move Left');
    this.game.registerAction('Move Up');
    this.game.registerAction('Move Down');
  }
  update(){
    this.direction = this.default_direction;
    if (this.game.isActionRequested('Move Right'))
      this.direction += 1;
    if (this.game.isActionRequested('Move Left'))
      this.direction -= 1;
    if (this.game.isActionRequested('Move Up'))
      this.direction -= 3;
    if (this.game.isActionRequested('Move Down'))
      this.direction += 3;
    
    this.sprite.next();
    this.states[this.direction].call(this);
  }
  moveLeftUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveUpAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveLeftAnimation.next();
    this.moveUpAnimation.next();
  }
  moveUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.moveUpAnimation.speed = defaultPlayerSpeed;
    this.moveUpAnimation.next();
  }
  moveRightUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.moveRightAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveUpAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveRightAnimation.next();
    this.moveUpAnimation.next();
  }
  moveLeftFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultPlayerSpeed;
    this.moveLeftAnimation.next();
  }
  idleFunc(){
    if (this.sprite.animation.name !== "idle")
      this.sprite.changeAnimation("idle");
  }
  moveRightFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.moveRightAnimation.speed = defaultPlayerSpeed;
    this.moveRightAnimation.next();
  }
  moveLeftDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveDownAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveLeftAnimation.next();
    this.moveDownAnimation.next();
  }
  moveDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.moveDownAnimation.speed = defaultPlayerSpeed;
    this.moveDownAnimation.next();
  }
  moveRightDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.moveRightAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveDownAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveRightAnimation.next();
    this.moveDownAnimation.next();
  }
}

export default Player;
