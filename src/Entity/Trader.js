import Dialogue from "../Dialogue/Dialogue.js";
import { State, stateManager } from "../global/stateManager.js";
import Entity from "./Entity.js";
import Npc from "./Npc.js";
import { ButtonList } from "../global/utilities.js";

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

  /**
   * Update method for every game tick
   */
  update() {
    this.sprite.next();
  }

  /**
   * Interaction method with Trader
   * @param {Entity} who who is interacting with class - mostly (only one) will be the Player class
   */
  interact(who) {
    this.sprite.mirrored = (who.x < this.x);
    this.dialogue = new Dialogue(who, this, "src/Dialogue/trader_dialogue.dwd");
    
    this.game.startDialogue(this.dialogue);
  }
}

export default Trader;
