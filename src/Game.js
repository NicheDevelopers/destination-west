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

export default class Game {
  
  constructor(ctx, keybinds=[]){
    this.userFunctionsMap = new Map();
    this.browser = new Browser(this);
    this.ctx = ctx;
    this.testTile = new Tile(this.ctx, "sand");
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
    //console.log(this.keyman.bindsNames);
    this.browser.update.call(this.browser);
    this.testTile.draw();
    window.requestAnimationFrame(() => this.loop());
  }
  
  test(){
    return "Game class functional";
  }
}
