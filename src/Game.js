/*
  file: src/Game.js
  purpose: define the Game class
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

import time from "./time.js";
import ctx from "./ctx.js";
import Browser from "./Browser.js";
import KeyMan from "./KeyboardManager.js";

import Tile from "./Tile.js";
import Player from "./Player.js";

class Game {
  constructor(keybinds=[]){
    this.userFunctionsMap = new Map();
    this.browser = new Browser(this);
    this.testTile = new Tile("sand");
    this.player = new Player(this);
    this.testBuilding = new Tile("saloon_0");
    
    this.a = 0;
    /* Keyman has to load keybinds AFTER functions are written to
       userFunctionsMap. This means it has to be instantinated AFTER
       every function provider */
    this.keyman = new KeyMan(this, keybinds);
    let self = this;
    document.addEventListener("keydown", (event) => {
      self.keyman.manageKeydown(event);
    });
    document.addEventListener("keyup", (event) => {
      self.keyman.manageKeyup(event);
    });
    this.previousTime = Date.now();
  }
  
  registerAction(action, func){
    this.userFunctionsMap.set(action, true);
  }
  
  isActionRegistered(action){
    return this.userFunctionsMap.has(action);
  }
  
  manageRequest(...args){
    this.keyman.manageRequest(...args);
  }
  loop(){
    time.update();
    ctx.clearRect(0,0, 672, 288);
    this.browser.update();
    this.player.update();
    for (let x=0; x<21; x++){
      for (let y=0; y<9; y++){
	this.testTile.draw(x*32,y*32);
      }
    }
    ctx.font = "16px serif";
    ctx.fillText(`FPS: ${this.fps}`, 606, 16);

    this.player.draw(128 + this.player.x, 128 + this.player.y);

    this.testBuilding.draw(256, 32);
    
    if (!(this.a++ % 30)){
      this.fps = time.getFPS();
      this.fps = ((this.fps > 99)? "" : " ") + this.fps;
    }
    window.requestAnimationFrame(() => this.loop());
  }
  
  test(){
    return "Game class functional";
  }
}

export default Game;
