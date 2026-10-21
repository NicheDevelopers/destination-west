import Camera from "@/engine/Camera";
import Player from "@/game/Entity/Player";
import WorldMapDisplay from "@/game/WorldMap/WorldMapDisplay";
import PauseMenu from "@/game/menu/PauseMenu";
import EquipmentDisplay from "@/game/Equipment/EquipmentDisplay";
import Designer from "@/game/misc/Designer";
import { State, stateManager } from "@/engine/stateManager";
import DialogueDisplay from "@/game/Dialogue/DialogueDisplay";
import TransferDisplay from "@/game/Transfer/TransferDisplay";
import WorldMap from "@/game/WorldMap/WorldMap";
import Travel from "@/game/Location/Travel";
import Town from "@/game/Location/Town";
import { distance } from "@/lib/utilities";
import seed from "@/lib/seed";
import type App from "@/engine/App";

class Game extends State {
  app: App;
  pauseMenu: PauseMenu;
  paused: boolean;
  designer: Designer;
  worldMap: WorldMap;
  worldMapDisplay: WorldMapDisplay;
  currentTown: Town | Travel;
  player: Player;
  camera: Camera;
  equipmentDisplay: EquipmentDisplay;
  dialogueDisplay: DialogueDisplay;
  transferDisplay: TransferDisplay;

  constructor(app: App, worldSeed: number) {
    super(true);
    this.app = app;
    seed.set(worldSeed);
    app.debugView.showSeed(worldSeed);

    this.pauseMenu = new PauseMenu(this);
    this.paused = false;

    this.designer = new Designer(this);

    this.worldMap = new WorldMap(this);
    this.worldMapDisplay = new WorldMapDisplay(this);

    this.currentTown = this.worldMap.locations[0];
    this.currentTown.visited = true;
    if (!this.currentTown.created) {
      this.currentTown.createTown();
    }

    this.player = new Player(this, this.currentTown.playerSpawn);
    this.camera = new Camera(this.player);

    this.equipmentDisplay = new EquipmentDisplay(this, this.player.equipment);
    this.dialogueDisplay = new DialogueDisplay(this);
    this.transferDisplay = new TransferDisplay(this);
  }

  travel(id) {
    if (this.currentTown instanceof Town) {
      if (!this.currentTown.connectedLocations.includes(parseInt(id))) {
        throw new Error("Attempt to travel to a location not connected to the current one");
      }
      let length = distance(this.currentTown.pos, this.worldMap.getByID(id).pos);
      this.currentTown = new Travel(this, length, this.currentTown.ID, id);
    } else if (this.currentTown instanceof Travel) {
      this.currentTown = this.worldMap.getByID(id);
      this.currentTown.visited = true;
      if (!this.currentTown.created) {
        this.currentTown.createTown();
      }
    }

    Object.assign(this.player.pos, this.currentTown.playerSpawn);
    this.player.changeLocation(this.currentTown.array);
    this.worldMapDisplay.draw();
  }

  manageInputs(keyman) {
    this.camera.manageInputs(keyman);
    this.player.manageInputs(keyman);
    keyman.manageInput("Open Pause Menu", (key) => stateManager.startState(this.pauseMenu, key));
    keyman.manageInput("Open Designer", (key) => stateManager.startState(this.designer, key));
    keyman.manageInput("Open Map", (key) => stateManager.startState(this.worldMapDisplay, key));
    keyman.manageInput("Open Equipment", (key) =>
      stateManager.startState(this.equipmentDisplay, key),
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
    this.camera.render(this.currentTown, this.player, { debug: this.app.debugging });
  }

  togglePause() {
    this.paused = !this.paused;
  }

  startDialogue(dialogue, stateChangeKey) {
    this.dialogueDisplay.setDialogue(dialogue);
    stateManager.startState(this.dialogueDisplay, stateChangeKey);
  }

  startTransfer(...args: Parameters<TransferDisplay["setTransferWith"]>) {
    this.transferDisplay.setTransferWith(...args);
    stateManager.startState(this.transferDisplay);
  }
}

export default Game;
