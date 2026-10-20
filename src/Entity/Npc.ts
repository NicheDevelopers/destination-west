// import AnimatedSprite from "../Sprite/AnimatedSprite.js";
// import Entity from "./Entity.js";
// import {ANIMATION_SPEED} from "../global/consts.js";
import Interactible from "./Interactible.js";
import { addTraits, InventoryTrait } from "../traits.js";
import { genNpcName } from "../generators/nameGenerators.js";
import Dialogue from "../Dialogue/Dialogue.ts";
import testDialogue from "../Dialogue/test_dialogue.dwd?raw";
import { NPC_PARAMETERS } from "../global/consts.js";
import Stats, { type StatLevel, type StatName } from "./Stats.js";
import type { Point } from "../utilities/utilities.ts";
import type Game from "../game/Game.ts";
import type AnimatedSprite from "../Sprite/AnimatedSprite.js";
import type Movement from "../game/Movement.js";
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

  update(): void {
    if (!this.impaired) this.movement.update();
    this.sprite.next();
  }

  drawDebugInfo(cameraX: number, cameraY: number): void {
    this.movement.pathfinder.drawDebugInfo(cameraX, cameraY);
  }
  interact(who) {
    this.sprite.mirrored = who.pos.x < this.pos.x;
    this.dialogue = new Dialogue(who, this).fromText(testDialogue);

    this.game.startDialogue(this.dialogue);
  }
}

export default Npc;
