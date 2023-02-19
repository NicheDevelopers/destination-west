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
import Tile from "./Tile.js";
import Player from "./Entity/Player.js";
import WorldMap from "./WorldMap.js";
import WorldMapDisplay from "./WorldMapDisplay.js";
import PauseMenu from "./PauseMenu.js";
import EquipmentDisplay from "./EquipmentDisplay.js";
import Equipment from "./Equipment.js";
import Designer from "./Designer.js";
import Item from "./Item/Item.js";

class Game {
  constructor(app){
    this.app = app;
    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer();
    
    this.testTile = new Tile("sand");
    this.worldMap = new WorldMap(5, 0.5, 0.3, 2, 4, 1344, 576);
    this.worldMapDisplay = new WorldMapDisplay(this);

    let testEq = new Equipment(7,7);
    testEq.put(new Item('Apple', 'decoration-small-stones-1', 0, 0, 1, 1, 0, 0));
    testEq.put(new Item('Apple', 'decoration-small-stones-1', 0, 0, 1, 1, 0, 0));
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
    this.player.update();
    this.worldMapDisplay.update();
    this.equipmentDisplay.update();

    this.camera.render();
    
    if (this.debugging)
      this.debug();
  }
  
  togglePause(){
    this.paused = !this.paused;
  }
}

export default Game;
