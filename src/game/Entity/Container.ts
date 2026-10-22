import Interactible from "./Interactible";
import { stateManager } from "@/engine/state/StateManager";
import { DEFAULT_EQUIPMENT_SIZE, CASH_MIN_MAX_PARAMETERS as cashParam } from "@/game/consts";
import Equipment from "@/game/Equipment/Equipment";
import { randIntInRange } from "@/lib/random";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type Player from "./Player";

class Container extends Interactible {
  equipment: Equipment;

  constructor(game: Game, typeName: string, pos: Point, options = {}) {
    super(game, typeName, pos, Object.assign(options, { hitbox: game.currentTown.array }));
    const startCash = randIntInRange(cashParam.minCash, cashParam.maxCash);
    this.equipment = new Equipment(DEFAULT_EQUIPMENT_SIZE, startCash);
  }
  override interact(who: Player) {
    console.log("Interacted with a container!");
    this.game.transferDisplay.setTransferWith(who.equipment, this.equipment, false);
    stateManager.toggleState(this.game.transferDisplay);
  }
}

export default Container;
