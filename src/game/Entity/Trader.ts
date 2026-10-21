import Dialogue from "@/game/Dialogue/Dialogue";
import traderDialogue from "@/game/Dialogue/trader_dialogue.dwd?raw";
import type Game from "@/game/Game";
import type { Point } from "@/lib/utilities";
import type Entity from "@/engine/Entity";
import Npc from "./Npc";

class Trader extends Npc {
  dialogue: Dialogue | null = null;

  constructor(game: Game, pos: Point, name: string) {
    super(game, pos, name);
  }

  update(): void {
    this.sprite.next();
  }

  /**
   * Interaction method with Trader
   * @param who who is interacting with class - mostly (only one) will be the Player class
   */
  interact(who: Entity) {
    this.sprite.mirrored = who.pos.x < this.pos.x;
    this.dialogue = new Dialogue(who, this).fromText(traderDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Trader;
