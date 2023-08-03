import { addTraits, InventoryTrait } from "../traits.js";
import Interactible from "./Interactible.js";
import { stateManager } from "../global/stateManager.js";

class Container extends Interactible {
  constructor(game, typeName, x, y, options={}) {
    super(game, typeName, x, y, options);
    addTraits(this, InventoryTrait());
  }
  interact(who) {
    console.log("Interacted with a container!");
    this.game.transferDisplay.setTransferWith(who.equipment, this.equipment);
    stateManager.toggleState(this.game.transferDisplay);
  }
}

export default Container;
