import Dialogue from "@/Dialogue/Dialogue.ts";
import traderDialogue from "@/Dialogue/trader_dialogue.dwd?raw";
import type Game from "@/game/Game.ts";
import type { Point } from "@/utilities/utilities.ts";
import type Entity from "./Entity.ts";
import Npc from "./Npc.js";

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
