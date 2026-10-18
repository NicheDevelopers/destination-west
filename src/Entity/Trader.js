import Dialogue from "../Dialogue/Dialogue.ts";
import traderDialogue from "../Dialogue/trader_dialogue.dwd?raw";
import Npc from "./Npc.js";

class Trader extends Npc {
  /**
   * Trader - NPC which is able to interact with in term of trading
   * @param {State} game
   * @param {number} x x coordinate of location
   * @param {number} y y coordinate of location
   * @param {string} name name of Trader
   */
  constructor(game, x, y, name) {
    super(game, x, y, name);
  }

  update() {
    this.sprite.next();
  }

  /**
   * Interaction method with Trader
   * @param {Entity} who who is interacting with class - mostly (only one) will be the Player class
   */
  interact(who) {
    this.sprite.mirrored = who.x < this.x;
    this.dialogue = new Dialogue(who, this).fromText(traderDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Trader;
