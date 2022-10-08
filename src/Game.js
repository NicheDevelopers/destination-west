/*
  file: src/Game.js
  purpose: define the Game class
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
          Michał Miłek <https://gitlab.com/mmilek>
  
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

import time from "./global/time.js";
import ctx from "./global/ctx.js";
import Browser from "./Browser.js";
import KeyMan from "./KeyboardManager.js";

import Tile from "./Tile.js";
import Player from "./Entity/Player.js";
import AudioPlayer from "./AudioPlayer.js";
import Town from "./Town.js";
import WorldMap from "./WorldMap.js";
import WorldMapDisplay from "./WorldMapDisplay.js";
import KeyboardVisualizer from "./KeyboardVisualizer.js";
import PauseMenu from "./PauseMenu.js";
import EquipmentDisplay from "./EquipmentDisplay.js";
import Equipment from "./Equipment.js";
import {generateID} from "./global/utilities.js";

import Sprite from "./Sprite/Sprite.js";
import ColoredSprite from "./Sprite/ColoredSprite.js";

import Animation from "./Animation.js";

import Designer from "./Designer.js";

import Item from "./Item/Item.js";

class Game {
  constructor(keybinds=[]){
    this.userFunctionsMap = new Map();
    
    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer();
    
    this.browser = new Browser(this);
    this.testTile = new Tile("sand");
    this.audioPlayer = new AudioPlayer();
    this.worldMap = new WorldMap(5, 0.8, 0.3, 2, 4, 672, 288);
    this.worldMapDisplay = new WorldMapDisplay(this);

    let testEq = new Equipment(7,7);
    testEq.put(new Item('Apple', 'decoration-big-stone-1x', 0, 0, 1, 1, 0, 0));
    testEq.put(new Item('Apple', 'decoration-big-stone-1x', 0, 0, 1, 1, 0, 0));
    this.equipmentDisplay = new EquipmentDisplay(this, testEq, true);
    
    //this.testJacket = new ColoredSprite('jacket');
    //this.testPants = new ColoredSprite('pants');
    
    this.testTown = new Town('Franowo', 64, 64, 0, 0,
			     {sheriff: 1, house: 2, saloon: 11});
    this.testTown.createTown();

    this.player = new Player(this, 128, 128);

    this.fps = 0;
    this.testFPSCounter = new Animation(this, '()updateFPSCounter', 5);
    
    
    /* Keyman has to load keybinds AFTER functions are written to
       userFunctionsMap. This means it has to be instantinated AFTER
       every function provider */

    // Temporal bind
    this.registerAction('Toggle Keyboard Visualization');
    
    this.keyman = new KeyMan(this, keybinds);
        
    this.keyVisualizer = new KeyboardVisualizer(this);
    
    let self = this;
    document.addEventListener("keydown", (event) => {
      self.keyman.manageKeydown(event);
    });
    document.addEventListener("keyup", (event) => {
      self.keyman.manageKeyup(event);
    });
  }
  
  registerAction(action, func){
    this.userFunctionsMap.set(action, true);
  }
  
  isActionRegistered(action){
    return this.userFunctionsMap.has(action);
  }

  isActionRequested(action){
    return this.keyman.isActionRequested(action);
  }
  
  manageRequest(...args){
    this.keyman.manageRequest(...args);
  }
  
  loop(){
    window.requestAnimationFrame(() => this.loop());
    time.update();
    
    this.pauseMenu.update();
    if (this.paused) return;

    this.designer.update();

    this.keyVisualizer.update();
    this.browser.update();
    this.player.update();
    this.worldMapDisplay.update();
    this.equipmentDisplay.update();

    ctx.clearRect(0,0, 672, 288);
    for (let x=0; x < this.testTown.array.length; ++x){
      for (let y=0; y < this.testTown.array[0].length; ++y){
	let tile = this.testTown.array[x][y];
	tile.draw(tile.x, tile.y);
      }
    }
    this.testFPSCounter.next();
    ctx.font = "16px serif";
    ctx.fillText(`FPS: ${this.fps}`, 606, 16);
    
    this.player.draw(this.player.x, this.player.y);
    //this.player.drawDebugInfo();
  }
  togglePause(){
    this.paused = !this.paused;
  }
  updateFPSCounter(){
      this.fps = time.getFPS();
      this.fps = ((this.fps > 99)? "" : " ") + this.fps;
  }
  test(){
    return "Game class functional";
  }
}

export default Game;
