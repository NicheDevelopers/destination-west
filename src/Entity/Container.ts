import { addTraits, InventoryTrait } from "../traits.js";
import Interactible from "./Interactible.js";
import { stateManager } from "../global/stateManager.js";
import type { Point } from "../utilities/utilities.js";
import type Game from "../game/Game.js";
import type Entity from "./Entity.js";

class Container extends Interactible {
  constructor(game: Game, typeName: string, pos: Point, options = {}) {
    super(game, typeName, pos, Object.assign(options, { hitbox: game.currentTown.array }));
    addTraits(this, InventoryTrait());
  }
  interact(who: Entity) {
    console.log("Interacted with a container!");
    this.game.transferDisplay.setTransferWith(who.equipment, this.equipment, false);
    stateManager.toggleState(this.game.transferDisplay);
  }
}

export default Container;
