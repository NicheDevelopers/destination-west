// import AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
// import Entity from "@/engine/Entity";
// import {ANIMATION_SPEED} from "@/game/consts";
import Interactible from "./Interactible";
import { genNpcName } from "@/game/generators/nameGenerators";
import Dialogue from "@/game/Dialogue/Dialogue";
import testDialogue from "@/game/Dialogue/test_dialogue.dwd?raw";
import { DEFAULT_EQUIPMENT_SIZE, NPC_PARAMETERS } from "@/game/consts";
import Equipment from "@/game/Equipment/Equipment";
import Movement from "@/engine/Movement";
import Stats, { type StatLevel, type StatName } from "./Stats";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
import type Hitbox from "@/engine/Hitbox";
import type Player from "./Player";
class Npc extends Interactible {
  canMove: boolean;
  private stats: Stats;
  dialogue: Dialogue | null = null;
  name: string;
  movement: Movement;
  equipment: Equipment;
  declare sprite: AnimatedSprite;
  declare hitbox: Hitbox;

  constructor(game: Game, pos: Point, name: string | null = null) {
    super(game, "player", pos, {
      hitbox: game.currentTown.tiles,
      animated: true,
    });
    this.name = name ?? genNpcName(true, true);
    this.canMove = true;
    this.stats = new Stats();
    this.movement = new Movement(this, NPC_PARAMETERS.defaultNpcSpeed);
    this.equipment = new Equipment(DEFAULT_EQUIPMENT_SIZE, NPC_PARAMETERS.defaultNpcStartCash);
  }

  changeStat(statName: StatName, changeValue: number): void {
    this.stats.change(statName, changeValue);
  }

  checkStat(statName: StatName): StatLevel {
    return this.stats.check(statName);
  }

  override update(): void {
    if (this.canMove) this.movement.update();
    this.sprite.next();
  }

  override drawDebugInfo(cameraX: number, cameraY: number): void {
    this.movement.pathfinder.drawDebugInfo(cameraX, cameraY);
  }
  override interact(who: Player) {
    this.sprite.mirrored = who.pos.x < this.pos.x;
    this.dialogue = new Dialogue(who, this).fromText(testDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Npc;
