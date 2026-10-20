/*
  file: src/Designer.js
  purpose: create an interface for designing colored sprites
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Kamil Małecki <https://gitlab.com/gaussx>
    
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

import ColoredSprite from "../Sprite/ColoredSprite.js";
import { createElement, createCanvas } from "../utilities/dom.js";
import { hexToRgb, rgbToHex } from "../utilities/color.js";
import { State } from "../global/stateManager.js";

/**
 * Create an interface for designing colored sprites
 */

class Designer extends State {
  constructor(game) {
    super();
    this.display = false;
    let div = createElement(
      "div",
      650,
      400,
      ["window", "window-background"],
      { display: "none", zIndex: "4" },
      null,
      null,
    );

    let previewDiv = createElement(
      "div",
      300,
      400,
      ["window", "window-background"],
      { border: "none", display: "flex", background: "white" },
      null,
      null,
    );

    let preview;
    ({ canvas: preview, context: this.previewCtx } = createCanvas(32));
    preview.style.transform = "scale(8)";

    previewDiv.appendChild(preview);
    div.appendChild(previewDiv);

    this.menus = {
      mainMenu: createMenu(this, [
        { name: "head", action: "headMenu" },
        { name: "torso", action: "torsoMenu" },
        { name: "legs", action: "legsMenu" },
      ]),
      headMenu: createMenu(this, [{ name: "back", action: "mainMenu" }, { name: "head" }]),
      torsoMenu: createMenu(this, [
        { name: "back", action: "mainMenu" },
        { name: "torso", action: "jacket" },
      ]),
      legsMenu: createMenu(this, [
        { name: "back", action: "mainMenu" },
        { name: "legs", action: "pants" },
      ]),
    };

    let coloringDiv = createElement("div", 250, 400);
    this.colorSliders = [0, 0, 0]; //R, G, B
    for (let i = 0; i < 3; ++i) {
      this.colorSliders[i] = document.createElement("input");
      this.colorSliders[i].type = "range";
      this.colorSliders[i].min = 0;
      this.colorSliders[i].max = 255;
      this.colorSliders[i].value = 100;
      coloringDiv.appendChild(this.colorSliders[i]);
    }

    this.input = document.createElement("input");
    this.input.type = "text";
    coloringDiv.appendChild(this.input);
    for (const menu in this.menus) {
      div.appendChild(this.menus[menu]);
    }
    this.changeMenu("mainMenu");
    for (let i = 0; i < 3; ++i) {
      this.colorSliders[i].style.display = "none";
    }
    this.input.style.display = "none";

    div.appendChild(coloringDiv);

    const gameContainer = document.querySelector("#game-container");
    if (!gameContainer) throw new Error("Missing #game-container element");
    this.div = gameContainer.appendChild(div);

    this.clothes = {
      pants: new ColoredSprite("pants", () => this.update()),
      jacket: new ColoredSprite("jacket", () => this.update()),
    };

    for (let i = 0; i < 3; ++i) {
      this.colorSliders[i].addEventListener("change", () => {
        let rgbValues = { r: 0, g: 0, b: 0 };
        rgbValues.r = parseInt(this.colorSliders[0].value);
        rgbValues.g = parseInt(this.colorSliders[1].value);
        rgbValues.b = parseInt(this.colorSliders[2].value);
        this.input.value = rgbToHex(rgbValues);
        this.clothes[this.currentElement].setColor(rgbToHex(rgbValues));
      });
    }

    this.input.addEventListener("change", () => {
      let newColors = hexToRgb(this.input.value);
      console.log("Inside eventlistener: ", newColors);
      this.colorSliders[0].value = newColors.r.toString();
      this.colorSliders[1].value = newColors.g.toString();
      this.colorSliders[2].value = newColors.b.toString();
      this.clothes[this.currentElement].setColor(this.input.value);
    });

    this.currentElement = "jacket";
    this.input.value = this.clothes["jacket"].color;

    this.game = game;
  }

  changeMenu(menuName) {
    if (this.currentMenu) this.currentMenu.style.display = "none";
    for (let i = 0; i < 3; ++i) {
      this.colorSliders[i].style.display = "none";
    }
    this.input.style.display = "none";
    this.currentMenu = this.menus[menuName];
    this.currentMenu.style.display = "grid";
  }

  startHook() {
    this.div.style.display = "flex";
  }

  endHook() {
    this.div.style.display = "none";
  }

  manageInputs(_keyman) {}

  update() {
    for (const clothing in this.clothes) {
      this.clothes[clothing].draw(0, 0, this.previewCtx);
    }
  }
}

function newMenuButton(name, designer, setName = name) {
  let button = document.createElement("img");
  button.classList.add("designer");
  button.classList.add("button");
  button.src = "img/" + name + ".png";
  button.style.display = "block";
  button.style.border = "2px solid black";

  if (setName.endsWith("Menu")) {
    button.onclick = () => {
      designer.changeMenu(setName);
    };
    return button;
  }
  button.onclick = () => {
    designer.currentElement = setName;
    designer.input.value = designer.clothes[setName].color;
    designer.input.style.display = "block";
    let rgbColor = hexToRgb(designer.input.value);
    designer.colorSliders[0].value = rgbColor.r.toString();
    designer.colorSliders[1].value = rgbColor.g.toString();
    designer.colorSliders[2].value = rgbColor.b.toString();
    for (let i = 0; i < 3; ++i) {
      designer.colorSliders[i].style.display = "block";
    }
  };
  return button;
}

function createMenu(designer, buttons) {
  let setDiv = createElement(
    "div",
    100,
    400,
    [],
    {
      borderRight: "1px solid black",
      borderLeft: "1px solid black",
      display: "none", // to show - set to 'grid'
      alignItems: "center",
      justifyItems: "center",
    },
    null,
    null,
  );
  buttons.forEach((button) => {
    setDiv.appendChild(newMenuButton(button.name, designer, button.action ?? button.name));
  });

  return setDiv;
}

export default Designer;
