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
import Camera from "./Camera.js";
import Browser from "./Browser.js";
import KeyMan from "./KeyboardManager.js";
import Tile from "./Tile.js";
import Player from "./Entity/Player.js";
import AudioPlayer from "./AudioPlayer.js";
import WorldMap from "./WorldMap.js";
import WorldMapDisplay from "./WorldMapDisplay.js";
import KeyboardVisualizer from "./KeyboardVisualizer.js";
import PauseMenu from "./PauseMenu.js";
import EquipmentDisplay from "./EquipmentDisplay.js";
import Equipment from "./Equipment.js";
import Animation from "./Animation.js";
import Designer from "./Designer.js";
import Item from "./Item/Item.js";

class Game {
  constructor(keybinds=[]){
    this.userFunctionsMap = new Map();

    this.debugging = false;
    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer(this);
    
    this.browser = new Browser(this);
    this.testTile = new Tile("sand");
    this.audioPlayer = new AudioPlayer();
    this.worldMap = new WorldMap(5, 0.5, 0.3, 2, 4, 1344, 576);
    this.worldMapDisplay = new WorldMapDisplay(this);

    let testEq = new Equipment(7,7);
    testEq.put(new Item('Apple', 'decoration-big-stone-1x', 0, 0, 1, 1, 0, 0));
    testEq.put(new Item('Apple', 'decoration-big-stone-1x', 0, 0, 1, 1, 0, 0));
    this.equipmentDisplay = new EquipmentDisplay(this, testEq, true);

    this.currentTown = this.worldMap.getByID(0);
    this.currentTown.visited = true;
    if (!this.currentTown.created) { 
      this.currentTown.createTown();
    }
    
    //this.testJacket = new ColoredSprite('jacket');
    //this.testPants = new ColoredSprite('pants');
    this.player = new Player(this, 350, 290);
    this.camera = new Camera(this);
    
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

  travel(id) {
    if (!this.currentTown.connectedTowns.includes(parseInt(id))) {
      return;
    }
    this.currentTown = this.worldMap.getByID(id);
    this.currentTown.visited = true;
    if (!this.currentTown.created) { 
      this.currentTown.createTown();
    }
    this.worldMapDisplay.draw();
  }

  debug(){
    this.player.drawDebugInfo();
    this.currentTown.drawDebugInfo();
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
    this.testFPSCounter.next();

    this.camera.render();
    
    if (this.debugging)
      this.debug();
  }
  togglePause(){
    this.paused = !this.paused;
  }
  updateFPSCounter(){
      this.fps = time.getFPS();
      this.fps = ((this.fps > 99)? "" : " ") + this.fps;
  }
}

export default Game;
