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
    this.dialogue = new Dialogue("src/Dialogue/trader_dialogue.dwdialogue",
      who, this);

    let postMenu = new ButtonList({
      callbackArgument: this.game.dialogueDisplay
    });

    postMenu.add("Trade", (dialogueDisplay) => {
      dialogueDisplay.endState();
      this.game.startTransfer(who.equipment, this.equipment, true);
    });
    postMenu.add("End dialogue", (dialogueDisplay) => {
      dialogueDisplay.endState();
    });
    
    this.game.startDialogue(this.dialogue, postMenu);
  }
}

export default Trader;
