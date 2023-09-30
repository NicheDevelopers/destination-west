import Entity from "./Entity.js";
import Sprite from "../Sprite/Sprite.js";

class Interactible extends Entity {
  constructor(game, typeName, x=0, y=0, options={}) {
    super(typeName, x, y, options);
    this.game = game;
    this.loadedFocusedSprite = false;
    this.focusedSprite = new Sprite(
      typeName, { 
		  outline: true,
		  callback:
		  () => this.loadedFocusedSprite = true
		});
    this.focus = false;
  }
  update() {
  }
  draw(cameraX, cameraY) {
    if (this.focus && this.loadedFocusedSprite
      && !this.typeName === "player" /* temp to disable npc outline */) {
      this.focusedSprite.draw(this.x - cameraX, this.y - cameraY);
      return;
    }
    this.sprite.draw(this.x - cameraX, this.y - cameraY);
  }
}



export default Interactible;
