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

import Camera from "../Core/Camera.js";
import Tile from "./Tile.js";
import Player from "../Entity/Player.js";
import WorldMapDisplay from "../WorldMap/WorldMapDisplay.js";
import PauseMenu from "../Menu/PauseMenu.js";
import EquipmentDisplay from "../Equipment/EquipmentDisplay.js";
import Designer from "../Misc/Designer.js";
import Item from "../Item/Item.js";
import { State } from "../global/stateManager.js"
import Npc from "../Entity/Npc.js";
import Dialogue from "../Dialogue/Dialogue.js";
import DialogueDisplay from "../Dialogue/DialogueDisplay.js";
import Container from "../Entity/Container.js";
import Portal, {PortalType} from "../Entity/Portal.js";
import TransferDisplay from "../Transfer/TransferDisplay.js";
import WorldMap from "../WorldMap/WorldMap.js";
import Travel from "../Location/Travel.js";
import Town from "../Location/Town.js";
import { distance } from "../global/utilities.js";
import Interactible from "../Entity/Interactible.js"
import { tileSize } from "../global/consts.js";
import {Notification, notifier} from "../global/notifier.js";
import ChuckALuck from "../Minigames/ChuckALuck.js"

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
    
    this.player = new Player(this, this.currentTown.playerSpawn.x, this.currentTown.playerSpawn.y);

    let testMinigame = new ChuckALuck(this);
    let testMinigamer = new Interactible(this, "chuck-a-luck-table", 200, 200);
    
    testMinigamer.interact = (who) => {
      testMinigame.start();
    };
    
    let testContainer = new Container(this, "barrel", 250, 250);
    for (let i=0; i<3; i++){
      testContainer.equipment.put(new Item(`Whisky`,'whisky', 0, 3, 0, 0, true));
    }
    //console.log(testContainer);
    
    this.currentTown.portals.push(new Portal(this, "decoration-roadsign", 64*4, 64*5, PortalType.openMap()));
    this.currentTown.containers.push(testContainer);
    this.currentTown.npcs.push(testMinigamer);
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
    if(this.currentTown instanceof Town ){
      if (!this.currentTown.connectedLocations.includes(parseInt(id))) {
        throw "attempt to travel to a location not connected to the current one"
      }
      let pos1 = {x: this.currentTown.x, y: this.currentTown.y};
      let pos2 = {x: this.worldMap.getByID(id).x, y: this.worldMap.getByID(id).y};
      let length = distance(pos1, pos2);
      this.currentTown = new Travel(this, length, this.currentTown.ID, id);
    }

    else if(this.currentTown instanceof Travel ){
      this.currentTown = this.worldMap.getByID(id);
      this.currentTown.visited = true;
      if (!this.currentTown.created) {
        this.currentTown.createTown();
      }
    }

    this.player.x = this.currentTown.playerSpawn.x;
    this.player.y = this.currentTown.playerSpawn.y;
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
