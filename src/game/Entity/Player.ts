import Entity from "@/engine/Entity";

import { PLAYER_PARAMETERS as pp } from "@/game/consts";

import { addTraits } from "@/engine/traits";
import { InventoryTrait } from "@/game/Equipment/InventoryTrait";

import { ctx } from "@/engine/Browser";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";

class Player extends Entity {
  game: Game;

  constructor(game: Game, pos: Point) {
    super("player", pos, {
      movement: { playerControlled: true, speed: pp.defaultPlayerSpeed },
      animated: true,
      hitbox: game.currentTown.array,
      relativeCenterPoint: pp.playerRcp,
      boundingDistance: pp.playerBd,
    });

    this.name = "Player";
    addTraits(this, InventoryTrait(pp.defaultStartCash));
    this.game = game;

    // register all actions that the player can do and bind
    // them to correct keys
    this.actions = [
      "Move Right",
      "Move Left",
      "Move Up",
      "Move Down",
      "Toggle Sprint",
      "Toggle Sneak",
    ];

    this.hitbox.visualizeCollisions((f) => this.game.camera.addDebugDraw(f, { once: true }));
  }

  update() {
    this.movement.update();

    this.sprite.next();
  }

  manageInputs(keyman) {
    keyman.manageInput("Interact", (key) => this.interact(key));

    this.movement.manageInputs(keyman);
  }

  isFacingRight() {
    return this.sprite.mirrored;
  }

  interact(key) {
    this.game.updateFocus();
    let focused = this.game.getFocusedItem();
    focused?.interact(this, key);
    this.game.updateFocus();
  }

  override drawDebugInfo(cameraX, cameraY) {
    let x = this.movement.getChangeX();
    let y = this.movement.getChangeY();

    this.hitbox.draw(cameraX, cameraY);
    this.hitbox.drawExpected(cameraX, cameraY, x, y);

    // Highlight tiles that player is present on
    this.game.camera.addDebugDraw(
      (cx, cy) => {
        for (const tile of this.game.currentTown.array.flat()) {
          if (tile.hasEntityOfType(Player)) {
            tile.drawDebugInfo(cx, cy, ctx, { color: "#00ffff33" });
          }
        }
      },
      { once: true },
    );
  }
}

export default Player;
