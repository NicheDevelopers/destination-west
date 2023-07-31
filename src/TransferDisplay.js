/*
  file: src/TransferDisplay.js
  purpose: Define the TransferDisplay class 
  author: Oskar Kiliańczyk <https://gitlab.com/oskkil>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/

import { State, stateManager } from "./global/stateManager.js";
import {tileSize, equipmentSpriteSize} from "./global/consts.js";
import Transfer from "./Transfer.js";

class TransferDisplay extends State {
    constructor(game){
        super(true);
        this.game = game;
        this.actions = ['Interact'];
        this.transfer = null;
        this.div = document.createElement("div");
        let gameContainer = document.querySelector("#game-container");
        this.div.id = "transfer";
        this.div.classList.add("window");

        this.divEqListPlayer = document.createElement("div");
        this.divEqListPlayer.id = "transfer-list";
        // '7' to change - constant value of transfer display width 

        this.divEqListPlayer.style.width = `${(tileSize+2)*equipmentSpriteSize*2}px`;
        this.divEqListPlayer.style.height = `${(tileSize+2)*equipmentSpriteSize*2}px`;

        this.divEqListTransfer = document.createElement("div");
        this.divEqListTransfer.id = "transfer-list";
        // 'equipmentSpriteSize' to change - constant value of transfer display width 
        this.divEqListTransfer.style.width = `${(tileSize+2)*equipmentSpriteSize*2}px`;
        this.divEqListTransfer.style.height = `${(tileSize+2)*equipmentSpriteSize*2}px`;

        this.div.appendChild(this.divEqListPlayer);
        this.div.appendChild(this.divEqListTransfer);

        gameContainer.appendChild(this.div);
    }

    refresh() {
        while(this.divEqListPlayer.firstChild) {
          this.divEqListPlayer.removeChild(this.divEqListPlayer.lastChild);
        }
        while(this.divEqListTransfer.firstChild) {
            this.divEqListTransfer.removeChild(this.divEqListTransfer.lastChild);
        }
        let sortDivPlayer = document.createElement("div");
        sortDivPlayer.classList.add("list-info");
        sortDivPlayer.style.border = 'none';
        sortDivPlayer.style.borderBottom = '2px solid black';
        sortDivPlayer.style.textAlign = "center";
        sortDivPlayer.innerText = "Sort by weight from";
        let buttonSortUpPlayer = document.createElement("button");
        buttonSortUpPlayer.classList.add("button", "eq-button");
        buttonSortUpPlayer.addEventListener("click", () => { this.transfer.playerEquipment.sortByWeight(true); this.refresh() });
        buttonSortUpPlayer.innerText = "Heavy";
        sortDivPlayer.appendChild(buttonSortUpPlayer);
        let buttonSortDownPlayer = document.createElement("button");
        buttonSortDownPlayer.classList.add("button", "eq-button");
        buttonSortDownPlayer.addEventListener("click", () => { this.transfer.playerEquipment.sortByWeight(false); this.refresh() });
        buttonSortDownPlayer.innerText = "Light";
        sortDivPlayer.appendChild(buttonSortDownPlayer);
        this.divEqListPlayer.appendChild(sortDivPlayer);
        for (let record of this.transfer.playerEquipment.records) {
          this.divEqListPlayer.appendChild(this.recordToListElement(record, true));
        }
        let sumWeightPlayer = document.createElement("div");
        sumWeightPlayer.classList.add("list-info");
        sumWeightPlayer.style.textAlign = "center";
        sumWeightPlayer.innerText = "Weight summary of all items: " + this.transfer.playerEquipment.sumWeight() + " / " + this.transfer.playerEquipment.maxWeight;
        this.divEqListPlayer.appendChild(sumWeightPlayer);

        let sortDivTransfer = document.createElement("div");
        sortDivTransfer.classList.add("list-info");
        sortDivTransfer.style.border = 'none';
        sortDivTransfer.style.borderBottom = '2px solid black';
        sortDivTransfer.style.textAlign = "center";
        sortDivTransfer.innerText = "Sort by weight from";
        let buttonSortUpTransfer = document.createElement("button");
        buttonSortUpTransfer.classList.add("button", "eq-button");
        buttonSortUpTransfer.addEventListener("click", () => { this.transfer.transferEquipment.sortByWeight(true); this.refresh() });
        buttonSortUpTransfer.innerText = "Heavy";
        sortDivTransfer.appendChild(buttonSortUpTransfer);
        let buttonSortDownTransfer = document.createElement("button");
        buttonSortDownTransfer.classList.add("button", "eq-button");
        buttonSortDownTransfer.addEventListener("click", () => { this.transfer.transferEquipment.sortByWeight(false); this.refresh() });
        buttonSortDownTransfer.innerText = "Light";
        sortDivTransfer.appendChild(buttonSortDownTransfer);
        this.divEqListTransfer.appendChild(sortDivTransfer);
        for (let record of this.transfer.transferEquipment.records) {
          this.divEqListTransfer.appendChild(this.recordToListElement(record, false));
        }
        let sumWeightTransfer = document.createElement("div");
        sumWeightTransfer.classList.add("list-info");
        sumWeightTransfer.style.textAlign = "center";
        sumWeightTransfer.innerText = "Weight summary of all items: " + this.transfer.transferEquipment.sumWeight() + " / " + this.transfer.transferEquipment.maxWeight;
        this.divEqListTransfer.appendChild(sumWeightTransfer);
    }
    recordToListElement(record, isPlayerEquipment) {
        let div = document.createElement("div");
        div.classList.add("list-element");
        div.style.display = "flex";
        div.style.textAlign = "center";
        let nameDiv = document.createElement("div");
        nameDiv.innerText = record.item.name;
        nameDiv.style.display = "inline-block";
        nameDiv.style.flex = 2;
        let weightDiv = document.createElement("div");
        weightDiv.innerText = record.getWeight();
        weightDiv.style.display = "inline-block"; 
        weightDiv.style.flex = 2;
        let quantityDiv = document.createElement("div");
        quantityDiv.innerText = record.quantity;
        quantityDiv.style.display = "inline-block"; 
        quantityDiv.style.flex = 2;
        let transferButton = document.createElement("button");
        transferButton.classList.add("button", "eq-button");
        if (isPlayerEquipment){
            transferButton.addEventListener("click", () => { this.transfer.transferItem(record, this.transfer.playerEquipment, this.transfer.transferEquipment); this.refresh() });
            transferButton.innerText = "Right";
        }
        else {
            transferButton.addEventListener("click", () => { this.transfer.transferItem(record, this.transfer.transferEquipment, this.transfer.playerEquipment); this.refresh() });
            transferButton.innerText = "Left";
        }
        div.appendChild(record.item.sprite.img);
        div.appendChild(nameDiv);
        div.appendChild(weightDiv);
        div.appendChild(quantityDiv);
        div.appendChild(transferButton);
        return div;
    }
    setTransferWith(playerEq, transferEq) {
      this.transfer = new Transfer(playerEq, transferEq);
    }
    update() {
        this.game.app.manageRequest(
          'Interact',
          () => stateManager.toggleState(this),
          { once: true }
        );
    }
    startHook() {
        this.refresh();
        this.div.style.display = "flex";
    }
    endHook() {
        this.div.style.display = "none";
    }

};

export default TransferDisplay;
