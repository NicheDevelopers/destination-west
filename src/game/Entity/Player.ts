import Entity from "@/engine/Entity";

import Movement from "@/engine/Movement";
import { DEFAULT_EQUIPMENT_SIZE, PLAYER_PARAMETERS as pp } from "@/game/consts";
import Equipment, { type EquipmentRecord } from "@/game/Equipment/Equipment";

import { ctx } from "@/engine/Browser";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type Hitbox from "@/engine/HitboxClass";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";

class Player extends Entity {
  game: Game;
  movement: Movement;
  equipment: Equipment;
  declare hitbox: Hitbox;
  declare sprite: AnimatedSprite;

  constructor(game: Game, pos: Point) {
    super("player", pos, {
      animated: true,
      hitbox: game.currentTown.array,
      relativeCenterPoint: pp.playerRcp,
      boundingDistance: pp.playerBd,
    });

    this.name = "Player";
    this.movement = new Movement(this, pp.defaultPlayerSpeed, undefined, undefined, {
      playerControlled: true,
    });
    this.equipment = new Equipment(DEFAULT_EQUIPMENT_SIZE, pp.defaultStartCash);
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

  dropItem(record: EquipmentRecord): void {
    let item = this.equipment.drop(record);
    this.game.currentTown.dropItem(item, this.getCenterPoint());
    this.game.currentTown.updateFocus(this.game.player);
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
