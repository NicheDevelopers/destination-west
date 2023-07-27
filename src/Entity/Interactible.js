import Entity from "./Entity.js";
import Sprite from "../Sprite/Sprite.js";

class Interactible extends Entity {
  constructor(game, typeName, x=0, y=0, options={}) {
    super(game, typeName, x, y, options);
    this.loadedFocusedSprite = false;
    this.focusedSprite = new Sprite(
      typeName, { 
		  outline: true,
		  callback:
		  () => this.loadedFocusedSprite = true
		});
    this.focus = false;
  }
  draw(cameraX, cameraY) {
    if (this.focus && this.loadedFocusedSprite) {
      this.focusedSprite.draw(this.x - cameraX, this.y - cameraY);
      return;
    }
    this.sprite.draw(this.x - cameraX, this.y - cameraY);
    // if (this.focus && this.loadedFocusedSprite)
    //   this.focusedSprite.draw(x, y);
    // else
    //   this.sprite.draw(x, y);
  }
}



export default Interactible;
