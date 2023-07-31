// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {animationSpeed} from "../global/consts.js";
import Interactible from "./Interactible.js";
import {defaultNpcSpeed} from "../global/consts.js";
import {addTraits, InventoryTrait} from "../traits.js";
import { genNpcName } from "../nameGenerators.js";

class Npc extends Interactible {
  constructor(game, x, y, name) {
    super(game, "player", x, y,
	  {speed: defaultNpcSpeed, animated: true});
    this.name = name ?? genNpcName(true, true);
    addTraits(this, InventoryTrait());
  }
  update() {
    this.sprite.next();
  }
  interact(who) {
    console.log(`${this.name}: What does thy want?`);
  }
}

export default Npc;
