// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {animationSpeed} from "../global/consts.js";
import Interactible from "./Interactible.js";
import { defaultNpcSpeed } from "../global/consts.js";
import { addTraits, InventoryTrait } from "../traits.js";
import { genNpcName } from "../generators/nameGenerators.js";
import Dialogue from "../Dialogue/Dialogue.js";
import { stateManager } from "../global/stateManager.js";

class Npc extends Interactible {
  constructor(game, x, y, name) {
    super(game, "player", x, y,
	  { movement: { speed: defaultNpcSpeed },
	    hitbox: game.currentTown.array,
	    animated: true });
    this.name = name ?? genNpcName(true, true);
    this.impaired = false;
    addTraits(this, InventoryTrait());
  }
  update() {
    if (!this.impaired)
      this.movement.update();
    this.sprite.next();
  }
  interact(who) {
    this.sprite.mirrored = (who.x < this.x);
    this.dialogue = new Dialogue("src/Dialogue/test_dialogue.dwdialogue",
      who, this);
    if (this.dialogue.exhausted()) this.dialogue.reset();
    this.game.dialogueDisplay.setDialogue(this.dialogue);
    stateManager.toggleState(this.game.dialogueDisplay);
  }
}

export default Npc;
