/*
  file: src/EquipmentDisplay.js
  purpose: Define the EquipmentDisplay class 
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

import { equipmentSpriteSize, tileSize } from "../global/consts.js";

import { createElement } from "../global/utilities.js";
import { stateManager, State } from "../global/stateManager.js"

class EquipmentDisplay extends State {
  constructor(game, equipment) {
    super(false);
    this.equipment = equipment;
    this.game = game;
    this.actions = ['Toggle Equipment Display'];
    this.div = createElement('div', null, null, ["window"], {}, "equipment", null);
    let gameContainer = document.querySelector("#game-container");
    this.divEqList = createElement(
      'div',
      null, 
      null, 
      [], {}, "eq-list", null
    );
    this.div.appendChild(this.divEqList);
    gameContainer.appendChild(this.div);
  }

  refresh() {
    while(this.divEqList.firstChild) {
      this.divEqList.removeChild(this.divEqList.lastChild);
    }
    // let mainDiv = createElement('div', null, null, ["list-element"], {}, null, "Item name" + "Weight" + "Drop");
    // this.divEqList.appendChild(mainDiv);
    let sortDiv = createElement('div', null, null, ["list-info"], {}, null, "Sort by weight from");
    let buttonSortUp = createElement('button', null, null, ["button", "eq-button"], {}, null, "Heavy");
    buttonSortUp.addEventListener("click", () => { this.equipment.sortByWeight(true); this.refresh() });
    sortDiv.appendChild(buttonSortUp);
    let buttonSortDown = createElement('button', null, null, ["button", "eq-button"], {}, null, "Light");
    buttonSortDown.addEventListener("click", () => { this.equipment.sortByWeight(false); this.refresh() });
    sortDiv.appendChild(buttonSortDown);
    this.divEqList.appendChild(sortDiv);
    for (let record of this.equipment.records) {
      this.divEqList.appendChild(this.recordToListElement(record));
    }
    let sumWeight = createElement(
      'div', null, null, ["list-info"], {}, null, 
      "Weight summary of all items: " + this.equipment.sumWeight() + " / " + this.equipment.maxWeight
    );
    this.divEqList.appendChild(sumWeight);
  }
  startHook() {
    this.refresh();
    this.div.style.display = "flex";
  }
  endHook() {
    this.div.style.display = "none";
  }
  recordToListElement(record) {
    let div = createElement('div', null, null, ["list-element"], {}, null, null);
    let nameDiv = createElement('div', null, null, ["list-obj"], {
      marginLeft: '5%'
    }, null, record.item.name);
    let weightDiv = createElement('div', null, null, ["list-obj"], {}, null, record.getWeight())
    let quantityDiv = createElement('div', null, null, ["list-obj"], {}, null, record.quantity)
    let dropButton = createElement('button', null, null, ["button", "eq-button"], {}, null, "Drop")
    dropButton.addEventListener("click", () => { this.game.player.dropItem(record); this.refresh() });
    div.appendChild(record.item.sprite.img);
    div.appendChild(nameDiv);
    div.appendChild(weightDiv);
    div.appendChild(quantityDiv);
    div.appendChild(dropButton);
    return div;
  }
  update() {
    this.game.app.manageRequest(
      'Toggle Equipment Display',
      () => stateManager.toggleState(this),
      { once: true }
    );
  }
};

export default EquipmentDisplay;