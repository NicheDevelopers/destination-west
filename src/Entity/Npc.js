// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {animationSpeed} from "../global/consts.js";
import Interactible from "./Interactible.js";
import {defaultNpcSpeed} from "../global/consts.js";
import {addTraits, InventoryTrait} from "../traits.js";

class Npc extends Interactible {
  constructor(game, name, x, y) {
    super(game, "player", x, y,
	  {speed: defaultNpcSpeed, animated: true});
    addTraits(this, InventoryTrait());
    this.name = name;
  }
  update() {
    this.sprite.next();
  }
  interact(who) {
    console.log(`${this.name}: What does thy want?`);
  }
}

export default Npc;
