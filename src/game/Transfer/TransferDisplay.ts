import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import Transfer from "./Transfer";
import { createElement } from "@/lib/dom";
import type Game from "@/game/Game";
import type Equipment from "@/game/Equipment/Equipment";
import type { EquipmentRecord } from "@/game/Equipment/Equipment";

class TransferDisplay extends State {
  readonly game: Game;
  private transfer: Transfer | null = null;
  private readonly div: HTMLDivElement;
  private readonly playerListDiv: HTMLDivElement;
  private readonly transferListDiv: HTMLDivElement;

  constructor(game: Game) {
    super();
    this.game = game;
    this.div = createElement("div", null, null, ["window"], {}, "transfer", null);

    this.playerListDiv = createElement("div", null, null, [], {}, "transfer-list", null);

    this.transferListDiv = createElement("div", null, null, [], {}, "transfer-list", null);

    this.div.appendChild(this.playerListDiv);
    this.div.appendChild(this.transferListDiv);

    gameContainer.appendChild(this.div);
  }

  refresh(): void {
    const transfer = this.transfer;
    if (!transfer) return;

    const lists = [
      // [list div, isPlayerList]
      [this.playerListDiv, true],
      [this.transferListDiv, false],
    ] as const;
    for (const [listDiv, isPlayerList] of lists) {
      const givenEquipment = isPlayerList ? transfer.playerEquipment : transfer.transferEquipment;
      const transferEquipment = isPlayerList
        ? transfer.transferEquipment
        : transfer.playerEquipment;
      // clear
      listDiv.replaceChildren();
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
      listDiv.appendChild(cashDiv);
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

      listDiv.appendChild(sortDiv);

      for (const record of givenEquipment.records) {
        listDiv.appendChild(
          this.recordToListElement(
            transfer,
            record,
            isPlayerList,
            givenEquipment,
            transferEquipment,
          ),
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
      listDiv.appendChild(sumWeight);
    }
  }

  private recordToListElement(
    transfer: Transfer,
    record: EquipmentRecord,
    isPlayerList: boolean,
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
    if (transfer.trading) label = isPlayerList ? "Sell" : "Buy";
    else label = isPlayerList ? "Right" : "Left";
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

  override manageInputs(_keyboardManager: Parameters<State["manageInputs"]>[0]): void {}

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
