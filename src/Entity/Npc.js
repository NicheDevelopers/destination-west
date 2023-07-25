import AnimatedSprite from "../Sprite/AnimatedSprite.js";
import Entity from "./Entity.js";
import {animationSpeed} from "../global/consts.js";

class Npc extends Entity {
  constructor(game, name, x, y) {
    super(game, "player", x, y);
    this.name = name;
    this.loadedFocusedSprite = false;
    this.focusedSprite = new AnimatedSprite(
      "player", { animationSpeed: animationSpeed,
		  outline: true,
		  callback:
		  () => this.loadedFocusedSprite = true
		});
    this.focus = false;
  }
  update() {
    this.sprite.next();
  }
  interact(who) {
    console.log(`${this.name}: What does thy want?`);
  }
}

export default Npc;
