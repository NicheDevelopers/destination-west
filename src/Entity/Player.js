/*
  file: src/Player.js
  purpose: Define the Player class for managing the player-controlled
           character
  authors: Kamil Małecki <https://gitlab.com/gaussx>
           Artur Gulik <https://gitlab.com/ArturGulik>
  
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
import imgInfo from "../static/imgInfo.js";

import tileSize from "../global/tileSize.js";

/**
 * a constant representing the default player speed value
 */
const defaultPlayerSpeed = 100;

/**
 * a constant representing the change in player's speed value while running on diagonals
 */
const defaultDiagonalOffset = 0.71;

/**
 * constants representing the width and height of the character sprite.
 */

const playerWidth = imgInfo.get("player").width;
const playerHeight = imgInfo.get("player").height;

/**
 * constants representing the default speed multipliers for sneaking and sprinting
 */

const defaultSprintMultiplier = 1.5;
const defaultSneakMultiplier = 0.5;

/**
 * variables containing information on whether sprint and sneak are handled by "hold"-ing the key down or "toggle"-ing the states by pressing the key once
 */
const defaultSprintMode = 'hold';
const defaultSneakMode = 'hold';

/**
 * class for managing the player-controlled character
 */
class Player extends Entity{
  constructor(game, x=0, y=0){
    super("player", x, y, defaultPlayerSpeed);
    this.game = game;
    //an object containing info on the player model's center point. once we get normal sized sprites this will be much cleaner.
    this.defaultCenterPoint = {x: 24, //for the inaccurate sprite we have now this is around the center point
                               y: 30};
    //an object which contains info on how many pixels from the center point you want to detect collisions
    this.standardCenterPointDeviation = {up: -1,
                                         left: -10,
                                         right: 10,
                                         down: playerHeight - this.defaultCenterPoint.y}
    //an object containing appropriate center point deviation so that the player's model doesn't go out of bounds.
    this.CenterPoint = {x: this.x + this.defaultCenterPoint.x, 
                        y: this.y + this.defaultCenterPoint.y};
    //array of functions which handles player movement
    this.states = [this.moveLeftUpFunc, this.moveUpFunc, this.moveRightUpFunc, 
                   this.moveLeftFunc, this.idleFunc, this.moveRightFunc, 
                   this.moveLeftDownFunc, this.moveDownFunc, this.moveRightDownFunc];
    //array of information on which pixels should be checked for colliding objects
    this.boundaries = [[this.standardCenterPointDeviation.left, this.standardCenterPointDeviation.up], [0, this.standardCenterPointDeviation.up], [this.standardCenterPointDeviation.right, this.standardCenterPointDeviation.up],
                       [this.standardCenterPointDeviation.left, 0], [0, 0], [this.standardCenterPointDeviation.right, 0],
                       [this.standardCenterPointDeviation.left, this.standardCenterPointDeviation.down], [0, this.standardCenterPointDeviation.down], [this.standardCenterPointDeviation.right, this.standardCenterPointDeviation.down]];
    this.default_direction = 4; //the default direction being staying idle, on index 4 in the state array
    this.currentTown = this.game.testTown;
    this.sprintMode = defaultSprintMode;
    this.sneakMode = defaultSneakMode;
    this.townLength = this.currentTown.array.length;
    this.townWidth = this.currentTown.array[0].length;
    this.sprinting = false;
    this.sneaking = false;
    this.addUserActions();
  }
  addUserActions(){ //register all actions that the player can do and bind them to correct keys
    this.game.registerAction('Move Right');
    this.game.registerAction('Move Left');
    this.game.registerAction('Move Up');
    this.game.registerAction('Move Down');
    this.game.registerAction('Toggle Sprint');
    this.game.registerAction('Toggle Sneak');
  }
  update(){ //manages everything
    //resets the player movement's direction
    this.direction = this.default_direction;
    if (this.sprintMode === 'hold'){
      this.sprinting = false;
    }
    if (this.sneakMode === 'hold'){
      this.sneaking = false;
    }
    //find where the center point of the player's sprite in current frame is in relation to the entire map
    this.CenterPoint.x = this.x + this.defaultCenterPoint.x;
    this.CenterPoint.y = this.y + this.defaultCenterPoint.y;
    //calculate the direction in which the player is moving, according to this diagram:
    //       N
    //    0  1  2
    // W  3  4  5  E
    //    6  7  8
    //       S
    if (this.game.isActionRequested('Move Right'))
      this.direction += 1;
    if (this.game.isActionRequested('Move Left'))
      this.direction -= 1;
    if (this.game.isActionRequested('Move Up'))
      this.direction -= 3;
    if (this.game.isActionRequested('Move Down'))
      this.direction += 3;
    //manages sprinting and sneaking states
    this.game.manageRequest('Toggle Sprint',
                             () => this.toggleSprint(), {once: (this.sprintMode === 'toggle')? true : false});
    this.game.manageRequest('Toggle Sneak',
                             () => this.toggleSneak(), {once: (this.sneakMode === 'toggle')? true : false});
    if (this.sprinting && this.sneaking) //checks if the player is trying to move slow and fast at the same time
      this.sprinting = false, this.sneaking = false;
    if (!this.doesCollide(this.direction)) //moves the player if movement is not obstructed
      this.states[this.direction].call(this);
    else{
      //if the player wanted to move right but is blocked, they will look right
      if (this.direction === 2 || this.direction === 5 || this.direction === 8)
        this.sprite.mirrored = false;
      //if the player wanted to move left but is blocked, they will look left
      if (this.direction === 0 || this.direction === 3 || this.direction === 6)
        this.sprite.mirrored = true;
      if (this.sprite.animation.name !== "idle") //this makes the player stop running instead of constantly running into a wall
        this.sprite.changeAnimation("idle");
    }
    this.sprite.next();
  }
  doesCollide(direction){
    //~~(a/b) is a fast way to do integer division. we need this to find the index of the tile we want to check.
    if (~~((this.CenterPoint.x + this.boundaries[direction][0])/tileSize) < 0 || ~~((this.CenterPoint.x + this.boundaries[direction][0])/tileSize) >= this.townLength || ~~((this.CenterPoint.y + this.boundaries[direction][1])/tileSize) < 0 || ~~((this.CenterPoint.y + this.boundaries[direction][1])/tileSize) >= this.townWidth)
      return 1;
    if ((this.currentTown.array[~~((this.CenterPoint.x + this.boundaries[direction][0])/tileSize)][~~((this.CenterPoint.y + this.boundaries[direction][1])/tileSize)].walkable))
      return 0;
    return 1;
  }
  toggleSprint(){
    this.sprinting = !this.sprinting;
  }
  toggleSneak(){
    this.sneaking = !this.sneaking;
  }
  //below are simple yet many functions which handle movement in every direction
  //movement on diagonals is slower because math
  moveLeftUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveUpAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    if (this.sprinting){
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
      this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
    }
    if (this.sneaking){
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
      this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
    }
    this.moveLeftAnimation.next();
    this.moveUpAnimation.next();
  }
  moveUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
      this.moveUpAnimation.speed = defaultPlayerSpeed;
      if (this.sprinting)
        this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier;
      if (this.sneaking)
        this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier;
        this.moveUpAnimation.next();
  }
  moveRightUpFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.moveRightAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveUpAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    if (this.sprinting){
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
      this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
    }
    if (this.sneaking){
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
      this.moveUpAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
    }
    this.moveRightAnimation.next();
    this.moveUpAnimation.next();
  }
  moveLeftFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultPlayerSpeed;
    if (this.sprinting)
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier;
    if (this.sneaking)
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier;
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
    if (this.sprinting)
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier;
    if (this.sneaking)
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier;
    this.moveRightAnimation.next();
  }
  moveLeftDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = true;
    this.moveLeftAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveDownAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    if (this.sprinting){
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
    }
    if (this.sneaking){
      this.moveLeftAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
    }
    this.moveLeftAnimation.next();
    this.moveDownAnimation.next();
  }
  moveDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.moveDownAnimation.speed = defaultPlayerSpeed;
    if (this.sprinting)
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier;
    if (this.sneaking)
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier;
    this.moveDownAnimation.next();
  }
  moveRightDownFunc(){
    if (this.sprite.animation.name !== "run")
      this.sprite.changeAnimation("run");
    this.sprite.mirrored = false;
    this.moveRightAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    this.moveDownAnimation.speed = defaultDiagonalOffset * defaultPlayerSpeed;
    if (this.sprinting){
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSprintMultiplier * defaultDiagonalOffset;
    }
    if (this.sneaking){
      this.moveRightAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
      this.moveDownAnimation.speed = defaultPlayerSpeed * defaultSneakMultiplier * defaultDiagonalOffset;
    }
    this.moveRightAnimation.next();
    this.moveDownAnimation.next();
  }
}

export default Player;
