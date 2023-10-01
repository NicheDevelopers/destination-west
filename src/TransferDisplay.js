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
import { tileSize, equipmentSpriteSize } from "./global/consts.js";
import Transfer from "./Transfer.js";
import { createElement } from "./global/utilities.js";

class TransferDisplay extends State {
  constructor(game){
      super(true);
      this.game = game;
      this.actions = ['Interact'];
      this.transfer = null;
      this.div = createElement('div', null, null, ["window"], {}, "transfer", null);
      let gameContainer = document.querySelector("#game-container");

      // 'equipmentSpriteSize' to change - constant value of transfer display width 
      let divEqWidthHeight = `${(tileSize+2)*equipmentSpriteSize*2}`;
      this.divEqListPlayer = createElement('div', divEqWidthHeight, divEqWidthHeight, 
        [], {}, "transfer-list", null
      );

      this.divEqListTransfer = createElement('div', divEqWidthHeight, divEqWidthHeight, 
        [], {}, "transfer-list", null
      );

      this.div.appendChild(this.divEqListPlayer);
      this.div.appendChild(this.divEqListTransfer);

      gameContainer.appendChild(this.div);
  }

  check_eq (i){
    if (i === 0) return true; // player equipment
    return false; // transfer equipment
  }

  refresh() {
    var childDivs = document.getElementById('transfer').children;
    for (let i=0; i<childDivs.length; i++){
      var child = childDivs[i];
      let eqFlag = this.check_eq(i);
      var givenEquipment, transferEquipment;
      if (eqFlag) { 
        givenEquipment = this.transfer.playerEquipment;
        transferEquipment = this.transfer.transferEquipment;
      }
      else {
        givenEquipment = this.transfer.transferEquipment;
        transferEquipment = this.transfer.playerEquipment;
      }
      // clear
      while(child.firstChild){
        child.removeChild(child.lastChild);
      }
      // add divs
      let sortDiv = createElement('div', null, null, ["list-info"], {}, null, "Sort by weight from");

      for (let j = 0; j<2; j++){
        let buttonSort = createElement('button', null, null, ["button", "eq-button"], {}, null, null);
        let flag = ( j === 0 ) ? true : false;
        buttonSort.addEventListener("click", () => { 
          if (eqFlag) transferEquipment.sortByWeight(flag);
          else givenEquipment.sortByWeight(flag);
          this.refresh();
        });
        if (flag) buttonSort.innerText = "Heavy";
        else buttonSort.innerText = "Light";
        sortDiv.appendChild(buttonSort);
      }

      child.appendChild(sortDiv);
      
      for (let record of givenEquipment.records) {
        child.appendChild(this.recordToListElement(record, eqFlag, givenEquipment, transferEquipment));
      }

      let sumWeight = createElement('div', null, null, ["list-info"], {}, null, 
        "Weight summary of all items: " + givenEquipment.sumWeight() + " / " + givenEquipment.maxWeight
      );
      child.appendChild(sumWeight);
    }
  }
  recordToListElement(record, eqFlag, givenEquipment, transferEquipment) {
    let div = createElement('div', null, null, ["list-element"], {}, null, null)
    let nameDiv = createElement('div', null, null, ["list-obj"], {}, null, record.item.name);
    let weightDiv = createElement('div', null, null, ["list-obj"], {
        marginLeft: '5%'
      }, null, record.getWeight());
    let quantityDiv = createElement('div', null, null, ["list-obj"], {}, null, record.quantity);
    let transferButton = createElement('button', null, null, ["button", "eq-button"], {}, null, null);
    transferButton.addEventListener("click", () => { 
      this.transfer.transferItem(record, givenEquipment, transferEquipment); 
      this.refresh(); 
    });
    if (eqFlag) transferButton.innerText = "Right";
    else transferButton.innerText = "Left";
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
