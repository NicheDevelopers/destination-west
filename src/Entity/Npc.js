// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {animationSpeed} from "../global/consts.js";
import Interactible from "./Interactible.js";
import { addTraits, InventoryTrait } from "../traits.js";
import { genNpcName } from "../generators/nameGenerators.js";
import Dialogue from "../Dialogue/Dialogue.ts";
import testDialogue from "../Dialogue/test_dialogue.dwd?raw";
import { npcParameters } from "../global/consts.js";
import Stats from "./Stats.js";

class Npc extends Interactible {
  constructor(game, x, y, name) {
    super(game, "player", x, y, {
      movement: { speed: npcParameters.defaultNpcSpeed },
      hitbox: game.currentTown.array,
      animated: true,
    });
    this.name = name ?? genNpcName(true, true);
    this.impaired = false;
    this.stats = new Stats();
    
    addTraits(this, InventoryTrait(npcParameters.defaultNpcStartCash));
  }
  
  changeStat(statName, changeValue) {
    this.stats.change(statName, changeValue);
  }

  /**
   * Check the status of a certain statistic value of this npc
   */
  checkStat(statName) {
    return this.stats.check(statName);
  }
  
  update() {
    if (!this.impaired) this.movement.update();
    this.sprite.next();
  }
  interact(who) {
    this.sprite.mirrored = (who.x < this.x);
    this.dialogue = new Dialogue(who, this).fromText(testDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Npc;
