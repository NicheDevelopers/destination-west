import tileSize from "./global/tileSize.js";

import { createDiv } from "./global/utilities.js";
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

let dropped = false;

class EquipmentDisplay {
  constructor(game, equipment, isPlayer) {
    this.equipment = equipment;
    this.game = game;
    this.actions = ['Toggle Equipment Display'];
    this.div = document.createElement("div");
    let gameContainer = document.querySelector("#game-container");
    this.div.id = "equipment";
    this.div.style.position = 'absolute';
    this.div.style.zIndex = 1; // make it work with changes in map display
    this.div.classList.add("window");
    this.div.style.backgroundColor = 'rgb(121,70,20)';
    this.divEq = document.createElement("div");
    this.divEq.style.width = `${(tileSize + 2) * equipment.width * 2}px`;
    this.divEq.style.height = `${(tileSize + 2) * equipment.height * 2}px`;
    this.divEq.style.display = "grid";
    this.divEq.style.gridTemplateColumns = "repeat(7, 68px)";

    /**
     * A 2d array of div elements representing the equipment grid
     */
    this.itemDivs = [];
    /**
     * A 2d array of image elements representing the equipment grid
     */
    this.itemImages = [];

    for (let i = 0; i < equipment.width; i++) {
      this.itemDivs.push(new Array(equipment.height));
      this.itemImages.push(new Array(equipment.height));
    }

    let f1 = (e) => this.dragStart(e);
    let f2 = (e) => this.dragEnd(e);
    let f3 = (e) => this.dragDrop(e);
    this.dragStartWrapper = f1;
    this.dragEndWrapper = f2;
    this.dragDropWrapper = f3;

    for (let j = 0; j < equipment.height; j++) {
      for (let i = 0; i < equipment.width; i++) {
        let itemDiv = createDiv(64, 64);
        let img = new Image(64, 64);

        this.itemDivs[i][j] = itemDiv;
        this.itemImages[i][j] = img;

        itemDiv.classList.add('unselectable');
        itemDiv.pos = { x: i, y: j };
        itemDiv.addEventListener('dragover', (e) => this.dragOver(e));
        itemDiv.addEventListener('dragenter', (e) => this.dragEnter(e));
        itemDiv.addEventListener('dragleave', (e) => this.dragLeave(e));
        itemDiv.style.border = '2px solid black';

        img.pos = { x: i, y: j };
        img.classList.add('unselectable');
        addImage(itemDiv, this);
        if (!this.equipment.items[i][j]) {
          removeImage(itemDiv, this);
        }

        itemDiv.appendChild(img);
        this.divEq.appendChild(itemDiv);
      }
    }

    this.isDisplayed = false;
    if (!isPlayer) {
      this.div.appendChild(this.divEq);
      gameContainer.appendChild(this.div);
      return;
    }
    this.divPlayerPanel = document.createElement("div");
    this.divPlayerPanel.style.backgroundColor = "rgb(121,70,20)";
    // PlayerPanel width can be changed, for now it is 4 tiles
    this.divPlayerPanel.style.width = `${tileSize * 8}px`;
    this.divPlayerPanel.style.height = `${((tileSize + 2) * equipment.height - 2) * 2}px`;
    this.divPlayerPanel.style.border = "2px solid black";
    this.div.appendChild(this.divEq);
    this.div.appendChild(this.divPlayerPanel);
    gameContainer.appendChild(this.div);
  }

  toggleDisplay() {
    if (this.isDisplayed) {
      this.div.style.display = "none";
      this.isDisplayed = false;
      return;
    }
    this.div.style.display = "flex";
    this.isDisplayed = true;
  }

  update() {
    this.game.app.manageRequest(
      'Toggle Equipment Display',
      () => this.toggleDisplay(),
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
};

export default EquipmentDisplay;
