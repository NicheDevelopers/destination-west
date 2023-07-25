import {ContainerTrait} from "../ContainerTrait.js";
import Interactible from "./Interactible.js";
import Sprite from "../Sprite/Sprite.js";
import {stateManager} from "../global/stateManager.js";

class Container extends Interactible {
  constructor(game, typeName, x, y, speed=0) {
    super(game, typeName, x, y, speed);
    // CHANGE THIS
    this.sprite = new Sprite(typeName);
    return Object.assign(this, ContainerTrait());
  }
  interact(who) {
    console.log("Interacted with a container!");
    this.game.transferDisplay.setTransferWith(who.equipment, this.equipment);
    stateManager.pushState(this.game.transferDisplay);
  }
}

export default Container;
