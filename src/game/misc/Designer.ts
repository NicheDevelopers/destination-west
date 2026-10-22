import ColoredSprite from "@/engine/Sprite/ColoredSprite";
import { createElement, createCanvas } from "@/lib/dom";
import { hexToRgb, rgbToHex } from "@/lib/color";
import { State } from "@/engine/state/State";
import { gameContainer } from "@/engine/Browser";
import type Game from "@/game/Game";

type MenuName = "mainMenu" | "headMenu" | "torsoMenu" | "legsMenu";
type ClothingName = "pants" | "jacket";

interface MenuButton {
  image: string;
  opensMenu?: MenuName;
  colors?: ClothingName;
}

/**
 * Create an interface for designing colored sprites
 */

class Designer extends State {
  readonly game: Game;
  private div: HTMLDivElement;
  private previewCtx: CanvasRenderingContext2D;
  private menus: Record<MenuName, HTMLDivElement>;
  private currentMenu: HTMLDivElement | null = null;
  private colorSliders: HTMLInputElement[] = []; //R, G, B
  private input: HTMLInputElement;
  private clothes: Record<ClothingName, ColoredSprite>;
  private currentElement: ClothingName = "jacket";

  constructor(game: Designer["game"]) {
    super();
    this.game = game;
    this.div = createElement(
      "div",
      650,
      400,
      ["window", "window-background"],
      { display: "none", zIndex: "4" },
      null,
      null,
    );

    const previewDiv = createElement(
      "div",
      300,
      400,
      ["window", "window-background"],
      { border: "none", display: "flex", background: "white" },
      null,
      null,
    );

    const { canvas: preview, context: previewCtx } = createCanvas(32);
    this.previewCtx = previewCtx;
    preview.style.transform = "scale(8)";

    previewDiv.appendChild(preview);
    this.div.appendChild(previewDiv);

    this.menus = {
      mainMenu: this.createMenu([
        { image: "head", opensMenu: "headMenu" },
        { image: "torso", opensMenu: "torsoMenu" },
        { image: "legs", opensMenu: "legsMenu" },
      ]),
      headMenu: this.createMenu([{ image: "back", opensMenu: "mainMenu" }, { image: "head" }]),
      torsoMenu: this.createMenu([
        { image: "back", opensMenu: "mainMenu" },
        { image: "torso", colors: "jacket" },
      ]),
      legsMenu: this.createMenu([
        { image: "back", opensMenu: "mainMenu" },
        { image: "legs", colors: "pants" },
      ]),
    };

    const coloringDiv = createElement("div", 250, 400);
    for (let i = 0; i < 3; ++i) {
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "255";
      slider.value = "100";
      slider.addEventListener("change", () => this.applySliderColor());
      coloringDiv.appendChild(slider);
      this.colorSliders.push(slider);
    }

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.addEventListener("change", () => this.applyInputColor());
    coloringDiv.appendChild(this.input);

    for (const menu of Object.values(this.menus)) {
      this.div.appendChild(menu);
    }
    this.changeMenu("mainMenu");

    this.div.appendChild(coloringDiv);
    gameContainer.appendChild(this.div);

    this.clothes = {
      pants: new ColoredSprite("pants", () => this.update()),
      jacket: new ColoredSprite("jacket", () => this.update()),
    };

    this.input.value = this.clothes[this.currentElement].color;
  }

  private createMenu(buttons: MenuButton[]): HTMLDivElement {
    const menuDiv = createElement(
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
    for (const button of buttons) {
      menuDiv.appendChild(this.createMenuButton(button));
    }
    return menuDiv;
  }

  private createMenuButton({ image, opensMenu, colors }: MenuButton): HTMLImageElement {
    const button = document.createElement("img");
    button.classList.add("designer");
    button.classList.add("button");
    button.src = "img/" + image + ".png";
    button.style.display = "block";
    button.style.border = "2px solid black";

    if (opensMenu) {
      button.onclick = () => this.changeMenu(opensMenu);
      return button;
    }
    if (colors) {
      button.onclick = () => this.selectClothing(colors);
    }
    return button;
  }

  private changeMenu(menuName: MenuName): void {
    if (this.currentMenu) this.currentMenu.style.display = "none";
    this.setColorInputsDisplay("none");
    this.currentMenu = this.menus[menuName];
    this.currentMenu.style.display = "grid";
  }

  private selectClothing(clothing: ClothingName): void {
    this.currentElement = clothing;
    this.input.value = this.clothes[clothing].color;
    this.setSliders(this.input.value);
    this.setColorInputsDisplay("block");
  }

  private setColorInputsDisplay(display: "block" | "none"): void {
    for (const slider of this.colorSliders) {
      slider.style.display = display;
    }
    this.input.style.display = display;
  }

  private setSliders(colorHex: string): void {
    const rgb = hexToRgb(colorHex);
    this.colorSliders[0].value = rgb.r.toString();
    this.colorSliders[1].value = rgb.g.toString();
    this.colorSliders[2].value = rgb.b.toString();
  }

  private applySliderColor(): void {
    const colorHex = rgbToHex({
      r: parseInt(this.colorSliders[0].value),
      g: parseInt(this.colorSliders[1].value),
      b: parseInt(this.colorSliders[2].value),
    });
    this.input.value = colorHex;
    this.clothes[this.currentElement].setColor(colorHex);
  }

  private applyInputColor(): void {
    this.setSliders(this.input.value);
    this.clothes[this.currentElement].setColor(this.input.value);
  }

  override startHook(): void {
    this.div.style.display = "flex";
  }

  override endHook(): void {
    this.div.style.display = "none";
  }

  update(): void {
    for (const clothing of Object.values(this.clothes)) {
      clothing.draw(0, 0, this.previewCtx);
    }
  }
}

export default Designer;
