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

import Camera from "../core/Camera.js";
import Tile from "./Tile.js";
import Player from "../Entity/Player.js";
import WorldMapDisplay from "../WorldMap/WorldMapDisplay.js";
import PauseMenu from "../menu/PauseMenu.js";
import EquipmentDisplay from "../Equipment/EquipmentDisplay.js";
import Designer from "../misc/Designer.js";
import Item from "../Item/Item.js";
import { State, stateManager } from "../global/stateManager.js";
import Npc from "../Entity/Npc.js";
import Dialogue from "../Dialogue/Dialogue.ts";
import DialogueDisplay from "../Dialogue/DialogueDisplay.ts";
import Container from "../Entity/Container.js";
import Portal, { PortalType } from "../Entity/Portal.js";
import TransferDisplay from "../Transfer/TransferDisplay.js";
import WorldMap from "../WorldMap/WorldMap.js";
import Travel from "../Location/Travel.js";
import Town from "../Location/Town.js";
import { distance } from "../global/utilities.js";
import Interactible from "../Entity/Interactible.js";
import { tileSize } from "../global/consts.js";
import {Notification, notifier} from "../global/notifier.js";
import ChuckALuck from "../minigames/ChuckALuck.js";
import revolverShoot from "../minigames/battle_minigames/revolverShoot.js";
import revolverLoad from "../minigames/battle_minigames/revolverLoad.js";
import Pathfinder from "../Pathfinder.js";
import Trader from "../Entity/Trader.js";
import seed from "../global/seed.js";
import { createItem } from "../global/items.js";
import { items } from "../global/items.js";
import { FindQuestBuilder, FindQuestConfig, FindQuestType, ItemDistribution, ItemEntry } from '../Quest.js';
import {
  Combat,
  CombatAction,
  CombatConfig,
  CombatInitiationType,
  Difficulty,
} from "../Combat/Combat.js";
import CombatDisplay from "../Combat/CombatDisplay.js";

class Game extends State {
  constructor(app, callback) {
    super(true, { async: true });
    this.app = app;
    seed.generate(null,
      () => {
        this.init();
        callback();
      },
      (e) => this.app.crash(e)
    );
  }

  init() {
    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer(this);

    this.testTile = new Tile("sand");

    this.worldMap = new WorldMap(this);
    this.worldMapDisplay = new WorldMapDisplay(this);

    this.currentTown = this.worldMap.locations[0];
    this.currentTown.visited = true;
    if (!this.currentTown.created) {
      this.currentTown.createTown();
    }

    //this.testJacket = new ColoredSprite('jacket');
    //this.testPants = new ColoredSprite('pants');
    this.player = new Player(
      this,
      this.currentTown.playerSpawn.x,
      this.currentTown.playerSpawn.y,
    );

    let testMinigame = new ChuckALuck(this);

    this.camera = new Camera(this);

    let testMinigamer = new Interactible(this, "chuck-a-luck-table", 200, 200);

    testMinigamer.interact = (who) => {
      testMinigame.start();
    };

    let testShooting = new revolverShoot(this, 6);
    let testTarget = new Interactible(this, "torso", 100, 100);
    testTarget.interact = (who) => {
      stateManager.toggleState(testShooting);
    }
    this.currentTown.npcs.push(testTarget);

    let testLoading = new revolverLoad(this, 6);
    let testLoader = new Interactible(this, "torso", 164, 100);
    testLoader.interact = (who) => {
      stateManager.toggleState(testLoading);
    }
    this.currentTown.npcs.push(testLoader);

    
    let testContainer = new Container(this, "barrel", 250, 250);
    testContainer.equipment.fillRecords([
      { recipe: items.whisky, quantity: 3 },
      { recipe: items.apple, quantity: 3 },
      { recipe: items.brokenBottle, quantity: 1 },
      { recipe: items.revolver1, quantity: 3 },
    ]);

    this.currentTown.portals.push(
      new Portal(
        this,
        "decoration-roadsign",
        64 * 4,
        64 * 5,
        PortalType.openMap(),
      ),
    );
    this.currentTown.containers.push(testContainer);
    this.currentTown.npcs.push(testMinigamer);
    let OlBenjamin = new Npc(this, 382, 350, "Ol' Benjamin");
    this.currentTown.npcs.push(OlBenjamin);
    OlBenjamin.impaired = true;

    let testTrader = new Trader(this, 300, 250, "Sawyer McCleary");
    testTrader.equipment.fillRecords([
      { recipe: items.apple, quantity: 3 },
      { recipe: items.revolver1, quantity: 5 },
    ]);

    //----------------------------------------
    const type = FindQuestType.FindOnTheGround;
    const distribution = ItemDistribution.Even;
    const entries = [
      new ItemEntry(items.apple, 5),
      new ItemEntry(items.brokenBottle, 3),
    ];
    const questConfig = new FindQuestConfig(type, entries, distribution);
    const builder = new FindQuestBuilder(testTrader, questConfig, null);
    const valid = builder.validate();
    //console.log(`Is quest valid?: ${valid}`);
    const quest = builder.build();
    //console.log(quest);
    //----------------------------------------

    this.currentTown.npcs.push(testTrader);

    //this.currentTown.npcs.push(new Npc(this, 382, 350, "Ol' Benjamin"));

    this.player.equipment.fillRecords([
      { recipe: items.cigar, quantity: 1 },
      { recipe: items.whisky, quantity: 5 },
      { recipe: items.revolver1, quantity: 2 },
      { recipe: items.revolver2, quantity: 3 },
      { recipe: items.apple, quantity: 5 },
      { recipe: items.brokenBottle, quantity: 1 },
    ]);

    this.equipmentDisplay = new EquipmentDisplay(this, this.player.equipment);

    this.dialogueDisplay = new DialogueDisplay(this);

    this.transferDisplay = new TransferDisplay(this);

    this.testEntity = new Npc(this, 370, 290, "Milas");
    this.currentTown.npcs.push(this.testEntity);

    const initType = CombatInitiationType.Normal;
    const difficulty = new Difficulty();
    const config = new CombatConfig(initType, difficulty);
    const combat = new Combat(
      this.player,
      [OlBenjamin],
      this.testEntity,
      [],
      config,
    );
    this.combatDisplay = new CombatDisplay(this, combat);

    this.testEntity.interact = (who) => {
      this.combatDisplay.reset();
      stateManager.startState(this.combatDisplay);
    };

    this.validate();
  }

  travel(id) {
    if (this.currentTown instanceof Town) {
      if (!this.currentTown.connectedLocations.includes(parseInt(id))) {
        throw new Error("Attempt to travel to a location not connected to the current one");
      }
      let pos1 = { x: this.currentTown.x, y: this.currentTown.y };
      let pos2 = {
        x: this.worldMap.getByID(id).x,
        y: this.worldMap.getByID(id).y,
      };
      let length = distance(pos1, pos2);
      this.currentTown = new Travel(this, length, this.currentTown.ID, id);
    } else if (this.currentTown instanceof Travel) {
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

  manageInputs(keyman) {
    this.camera.manageInputs(keyman);
    this.player.manageInputs(keyman);
    keyman.manageInput('Open Pause Menu',
      (key) => stateManager.startState(this.pauseMenu, key)
    );
    keyman.manageInput('Open Designer',
      (key) => stateManager.startState(this.designer, key)
    );
    keyman.manageInput('Open Map',
      (key) => stateManager.startState(this.worldMapDisplay, key)
    );
    keyman.manageInput('Open Equipment',
      (key) => stateManager.startState(this.equipmentDisplay, key)
    );
  }

  getFocusedItem() {
    return this.currentTown.focused;
  }

  updateFocus() {
    this.currentTown.updateFocus(this.player);
  }

  update() {
    this.player.update();
    this.currentTown.update(this.player);
    this.camera.render({ debug: this.app.debugging });
  }

  togglePause() {
    this.paused = !this.paused;
  }

  startDialogue(dialogue, stateChangeKey) {
    this.dialogueDisplay.setDialogue(dialogue);
    stateManager.startState(this.dialogueDisplay, stateChangeKey);
  }

  startTransfer(...args) {
    this.transferDisplay.setTransferWith(...args);
    stateManager.startState(this.transferDisplay);
  }
}

export default Game;
