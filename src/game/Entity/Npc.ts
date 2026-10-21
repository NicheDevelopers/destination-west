// import AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
// import Entity from "@/engine/Entity";
// import {ANIMATION_SPEED} from "@/game/consts";
import Interactible from "./Interactible";
import { addTraits } from "@/engine/traits";
import { InventoryTrait } from "@/game/Equipment/InventoryTrait";
import { genNpcName } from "@/game/generators/nameGenerators";
import Dialogue from "@/game/Dialogue/Dialogue";
import testDialogue from "@/game/Dialogue/test_dialogue.dwd?raw";
import { NPC_PARAMETERS } from "@/game/consts";
import Stats, { type StatLevel, type StatName } from "./Stats";
import type { Point } from "@/lib/utilities";
import type Game from "@/game/Game";
import type AnimatedSprite from "@/engine/Sprite/AnimatedSprite";
import type Movement from "@/engine/Movement";
class Npc extends Interactible {
  private impaired: boolean;
  private stats: Stats;
  dialogue: Dialogue | null = null;
  name: string;
  declare sprite: AnimatedSprite;
  declare movement: Movement;

  constructor(game: Game, pos: Point, name: string | null = null) {
    super(game, "player", pos, {
      movement: { speed: NPC_PARAMETERS.defaultNpcSpeed },
      hitbox: game.currentTown.array,
      animated: true,
    });
    this.name = name ?? genNpcName(true, true);
    this.impaired = false;
    this.stats = new Stats();

    addTraits(this, InventoryTrait(NPC_PARAMETERS.defaultNpcStartCash));
  }

  changeStat(statName: StatName, changeValue: number): void {
    this.stats.change(statName, changeValue);
  }

  checkStat(statName: StatName): StatLevel {
    return this.stats.check(statName);
  }

  override update(): void {
    if (!this.impaired) this.movement.update();
    this.sprite.next();
  }

  override drawDebugInfo(cameraX: number, cameraY: number): void {
    this.movement.pathfinder.drawDebugInfo(cameraX, cameraY);
  }
  override interact(who) {
    this.sprite.mirrored = who.pos.x < this.pos.x;
    this.dialogue = new Dialogue(who, this).fromText(testDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Npc;
