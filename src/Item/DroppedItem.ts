import Interactible from "@/Entity/Interactible.js";
import { type Point } from "@/utilities/utilities.js";
import { TILE_SIZE } from "@/global/consts.js";
import { notifier, Notification } from "@/global/notifier.js";
import type Game from "@/game/Game.js";
import type Entity from "@/Entity/Entity.js";
import type Item from "./Item.js";

class DroppedItem extends Interactible {
  private item: Item;

  constructor(game: Game, item: Item, pos: Point) {
    // dropped items can be walked over, so they have no hitbox
    super(
      game,
      "decoration-big-bag-3x",
      { x: pos.x - TILE_SIZE / 2, y: pos.y - TILE_SIZE / 2 },
      { hitbox: undefined },
    );
    this.item = item;
  }

  interact(who: Entity) {
    if (who.equipment.put(this.item)) {
      who.game.currentTown.droppedItems = who.game.currentTown.droppedItems.filter(
        (i) => i.id !== this.id,
      );
    }
    notifier.send(new Notification(`Picked up ${this.item.name}`, this.item.spriteName));
  }
}

export default DroppedItem;
