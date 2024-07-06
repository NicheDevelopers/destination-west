import { State } from "../global/stateManager.js";
import { AttackType } from "./Combat.js";
import { ButtonList, createCanvas, htmlCreate } from "../global/utilities.js";
import { ctx } from "../core/Browser.js";

export default class CombatDisplay extends State {
  constructor(game, combat) {
    super(true);
    this.game = game;
    this.combat = combat;
    this.actions = [];

    const menuDiv = htmlCreate({
      id: "combat-menu",
      classList: "combat",
      appendTo: document.querySelector("#game-container"),
    });

    let actionList = new ButtonList({
      callbackArgument: this,
    });
    let attackTypeList = new ButtonList();
    Object.keys(AttackType).forEach((key) => {
      attackTypeList.add(key, () =>
        console.log(`Picked an attack of type ${key}`),
      );
    });
    actionList.add("Attack", () => console.log(`Attack!`));
    actionList.add("Retreat", () => console.log(`Retreat!`));
    actionList.div.classList = "button-list";
    actionList.appendTo(menuDiv);

    this.menuDiv = menuDiv;
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

  }
  manageInputs(keyman) {

  }
}
