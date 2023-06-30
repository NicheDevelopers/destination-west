import Entity from "./Entity.js";

class Npc extends Entity {
  constructor(name, x, y) {
    // 32 to be replaced by 64
    super("player", x + 32, y);
    this.name = name;
    this.sprite.changeAnimation("idle");
  }
  update() {
    this.sprite.next();
  }
}

export default Npc;
