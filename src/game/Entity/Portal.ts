import Interactible from "./Interactible";
import { stateManager } from "@/engine/stateManager";

export const PortalType = {
  openMap: () => {
    return (who) => {
      stateManager.toggleState(who.game.worldMapDisplay);
    };
  },
  teleport: (where) => {
    return (who) => {
      who.game.travel(where);
    };
  },
};

/* Portal is an Interactible that teleports the Player or
   opens the map display upon interaction. */
class Portal extends Interactible {
  constructor(game, typeName, pos, portalTypeFn) {
    super(game, typeName, pos);
    this.interact = portalTypeFn;
  }
}

export default Portal;
