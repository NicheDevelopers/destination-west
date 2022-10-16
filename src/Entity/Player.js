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

import ctx from "../global/ctx.js";

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
    
    // Cooridinates of the sprite's center point
    this.spriteCenterPoint = {x:24, y: 30};
    // Coordinates for calculating collisions
    this.rootPoint = {x: 24, y: 35};
    
    //an object which contains info on how many pixels from the center point you want to detect collisions
    this.boundingDistance =
      {up: -1,
       left: -5,
       right: 5,
       down: 1}
    //an object containing appropriate center point deviation so that the player's model doesn't go out of bounds.
    this.centerPoint = {x: this.x + this.rootPoint.x, 
                        y: this.y + this.rootPoint.y};
    
    //array of information on which pixels should be checked for colliding objects
    this.boundaries = [
      [this.boundingDistance.left, this.boundingDistance.up],
      [0, this.boundingDistance.up],
      [this.boundingDistance.right, this.boundingDistance.up],
      [this.boundingDistance.left, 0],
      [0, 0],
      [this.boundingDistance.right, 0],
      [this.boundingDistance.left, this.boundingDistance.down],
      [0, this.boundingDistance.down],
      [this.boundingDistance.right, this.boundingDistance.down]];
        
    this.default_direction = 4; //the default direction being staying idle, on index 4 in the state array
    this.sprintMode = defaultSprintMode;
    this.sneakMode = defaultSneakMode;
    this.townLength = this.game.currentTown.array.length;
    this.townWidth = this.game.currentTown.array[0].length;
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
  updateMovementMethod(){
    if (this.sprintMode === 'hold'){
      this.sprinting = false;
    }
    if (this.sneakMode === 'hold'){
      this.sneaking = false;
    }
    this.game.manageRequest(
      'Toggle Sprint',
      () => this.toggleSprint(),
      {once: (this.sprintMode === 'toggle')? true : false});
    
    this.game.manageRequest(
      'Toggle Sneak',
      () => this.toggleSneak(),
      {once: (this.sneakMode === 'toggle')? true : false});
    
    if (this.sprinting && this.sneaking)
      this.sprinting = false, this.sneaking = false;

  }
  update(){
    this.direction = this.default_direction;
    this.updateMovementMethod();
   
    this.centerPoint.x = this.x + this.rootPoint.x;
    this.centerPoint.y = this.y + this.rootPoint.y;
    
    //calculate the direction in which the player should move, according to this diagram:
    //       N
    //    0  1  2
    // W  3  4  5  E
    //    6  7  8
    //       S
    
    let speedX=0, speedY=0;

    let baseSpeed = // the highest speed possible in this tick
      defaultPlayerSpeed * ((this.sprinting)? defaultSprintMultiplier :
	(this.sneaking)? defaultSneakMultiplier : 1);

    if (this.game.isActionRequested('Move Right')){
      this.direction += 1;
      speedX += baseSpeed;
    }
    if (this.game.isActionRequested('Move Left')){
      this.direction -= 1;
      speedX -= baseSpeed;
    }
    if (this.game.isActionRequested('Move Up')){
      this.direction -= 3;
      speedY -= baseSpeed;
    }
    if (this.game.isActionRequested('Move Down')){
      this.direction += 3;
      speedY += baseSpeed;
    }

    if (this.direction % 3 === 0){
      this.sprite.mirrored = true;
    }
    if (this.direction % 3 === 2) {
      this.sprite.mirrored = false;
    }

    this.speedForDebug = baseSpeed;
    
    // Collisions
    if (this.direction < 3 && this.willCollide(1, baseSpeed)) {
      this.direction += 3;
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.direction > 5 && this.willCollide(7, baseSpeed)) {
      this.direction -= 3;
      speedX *= defaultDiagonalOffset;
      speedY = 0;
    }
    if (this.direction % 3 === 0 && this.willCollide(3, baseSpeed)) {
      this.direction += 1;
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }
    if (this.direction % 3 === 2 && this.willCollide(5, baseSpeed)) {
      this.direction -= 1;
      speedX = 0;
      speedY *= defaultDiagonalOffset;
    }

    if (this.direction % 2 == 0 && this.direction !== 4){
      speedX *= defaultDiagonalOffset;
      speedY *= defaultDiagonalOffset;
    }

    this.moveX.speed = speedX;
    this.moveY.speed = speedY;

    this.moving = (speedX !== 0 || speedY !== 0);

    this.move();
    if (!this.game.currentTown.array[~~(this.centerPoint.x/tileSize)][~~(this.centerPoint.y/tileSize)].walkable){
      console.log(`STUTTER on direction: ${this.direction}`);
    }
    this.sprite.next();
  }
  drawDebugInfo(){
    let moveX = Math.abs(this.moveX.getChangeInThisTick('x', this.speedForDebug));
    let moveY = Math.abs(this.moveY.getChangeInThisTick('y', this.speedForDebug));
    //console.log(moveX, moveY);
    ctx.fillStyle = 'black';
    let cp = this.centerPoint;
    ctx.fillRect(cp.x, cp.y, 1, 1);
    this.boundaries.forEach((boundary, ix) => {
      let mX = moveX * ((ix % 3 === 0)? -1 : (ix % 3 === 2)? 1 : 0);
      let mY = moveY * ((ix < 3)? -1 : (ix > 5)? 1 : 0);
      ctx.fillRect(cp.x + boundary[0] + mX,
      cp.y + boundary[1] + mY, 1, 1);
    });
    
  }
  willCollide(direction, speed){
    /* xTile and yTile represent the coordinates of the tile that
       the player would start colliding with if he moved in its
       direction with defaultPlayerSpeed in this tick
    */
    let moveX = Math.abs(this.moveX.getChangeInThisTick('x', speed));
    let moveY = Math.abs(this.moveY.getChangeInThisTick('y', speed));
   
    let xTile =
      ~~((this.centerPoint.x + this.boundaries[direction][0] + tileSize
	+ moveX * ((direction % 3 === 0)? -1 : (direction % 3 === 2)? 1 : 0))/tileSize)-1;
    let yTile = ~~((this.centerPoint.y + this.boundaries[direction][1] + tileSize
      + moveY *  ((direction < 3)? -1 : (direction > 5)? 1 : 0))/tileSize)-1;

    if (xTile < 0 || xTile >= this.game.currentTown.width ||
        yTile < 1 || yTile >= this.game.currentTown.height)
      return 1;
    if ((this.game.currentTown.array[xTile][yTile].walkable)){
      return 0;
    }
    return 1;
  }
  toggleSprint(){
    this.sprinting = !this.sprinting;
  }
  toggleSneak(){
    this.sneaking = !this.sneaking;
  }
  
  move() {
    this.moveX.next();
    this.moveY.next();
    if (this.moving){
      if (this.sprite.animation.name !== "run")
	this.sprite.changeAnimation("run");
      return;
    }
    if (this.sprite.animation.name !== "idle")
      this.sprite.changeAnimation("idle");
  }
}

export default Player;
