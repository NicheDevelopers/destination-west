import { addTraits } from "@/engine/traits";
import { InventoryTrait } from "@/game/Equipment/InventoryTrait";
import Interactible from "./Interactible";
import { stateManager } from "@/engine/stateManager";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type Entity from "@/engine/Entity";

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
