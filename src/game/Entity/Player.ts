import Entity from "@/engine/Entity";

import Movement from "@/engine/Movement";
import { DEFAULT_EQUIPMENT_SIZE, PLAYER_PARAMETERS } from "@/game/consts";
import Equipment, { type EquipmentRecord } from "@/game/Equipment/Equipment";

import { ctx } from "@/engine/Browser";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type Hitbox from "@/engine/Hitbox";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
import type { InputManager } from "@/engine/state/State";

class Player extends Entity {
  name: string;
  game: Game;
  movement: Movement;
  equipment: Equipment;
  declare hitbox: Hitbox;
  declare sprite: AnimatedSprite;

  constructor(game: Game, pos: Point) {
    super("player", pos, {
      animated: true,
      hitbox: game.currentTown.tiles,
      relativeCenterPoint: PLAYER_PARAMETERS.playerRelativeCenterPoint,
      boundingDistance: PLAYER_PARAMETERS.playerBoundingDistance,
    });

    this.name = "Player";
    this.movement = new Movement(this, PLAYER_PARAMETERS.defaultPlayerSpeed, undefined, undefined, {
      playerControlled: true,
    });
    this.equipment = new Equipment(DEFAULT_EQUIPMENT_SIZE, PLAYER_PARAMETERS.defaultStartCash);
    this.game = game;

    this.hitbox.visualizeCollisions((f) => this.game.camera.addDebugDraw(f, { once: true }));
  }

  update() {
    this.movement.update();

    this.sprite.next();
  }

  manageInputs(keyboardManager: InputManager) {
    keyboardManager.manageInput("Interact", (key) => this.interact(key));

    this.movement.manageInputs(keyboardManager);
  }

  dropItem(record: EquipmentRecord): void {
    let item = this.equipment.drop(record);
    this.game.currentTown.dropItem(item, this.getCenterPoint());
    this.game.currentTown.updateFocus(this.game.player);
  }

  isFacingRight() {
    return this.sprite.mirrored;
  }

  interact(key: string) {
    this.game.updateFocus();
    let focused = this.game.getFocusedItem();
    focused?.interact(this, key);
    this.game.updateFocus();
  }

  override drawDebugInfo(cameraX: number, cameraY: number) {
    let changeX = this.movement.getChangeX();
    let changeY = this.movement.getChangeY();

    this.hitbox.draw(cameraX, cameraY);
    this.hitbox.drawExpected(cameraX, cameraY, changeX, changeY);

    // Highlight tiles that player is present on
    this.game.camera.addDebugDraw(
      (cx, cy) => {
        for (const tile of this.game.currentTown.tiles.flat()) {
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
