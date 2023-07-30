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

import Camera from "./Camera.js";
import Tile from "./Tile.js";
import Player from "./Entity/Player.js";
import WorldMapDisplay from "./WorldMapDisplay.js";
import PauseMenu from "./PauseMenu.js";
import EquipmentDisplay from "./EquipmentDisplay.js";
import Equipment from "./Equipment.js";
import Designer from "./Designer.js";
import Item from "./Item/Item.js";
import { State } from "./global/stateManager.js"
import Npc from "./Entity/Npc.js";
import Container from "./Entity/Container.js";
import TransferDisplay from "./TransferDisplay.js";
import { defaultEquipmentSize } from "./global/consts.js";
import WorldMap from "./WorldMap.js";

class Game extends State {
  constructor(app) {
    super(true);
    
    this.app = app;
    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer(this);

    this.testTile = new Tile("sand");
    
    this.worldMap = new WorldMap();
    this.worldMapDisplay = new WorldMapDisplay(this);

    this.currentTown = this.worldMap.locations[0];
    this.currentTown.visited = true;
    if (!this.currentTown.created) {
      this.currentTown.createTown();
    }

    //this.testJacket = new ColoredSprite('jacket');
    //this.testPants = new ColoredSprite('pants');
    this.player = new Player(this, 350, 290);
    
    let testContainer = new Container(this, "barrel", 350, 350);
    for (let i=0; i<3; i++){
      testContainer.equipment.put(new Item(`Whisky`,'decoration-small-stones-1', 0, 3, 0, 0, true));
    }
    //console.log(testContainer);
    
    this.currentTown.containers.push(testContainer);
    
    this.currentTown.npcs.push(new Npc(this, "Ol' Benjamin", 382, 290));
    this.camera = new Camera(this);

    for (let i=0; i<5; i++){
      this.player.equipment.put(new Item(`Apple`, 'decoration-cactus-1x', 0, 5, 0, 0, true));
      this.player.equipment.put(new Item(`Whisky`,'decoration-small-stones-1', 0, 3, 0, 0, true));
      this.player.equipment.put(new Item(`Revolver`,'decoration-stone-well', 0, 7, 0, 0, false));
    }
    this.equipmentDisplay = new EquipmentDisplay(this, this.player.equipment);

    // this.transferEquipment = new Equipment(defaultEquipmentSize);
    // for (let i=0; i<8; i++){
    //   this.transferEquipment.put(new Item(`Apple`, 'decoration-cactus-1x', 0, 5, 0, 0, true));
    // }

    //this.player.transfer.changeTransferEquipment(this.transferEquipment);
    this.transferDisplay = new TransferDisplay(this);

    this.slaves = [
      this.pauseMenu,
      this.designer,
      this.worldMapDisplay,
      this.equipmentDisplay,
      this.transferDisplay,
    ]
  }

  travel(id) {
    if (!this.currentTown.connectedLocations.includes(parseInt(id))) {
      return;
    }
    this.currentTown = this.worldMap.getByID(id);
    this.currentTown.visited = true;
    if (!this.currentTown.created) {
      this.currentTown.createTown();
    }
    this.worldMapDisplay.draw();
  }

  getFocusedItem() {
    return this.currentTown.focused;
  }

  updateFocus() {
    this.currentTown.updateFocus(this.player);
  }
  
  debug() {
    this.player.drawDebugInfo();
    this.currentTown.drawDebugInfo();
  }

  update() {
    this.player.update();
    this.currentTown.update(this.player);
    this.camera.render();
  }

  togglePause() {
    this.paused = !this.paused;
  }
}

export default Game;
