import Interactible from "./Interactible.js";
import {stateManager} from "../global/stateManager.js";

/* Portal is an Interactible that teleports the Player or
   opens the map display upon interaction. */
class Portal extends Interactible {
  constructor(game, typeName, x, y, targetLocation) {
    super(game, typeName, x, y);
    this.interact = this.matchInteraction(targetLocation);
  }
  matchInteraction(target) {
    let roadsignInteraction = (who) => {
      //stateManager.toggleState(this.game.worldMapDisplay);
      this.game.travel(target);
    }
    let doorInteraction = (who) => {
      this.game.currentTown = target;
    }
    return roadsignInteraction;
    //if (target instanceof Building) return doorInteraction; // change later
    throw `attempt to generate a portal interaction for ${typeof target}`;
  }
}

export default Portal;
