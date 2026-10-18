import { State } from "../global/stateManager.js";
import { AttackType, CombatAction } from "./Combat.js";
import { ButtonList, htmlCreate } from "../global/utilities.js";
import { ctx } from "../core/Browser.js";
import { Dialogue } from "../Dialogue/Dialogue.ts";
import { items } from "../global/items.js";

export default class CombatDisplay extends State {
  constructor(game, combat) {
    super();
    this.game = game;
    this.combat = combat;
    this.player = this.combat.player;
    this.mainEnemy = this.combat.mainEnemy;

    const menuDiv = htmlCreate({
      id: "combat-menu",
      classList: "combat",
      appendTo: document.querySelector("#game-container"),
    });

    /**
     * The ButtonList used to display the combat menu and temporary dialogues
     */
    this.display = new ButtonList({
      callbackArgument: this,
      rowCount: 4,
    });
    let attackTypeList = new ButtonList().inherit(this.display);

    Object.keys(AttackType).forEach((key) => {
      attackTypeList.add(key, () => {
        this.displayDialogue(
          `P|Hold on adventurer! ${key} attack is not implemented yet!\n` +
            `N|Who are you talking to?`,
        );
      });
    });
    attackTypeList.add("Back", ButtonList.BACK);

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

    const useItemList = new ButtonList().inherit(this.display);
    const whiskeyCount = this.player.equipment.countOf(items.whisky);
    useItemList.add(`Whiskey (x${whiskeyCount})`, () => {
      this.combat.executeAction(CombatAction.UseItem(this.combat.player, items.whisky));
      this.displayDialogue(
        "P|*Gulp, gulp*\nN|You're drinking on the job? I'll make you pay for that!",
      );
    });
    useItemList.add("Back", ButtonList.BACK);

    this.display.add("Attack", attackTypeList);
    this.display.add("Ability", abilityList);
    this.display.add("Use item", useItemList);
    this.display.add("Retreat", () => {
      const retreatResult = this.combat.executeAction(CombatAction.Retreat(this.combat.player));
      console.log("Retreat result: ", retreatResult.success);

      if (retreatResult.success) {
        this.displayDialogue(
          "N|You coward! No one crosses me and lives to tell the tale. I'll find ya!",
          () => this.endState(),
        );
        return;
      }
      this.displayDialogue("N|You can't escape from me!");
    });

    this.display.appendTo(menuDiv);
    this.menuDiv = menuDiv;
  }

  /**
   * Display a dialogue to the player.
   * Temporarily accepts a string to parse as a dialogue instead of a dwd file path.
   * @param {string} text The text to parse as a dialogue
   * @param {function} callback The callback to call when the dialogue is finished
   * by default, it will return to displaying the menu.
   */
  displayDialogue(text, callback = () => this.display.back()) {
    this.styleForDialogue();
    this.dialogue = new Dialogue(this.player, this.mainEnemy).fromText(text);
    this.dialogue.setupDisplay(this, this.display.div, callback);
  }

  styleForDialogue() {
    this.display.clear();
    this.display.div.classList.add("dialogue");
  }

  reset() {
    this.combat.reset();
    this.display.back();
  }

  draw() {
    this.combat.player.drawRaw(100, 100, ctx);
  }

  startHook() {
    this.menuDiv.style.display = "flex";
  }
  endHook() {
    this.menuDiv.style.display = "none";
  }
  update() {
    if (this.dialogue) this.dialogue.update();
  }
  manageInputs(keyman) {
    keyman.manageInput("Next Dialogue Line", () => {
      if (this.dialogue) {
        this.dialogue.step();
      }
    });
  }
}
