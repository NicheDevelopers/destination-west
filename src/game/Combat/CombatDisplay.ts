import { State } from "@/engine/state/State";
import { AttackType, CombatAction, type Combat } from "./Combat";
import { ButtonList } from "@/lib/ButtonList";
import { htmlCreate } from "@/lib/dom";
import { ctx, gameContainer } from "@/engine/Browser";
import type { KeyboardManager } from "@/engine/KeyboardManager";
import { Dialogue } from "@/game/Dialogue/Dialogue";
import { items } from "@/game/items";
import type Game from "@/game/Game";
import type Player from "@/game/Entity/Player";
import type Npc from "@/game/Entity/Npc";

export default class CombatDisplay extends State {
  readonly game: Game;
  private combat: Combat;
  private player: Player;
  private mainEnemy: Npc;
  private dialogue: Dialogue | null = null;
  private menuDiv: HTMLElement;
  private display: ButtonList;

  constructor(game: CombatDisplay["game"], combat: CombatDisplay["combat"]) {
    super();
    this.game = game;
    this.combat = combat;
    this.player = this.combat.player;
    this.mainEnemy = this.combat.mainEnemy;
    this.menuDiv = htmlCreate({
      id: "combat-menu",
      classList: "combat",
      appendTo: gameContainer,
    });

    this.display = new ButtonList({
      callbackArgument: this,
      rowCount: 4,
    });

    this.display.add("Attack", this.createAttackTypeList());
    this.display.add("Ability", this.createAbilityList());
    this.display.add("Use item", this.createUseItemList());
    this.display.add("Retreat", () => this.retreat());

    this.display.appendTo(this.menuDiv);
  }

  private createAttackTypeList(): ButtonList {
    const attackTypeList = new ButtonList().inherit(this.display);
    for (const attackType of Object.keys(AttackType)) {
      attackTypeList.add(attackType, () => {
        this.displayDialogue(
          `P|Hold on adventurer! ${attackType} attack is not implemented yet!\n` +
            `N|Who are you talking to?`,
        );
      });
    }
    attackTypeList.add("Back", ButtonList.BACK);
    return attackTypeList;
  }

  private createAbilityList(): ButtonList {
    const abilityList = new ButtonList().inherit(this.display);
    abilityList.add("Spit", () => {
      this.displayDialogue("P|*Spits!*\nN|How dare you spit on me! I'll make you pay for that!");
    });
    abilityList.add("Insult", () => {
      this.displayDialogue(
        "P|Your mama's so old, she knew the Grand Canyon when it was just a ditch.\n" +
          "N|You'll pay for that insult!",
      );
    });
    abilityList.add("Back", ButtonList.BACK);
    return abilityList;
  }

  private createUseItemList(): ButtonList {
    const useItemList = new ButtonList().inherit(this.display);
    const whiskeyCount = this.player.equipment.countOf(items.whisky);
    useItemList.add(`Whiskey (x${whiskeyCount})`, () => {
      this.combat.executeAction(CombatAction.UseItem(this.player, items.whisky));
      this.displayDialogue(
        "P|*Gulp, gulp*\nN|You're drinking on the job? I'll make you pay for that!",
      );
    });
    useItemList.add("Back", ButtonList.BACK);
    return useItemList;
  }

  private retreat(): void {
    const retreatResult = this.combat.executeAction(CombatAction.Retreat(this.player));
    console.log("Retreat result: ", retreatResult.success);

    if (retreatResult.success) {
      this.displayDialogue(
        "N|You coward! No one crosses me and lives to tell the tale. I'll find ya!",
        () => this.endState(),
      );
      return;
    }
    this.displayDialogue("N|You can't escape from me!");
  }

  /**
   * Display a dialogue to the player.
   * Temporarily accepts a string to parse as a dialogue instead of a dwd file path.
   * @param text The text to parse as a dialogue
   * @param callback The callback to call when the dialogue is finished
   * by default, it will return to displaying the menu.
   */
  displayDialogue(text: string, callback = () => this.display.back()): void {
    this.styleForDialogue();
    this.dialogue = new Dialogue(this.player, this.mainEnemy).fromText(text);
    this.dialogue.setupDisplay(this, this.display.div, callback);
  }

  styleForDialogue(): void {
    this.display.clear();
    this.display.div.classList.add("dialogue");
  }

  reset(): void {
    this.combat.reset();
    this.display.back();
  }

  draw(): void {
    this.player.drawRaw(100, 100, ctx);
  }

  override startHook(): void {
    this.menuDiv.style.display = "flex";
  }
  override endHook(): void {
    this.menuDiv.style.display = "none";
  }
  update(): void {
    this.dialogue?.update();
  }
  override manageInputs(keyboardManager: Pick<KeyboardManager, "manageInput">): void {
    keyboardManager.manageInput("Next Dialogue Line", () => {
      this.dialogue?.step();
    });
  }
}
