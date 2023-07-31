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

import {tileSize} from "./global/consts.js";

import { createDiv } from "./global/utilities.js";
import { stateManager, State } from "./global/stateManager.js"

let dropped = false;

class EquipmentDisplay extends State {
  constructor(game, equipment) {
    super(false);
    this.equipment = equipment;
    this.game = game;
    this.actions = ['Toggle Equipment Display'];
    this.div = document.createElement("div");
    let gameContainer = document.querySelector("#game-container");
    this.div.id = "equipment";
    this.div.classList.add("window");
    this.divEqList = document.createElement("div");
    this.divEqList.id = "eq-list";
    // '7' to change - constant value of equipment display width 
    this.divEqList.style.width = `${(tileSize+2)*7*2}px`;
    this.divEqList.style.height = `${(tileSize+2)*7*2}px`;

    this.div.appendChild(this.divEqList);
    gameContainer.appendChild(this.div);
  }

  refresh() {
    while(this.divEqList.firstChild) {
      this.divEqList.removeChild(this.divEqList.lastChild);
    }
    // let mainDiv = document.createElement("div");
    // mainDiv.classList.add("list-element");
    // mainDiv.style.display = "flex";
    // mainDiv.innerText = "Item name" + "Weight" + "Drop";
    // this.divEqList.appendChild(mainDiv);
    let sortDiv = document.createElement("div");
    sortDiv.classList.add("list-info");
    sortDiv.style.border = 'none';
    sortDiv.style.borderBottom = '2px solid black';
    sortDiv.style.textAlign = "center";
    sortDiv.innerText = "Sort by weight from";
    let buttonSortUp = document.createElement("button");
    buttonSortUp.classList.add("button", "eq-button");
    buttonSortUp.addEventListener("click", () => { this.equipment.sortByWeight(true); this.refresh() });
    buttonSortUp.innerText = "Heavy";
    sortDiv.appendChild(buttonSortUp);
    let buttonSortDown = document.createElement("button");
    buttonSortDown.classList.add("button", "eq-button");
    buttonSortDown.addEventListener("click", () => { this.equipment.sortByWeight(false); this.refresh() });
    buttonSortDown.innerText = "Light";
    sortDiv.appendChild(buttonSortDown);
    this.divEqList.appendChild(sortDiv);
    for (let record of this.equipment.records) {
      this.divEqList.appendChild(this.recordToListElement(record));
    }
    let sumWeight = document.createElement("div");
    sumWeight.classList.add("list-info");
    sumWeight.style.textAlign = "center";
    sumWeight.innerText = "Weight summary of all items: " + this.equipment.sumWeight()+ " / " + this.equipment.maxWeight ;
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
    let div = document.createElement("div");
    div.classList.add("list-element");
    div.style.display = "flex";
    div.style.textAlign = "center";
    div.style.alignItems = "center";
    let nameDiv = document.createElement("div");
    nameDiv.innerText = record.item.name;
    nameDiv.style.display = "inline-block";
    nameDiv.style.flex = 2;
    nameDiv.style.textAlign = "left";
    nameDiv.style.marginLeft = "5%";
    let weightDiv = document.createElement("div");
    weightDiv.innerText = record.getWeight();
    weightDiv.style.display = "inline-block"; 
    weightDiv.style.flex = 2;
    let quantityDiv = document.createElement("div");
    quantityDiv.innerText = record.quantity;
    quantityDiv.style.display = "inline-block"; 
    quantityDiv.style.flex = 2;
    let dropButton = document.createElement("button");
    dropButton.classList.add("button", "eq-button");
    dropButton.addEventListener("click", () => { this.game.player.dropItem(record); this.refresh() });
    dropButton.innerText = "Drop";
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
