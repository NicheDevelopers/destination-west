import { createElement } from "@/lib/dom";
import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import type Game from "@/game/Game";
import type Equipment from "./Equipment";
import type { EquipmentRecord } from "./Equipment";

class EquipmentDisplay extends State {
  private readonly equipment: Equipment;
  private readonly game: Game;
  private readonly div: HTMLDivElement;
  private readonly listDiv: HTMLDivElement;
  readonly actions: string[];

  constructor(game: Game, equipment: Equipment) {
    super();
    this.equipment = equipment;
    this.game = game;
    this.actions = ["Toggle Equipment Display"];
    this.div = createElement("div", null, null, ["window"], {}, "equipment", null);
    this.listDiv = createElement("div", null, null, [], {}, "eq-list", null);
    this.div.appendChild(this.listDiv);
    gameContainer.appendChild(this.div);
  }

  refresh(): void {
    this.listDiv.replaceChildren();
    this.listDiv.appendChild(
      createElement("div", null, null, ["list-info"], {}, null, `Cash: ${this.equipment.cash}`),
    );

    const sortDiv = createElement(
      "div",
      null,
      null,
      ["list-info"],
      {},
      null,
      "Sort by weight from",
    );
    for (const [label, heavyOnTop] of [
      ["Heavy", true],
      ["Light", false],
    ] as const) {
      const button = createElement("button", null, null, ["button", "eq-button"], {}, null, label);
      button.addEventListener("click", () => {
        this.equipment.sortByWeight(heavyOnTop);
        this.refresh();
      });
      sortDiv.appendChild(button);
    }
    this.listDiv.appendChild(sortDiv);

    for (const record of this.equipment.records) {
      this.listDiv.appendChild(this.recordToListElement(record));
    }
    this.listDiv.appendChild(
      createElement(
        "div",
        null,
        null,
        ["list-info"],
        {},
        null,
        `Weight summary of all items: ${this.equipment.sumWeight()} / ${this.equipment.maxWeight}`,
      ),
    );
  }

  override startHook(): void {
    this.refresh();
    this.div.style.display = "flex";
  }

  override endHook(): void {
    this.div.style.display = "none";
  }

  private recordToListElement(record: EquipmentRecord): HTMLDivElement {
    const div = createElement("div", null, null, ["list-element"], {}, null, null);
    const nameDiv = createElement(
      "div",
      null,
      null,
      ["list-obj"],
      { marginLeft: "5%" },
      null,
      record.item.name,
    );
    const weightDiv = createElement(
      "div",
      null,
      null,
      ["list-obj"],
      {},
      null,
      String(record.getWeight()),
    );
    const quantityDiv = createElement(
      "div",
      null,
      null,
      ["list-obj"],
      {},
      null,
      String(record.quantity),
    );
    const dropButton = createElement(
      "button",
      null,
      null,
      ["button", "eq-button"],
      {},
      null,
      "Drop",
    );
    dropButton.addEventListener("click", () => {
      this.game.player.dropItem(record);
      this.refresh();
    });
    div.append(record.item.sprite.img, nameDiv, weightDiv, quantityDiv, dropButton);
    return div;
  }

  override manageInputs(_keyboardManager: Parameters<State["manageInputs"]>[0]): void {}
  update(): void {}
}

export default EquipmentDisplay;
