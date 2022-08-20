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

import Tile from "./Tile.js";
import Browser from "./Browser.js";
import KeyMan from "./KeyboardManager.js";
import ctx from "./ctx.js";

export default class Game {
  
  constructor(keybinds=[]){
    this.userFunctionsMap = new Map();
    this.browser = new Browser(this);
    this.testTile = new Tile("sand");
    this.testAnim = new Tile("player");
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
  
  registerFunction(funcName, func){
    this.userFunctionsMap.set(funcName, true);
  }
  
  isFunctionRegistered(funcName){
    return this.userFunctionsMap.has(funcName);
  }
  
  manageRequest(...args){
    this.keyman.manageRequest(...args);
  }
  
  loop(){
    this.currentTime = Date.now();
    this.frameTime = this.currentTime - this.previousTime;
    this.previousTime = this.currentTime;
    //console.log(this.keyman.bindsNames);
    ctx.clearRect(0,0, 672, 288);
    this.browser.update.call(this.browser);
    for (let x=0; x<21; x++){
      for (let y=0; y<9; y++){
	this.testTile.draw(x*32,y*32);
      }
    }
    ctx.font = "16px serif";
    ctx.fillText(`FPS: ${this.fps}`, 606, 16);

    this.testAnim.draw(128, 128);
    this.testAnim.sprite.awaitNext(130);
    if (!(this.a++ % 10)){
      this.fps = (1000/this.frameTime) | 0;
      this.fps = ((this.fps > 99)? "" : " ") + this.fps;
    }
    window.requestAnimationFrame(() => this.loop());
  }
  
  test(){
    return "Game class functional";
  }
}
