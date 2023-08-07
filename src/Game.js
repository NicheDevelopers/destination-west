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
import Designer from "./Designer.js";
import Item from "./Item/Item.js";
import { State } from "./global/stateManager.js"
import Npc from "./Entity/Npc.js";
import Dialogue from "./Dialogue/Dialogue.js";
import DialogueDisplay from "./Dialogue/DialogueDisplay.js";
import Container from "./Entity/Container.js";
import Portal from "./Entity/Portal.js";
import TransferDisplay from "./TransferDisplay.js";
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
    this.camera = new Camera(this);
    
    this.player = new Player(this, 250, 390);
    
    let testContainer = new Container(this, "barrel", 250, 250);
    for (let i=0; i<3; i++){
      testContainer.equipment.put(new Item(`Whisky`,'whisky', 0, 3, 0, 0, true));
    }
    //console.log(testContainer);
    
    this.currentTown.portals.push(new Portal(this, "decoration-roadsign", 64*4, 64*5));
    
    this.currentTown.containers.push(testContainer);
    
    this.currentTown.npcs.push(new Npc(this, 382, 350, "Ol' Benjamin"));
    
    this.player.equipment.put(new Item(`Cigar`,'cigar', 0, 1, 0, 0, false));
    for (let i=0; i<5; i++){
      this.player.equipment.put(new Item(`Apple`, 'apple', 0, 5, 0, 0, true));
      this.player.equipment.put(new Item(`Whisky`,'whisky', 0, 3, 0, 0, true));
      this.player.equipment.put(new Item(`Revolver`,
					 'revolver-'+(i%2+1),
					 0, 7, 0, 0, false));
    }
    this.player.equipment.put(new Item(`Broken Bottle`,'broken-bottle', 0, 1, 0, 0, false));
    this.equipmentDisplay = new EquipmentDisplay(this, this.player.equipment);

    this.dialogueDisplay = new DialogueDisplay(this)

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
  
  update() {
    this.app.manageRequest('Toggle Debug Mode',
			   () => this.app.debugging =
      !this.app.debugging, { once: true });
    this.player.update();
    this.currentTown.update(this.player);
    this.camera.render({debug: this.app.debugging});
  }

  togglePause() {
    this.paused = !this.paused;
  }
}

export default Game;
