import { State } from "@/engine/stateManager";
import Transfer from "./Transfer";
import { createElement } from "@/lib/dom";
import type Game from "@/game/Game";
import type Equipment from "@/game/Equipment/Equipment";
import type { EquipmentRecord } from "@/game/Equipment/Equipment";

class TransferDisplay extends State {
  readonly game: Game;
  private transfer: Transfer | null = null;
  private readonly div: HTMLDivElement;
  private readonly divEqListPlayer: HTMLDivElement;
  private readonly divEqListTransfer: HTMLDivElement;

  constructor(game: Game) {
    super();
    this.game = game;
    this.div = createElement("div", null, null, ["window"], {}, "transfer", null);
    const gameContainer = document.querySelector("#game-container");
    if (!gameContainer) throw new Error("Missing #game-container element");

    this.divEqListPlayer = createElement("div", null, null, [], {}, "transfer-list", null);

    this.divEqListTransfer = createElement("div", null, null, [], {}, "transfer-list", null);

    this.div.appendChild(this.divEqListPlayer);
    this.div.appendChild(this.divEqListTransfer);

    gameContainer.appendChild(this.div);
  }

  refresh(): void {
    const transfer = this.transfer;
    if (!transfer) return;

    const lists = [
      // [list div, isPlayerList]
      [this.divEqListPlayer, true],
      [this.divEqListTransfer, false],
    ] as const;
    for (const [child, eqFlag] of lists) {
      const givenEquipment = eqFlag ? transfer.playerEquipment : transfer.transferEquipment;
      const transferEquipment = eqFlag ? transfer.transferEquipment : transfer.playerEquipment;
      // clear
      child.replaceChildren();
      // add divs
      const cashDiv = createElement(
        "div",
        null,
        null,
        ["list-info"],
        {},
        null,
        `Cash: ${givenEquipment.cash}`,
      );
      if (!transfer.trading) {
        const buttonGetCash = createElement(
          "div",
          null,
          null,
          ["button", "eq-button"],
          {},
          null,
          "Get",
        );
        // take all of the other side's cash into this list
        buttonGetCash.addEventListener("click", () => {
          givenEquipment.cash += transferEquipment.cash;
          transferEquipment.cash = 0;
          this.refresh();
        });
        cashDiv.appendChild(buttonGetCash);
      }
      child.appendChild(cashDiv);
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
        const buttonSort = createElement(
          "button",
          null,
          null,
          ["button", "eq-button"],
          {},
          null,
          label,
        );
        buttonSort.addEventListener("click", () => {
          givenEquipment.sortByWeight(heavyOnTop);
          this.refresh();
        });
        sortDiv.appendChild(buttonSort);
      }

      child.appendChild(sortDiv);

      for (const record of givenEquipment.records) {
        child.appendChild(
          this.recordToListElement(transfer, record, eqFlag, givenEquipment, transferEquipment),
        );
      }

      const sumWeight = createElement(
        "div",
        null,
        null,
        ["list-info"],
        {},
        null,
        `Weight summary of all items: ${givenEquipment.sumWeight()} / ${givenEquipment.maxWeight}`,
      );
      child.appendChild(sumWeight);
    }
  }

  private recordToListElement(
    transfer: Transfer,
    record: EquipmentRecord,
    eqFlag: boolean,
    givenEquipment: Equipment,
    transferEquipment: Equipment,
  ): HTMLDivElement {
    const div = createElement("div", null, null, ["list-element"], {}, null, null);
    const nameDiv = createElement("div", null, null, ["list-obj"], {}, null, record.item.name);
    const weightDiv = createElement(
      "div",
      null,
      null,
      ["list-obj"],
      {
        marginLeft: "5%",
      },
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
    let label: string;
    if (transfer.trading) label = eqFlag ? "Sell" : "Buy";
    else label = eqFlag ? "Right" : "Left";
    const transferButton = createElement(
      "button",
      null,
      null,
      ["button", "eq-button"],
      {},
      null,
      label,
    );
    transferButton.addEventListener("click", () => {
      transfer.transferItem(record, givenEquipment, transferEquipment);
      this.refresh();
    });
    div.append(record.item.sprite.img, nameDiv, weightDiv, quantityDiv, transferButton);
    return div;
  }

  setTransferWith(playerEq: Equipment, transferEq: Equipment, trading: boolean): void {
    this.transfer = new Transfer(playerEq, transferEq, trading);
  }

  override manageInputs(_keyman: Parameters<State["manageInputs"]>[0]): void {}

  update(): void {}

  override startHook(): void {
    this.refresh();
    this.div.style.display = "flex";
  }

  override endHook(): void {
    this.div.style.display = "none";
  }
}

export default TransferDisplay;
