import Interactible from "./Interactible.js";
import {stateManager} from "../global/stateManager.js";

export const PortalType = {
  openMap: () => {
    return (who) => {
      stateManager.toggleState(who.game.worldMapDisplay);
    }
  },
  teleport: (where) => {
    return (who) => {
      who.game.travel(where);
    }
  },
}

/* Portal is an Interactible that teleports the Player or
   opens the map display upon interaction. */
class Portal extends Interactible {
  constructor(game, typeName, x, y, portalTypeFn) {
    super(game, typeName, x, y);
    this.interact = portalTypeFn;
  }
}

export default Portal;
