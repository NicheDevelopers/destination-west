import Entity, { type EntityOptions } from "@/engine/Entity";
import Sprite from "@/engine/Sprite/Sprite";
import type Game from "@/game/Game";
import type { Point } from "@/lib/utilities";
import Location from "../Location/Location";

class Interactible extends Entity {
  game: Game;
  private loadedFocusedSprite: boolean;
  private focusedSprite: Sprite;
  focus: boolean;

  constructor(
    game: Game,
    location: Location,
    typeName: string,
    pos: Point,
    options: EntityOptions = {},
  ) {
    super(typeName, pos, { hitbox: location.tiles, ...options });
    this.game = game;
    this.loadedFocusedSprite = false;
    this.focusedSprite = new Sprite(typeName, {
      outline: true,
      callback: () => (this.loadedFocusedSprite = true),
    });
    this.focus = false;
  }
  update(): void {}

  /**
   * Interaction hook, called when `who` interacts with this object.
   * Subclasses override it with their own behaviour.
   */
  interact(_who: Entity, _key?: string): void {}

  override draw(cameraX: number, cameraY: number): void {
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
