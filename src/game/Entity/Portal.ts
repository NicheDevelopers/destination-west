import Interactible from "./Interactible";
import { stateManager } from "@/engine/state/StateManager";
import type Game from "@/game/Game";
import type { Point } from "@/lib/utilities";
import type Player from "./Player";
import Location from "../Location/Location";

export const PortalType = {
  openMap: () => {
    return (who: Player) => {
      stateManager.toggleState(who.game.worldMapDisplay);
    };
  },
  teleport: (where: number) => {
    return (who: Player) => {
      who.game.travel(where);
    };
  },
};

/* Portal is an Interactible that teleports the Player or
   opens the map display upon interaction. */
class Portal extends Interactible {
  constructor(
    game: Game,
    location: Location,
    typeName: string,
    pos: Point,
    portalTypeFn: (who: Player) => void,
  ) {
    super(game, location, typeName, pos);
    this.interact = portalTypeFn;
  }
}

export default Portal;
