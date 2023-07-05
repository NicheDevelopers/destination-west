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

import tileSize from "./global/tileSize.js";

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

    // /**
    //  * A 2d array of div elements representing the equipment grid
    //  */
    // this.itemDivs = [];
    // /**
    //  * A 2d array of image elements representing the equipment grid
    //  */
    // this.itemImages = [];
    
    // for (let i=0; i<equipment.items.length; i++){
    //   this.itemDivs.push(new Array(equipment.items.length));
    //   this.itemImages.push(new Array(equipment.items.length));
    // }

    // let f1 = (e) => this.dragStart(e);
    // let f2 = (e) => this.dragEnd(e);
    // let f3 = (e) => this.dragDrop(e);
    // this.dragStartWrapper = f1;
    // this.dragEndWrapper = f2;
    // this.dragDropWrapper = f3;
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
    sortDiv.classList.add("list-element");
    sortDiv.style.border = 'none';
    sortDiv.style.borderBottom = '2px solid black';
    let buttonSortUp = document.createElement("button");
    buttonSortUp.classList.add("button", "eq-button");
    buttonSortUp.addEventListener("click", () => { this.equipment.sortByWeight(true); this.refresh() });
    buttonSortUp.innerText = "Heavy";
    this.divEqList.appendChild(buttonSortUp);
    let buttonSortDown = document.createElement("button");
    buttonSortDown.classList.add("button", "eq-button");
    buttonSortDown.addEventListener("click", () => { this.equipment.sortByWeight(false); this.refresh() });
    buttonSortDown.innerText = "Light";
    this.divEqList.appendChild(buttonSortDown);
    sortDiv.style.textAlign = "center";
    sortDiv.innerText = "Sort by weight from";
    this.divEqList.appendChild(sortDiv);
    for (let record of this.equipment.records) {
      this.divEqList.appendChild(this.recordToListElement(record));
    }
    let sumWeight = document.createElement("div");
    sumWeight.classList.add("list-element");
    sumWeight.style.textAlign = "center";
    sumWeight.innerText = "Weight summary of all items: " + this.equipment.sumWeight();
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
    let dropButton = document.createElement("button");
    dropButton.classList.add("button", "eq-button");
    dropButton.addEventListener("click", () => { this.equipment.dropFrom(record); this.refresh() });
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

  dragStart(event) {
    let x = event.target.pos.x;
    let y = event.target.pos.y;
    /* We need to use setTimeout here in order to delay hiding
       the image. This enables the dataTransfer to generate
       a drag image from the element that we are dragging (the
       scaled-up image of an item). If we were to set the drag
       image explicitly its width and height attributes would
       be ignored, resulting in an image which is too small.
       */
    setTimeout(() => { this.itemImages[x][y].style.display = 'none' }, 0);
  }

  dragEnd(event) {
    let x = event.target.pos.x;
    let y = event.target.pos.y;
    this.itemImages[x][y].style.display = 'block';
    if (dropped) {
      removeImage(this.itemDivs[x][y], this);
    }
    dropped = false;
  }

  dragOver(event) {
    if (event.target.nodeName === 'DIV')
      event.preventDefault();
  }

  dragEnter(event) {
    event.preventDefault();
    event.target.classList.add('hovered');
  }

  dragLeave(event) {
    event.preventDefault();
    event.target.classList.remove('hovered');
  }

  dragDrop(event) {
    event.preventDefault();
    let div = event.target;
    div.classList.remove('hovered');
    addImage(div, this);
    dropped = true;
  }
}

function preventDefault(e) {
  e.preventDefault ? e.preventDefault() : e.returnValue = false;
}

function addImage(div, display) {
  div.removeEventListener('drop', display.dragDropWrapper);
  let img = display.itemImages[div.pos.x][div.pos.y];
  img.className = 'draggable';
  img.setAttribute('draggable', 'true');
  img.addEventListener('dragstart', display.dragStartWrapper);
  img.addEventListener('dragend', display.dragEndWrapper);
  img.removeEventListener('mousedown', preventDefault);
  img.src = 'img/sand.png';
  img.style.display = 'block';
}

function removeImage(div, display) {
  div.addEventListener('drop', display.dragDropWrapper);
  let img = display.itemImages[div.pos.x][div.pos.y];
  img.src = '';
  img.style.display = 'none';
  img.setAttribute('draggable', 'false');
  img.addEventListener('mousedown', preventDefault);
  img.removeEventListener('dragstart', display.dragStartWrapper);
  img.removeEventListener('dragend', display.dragEndWrapper);
}


export default EquipmentDisplay;
