// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {animationSpeed} from "../global/consts.js";
import Interactible from "./Interactible.js";
import { addTraits, InventoryTrait } from "../traits.js";
import { genNpcName } from "../generators/nameGenerators.js";
import Dialogue from "../Dialogue/Dialogue.js";
import { npcParameters } from "../global/consts.js";

class Npc extends Interactible {
  constructor(game, x, y, name) {
    super(game, "player", x, y, {
      movement: { speed: npcParameters.defaultNpcSpeed },
      hitbox: game.currentTown.array,
      animated: true,
    });
    this.name = name ?? genNpcName(true, true);
    this.impaired = false;
    addTraits(this, InventoryTrait(npcParameters.defaultNpcStartCash));
  }
  update() {
    if (!this.impaired) this.movement.update();
    this.sprite.next();
  }
  interact(who) {
    this.sprite.mirrored = who.x < this.x;
    this.dialogue = new Dialogue(
      "src/Dialogue/test_dialogue.dwdialogue",
      who,
      this,
    );

    this.game.startDialogue(this.dialogue);
  }
}

export default Npc;
