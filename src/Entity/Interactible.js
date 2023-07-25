import Entity from "./Entity.js";
import AnimatedSprite from "../Sprite/AnimatedSprite.js";
import {defaultPlayerSpeed, animationSpeed} from "../global/consts.js"

class Interactible extends Entity {
  constructor(game, typeName, x=0, y=0, speed=defaultPlayerSpeed) {
    super(game, typeName, x, y, speed);
    this.loadedFocusedSprite = false;
    this.focusedSprite = new AnimatedSprite(
      typeName, { animationSpeed: animationSpeed,
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
