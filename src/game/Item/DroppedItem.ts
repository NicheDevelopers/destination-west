import Interactible from "@/game/Entity/Interactible";
import { type Point } from "@/lib/utilities";
import { TILE_SIZE } from "@/engine/consts";
import { notifier, Notification } from "@/engine/notifier";
import type Game from "@/game/Game";
import type Player from "@/game/Entity/Player";
import type Item from "./Item";

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

  interact(who: Player) {
    if (who.equipment.put(this.item)) {
      who.game.currentTown.droppedItems = who.game.currentTown.droppedItems.filter(
        (i) => i.id !== this.id,
      );
    }
    notifier.send(new Notification(`Picked up ${this.item.name}`, this.item.spriteName));
  }
}

export default DroppedItem;
