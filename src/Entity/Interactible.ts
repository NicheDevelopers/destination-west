import Entity from "./Entity.js";
import Sprite from "../Sprite/Sprite.js";
import type Game from "../game/Game.js";
import type { Point } from "../utilities/utilities.js";

class Interactible extends Entity {
  private loadedFocusedSprite: boolean;
  private focusedSprite: Sprite;
  focus: boolean;

  constructor(game: Game, typeName: string, pos: Point, options = {}) {
    super(
      game,
      typeName,
      pos,
      Object.assign(options, {
        hitbox: game.currentTown.array,
      }),
    );
    this.game = game;
    this.loadedFocusedSprite = false;
    this.focusedSprite = new Sprite(typeName, {
      outline: true,
      callback: () => (this.loadedFocusedSprite = true),
    });
    this.focus = false;
  }
  update(): void {}
  interact(_who: Entity, _key?: string): void {}
  draw(cameraX: number, cameraY: number): void {
    if (
      this.focus &&
      this.loadedFocusedSprite &&
      this.typeName !== "player" /* temp to disable npc outline */
    ) {
      this.focusedSprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
      return;
    }
    this.sprite.draw(this.pos.x - cameraX, this.pos.y - cameraY);
  }
}

export default Interactible;
