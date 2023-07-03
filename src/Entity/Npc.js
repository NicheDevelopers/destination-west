import AnimatedSprite from "../Sprite/AnimatedSprite.js";
import Entity from "./Entity.js";

class Npc extends Entity {
  constructor(name, x, y) {
    super("player", x, y);
    this.name = name;
    this.loadedFocusedSprite = false;
    this.focusedSprite = new AnimatedSprite(
      "player", { animationSpeed: 9,
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
