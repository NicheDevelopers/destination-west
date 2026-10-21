import KeyboardVisualizer from "./KeyboardVisualizer";
import { htmlCreate } from "@/lib/dom";
import { numberPad } from "@/lib/utilities";
import time from "@/engine/time";

const FPS_COUNTER_INTERVAL_MS = 200;

/**
 * Create and manage a group of HTML elements useful for debugging
 */
export default class DebugView {
  keyVisualizer: KeyboardVisualizer;
  div: HTMLElement;
  fpsDisplay: HTMLElement;
  fpsSimDisplay: HTMLElement;
  fpsSettings: HTMLElement;
  closeFpsSettings: HTMLElement;
  timeScaleRow: HTMLElement;
  timeScaleInput: HTMLElement;
  simSettingsRow: HTMLElement;
  showSimInput: HTMLElement;
  gameSeedRow: HTMLElement;
  private lastFpsCounterUpdate = 0;

  constructor(visible: boolean) {
    this.keyVisualizer = new KeyboardVisualizer();

    this.div = htmlCreate({
      id: "dev-settings",
      classList: "nodisp",
      appendTo: document.body,
    });

    this.fpsDisplay = htmlCreate({
      id: "fps-counter",
      innerText: "FPS",
      classList: "counter",
      onclick: () => {
        this.fpsSettings.classList.toggle("nodisp");
      },
      appendTo: this.div,
    });

    this.fpsSimDisplay = htmlCreate({
      id: "fps-sim-counter",
      innerText: "sim FPS",
      classList: "counter",
      onclick: () => {
        this.fpsSettings.classList.toggle("nodisp");
      },
      appendTo: this.div,
    });

    this.fpsSettings = htmlCreate({
      id: "fps-settings",
      innerText: "Developer Settings",
      classList: "nodisp",
      appendTo: this.div,
    });

    this.closeFpsSettings = htmlCreate({
      id: "dev-settings-button",
      onclick: () => {
        this.fpsSettings.classList.add("nodisp");
      },
      appendTo: this.fpsSettings,
    });

    this.timeScaleRow = htmlCreate({
      innerText: "Time scale: ",
      title:
        `A value by which time differences are multipled by` +
        ` to simulate shorter or longer game update delays (simulate` +
        ` a different time speed / scale)`,
      "font-size": "25px",
      appendTo: this.fpsSettings,
    });
    this.timeScaleInput = htmlCreate({
      tagName: "input",
      id: "time-scale-input",
      type: "number",
      min: "0.1",
      max: "10.0",
      step: "0.1",
      value: "1.0",
      onchange: (event: Event) => {
        time.speed = Number((event.target as HTMLInputElement).value);
      },
      appendTo: this.timeScaleRow,
    });

    this.simSettingsRow = htmlCreate({
      innerText: "Show simulated FPS: ",
      title:
        `Simulated FPS is calculated using the given timescale` +
        ` and represents the refresh frequency as perceived from the` +
        ` game loop perspective`,
      "font-size": "25px",
      appendTo: this.fpsSettings,
    });

    this.showSimInput = htmlCreate({
      tagName: "input",
      type: "checkbox",
      checked: true,
      onchange: (event: Event) => {
        if ((event.target as HTMLInputElement).checked)
          this.fpsSimDisplay.classList.remove("nodisp");
        else this.fpsSimDisplay.classList.add("nodisp");
      },
      appendTo: this.simSettingsRow,
    });

    this.gameSeedRow = htmlCreate({
      innerText: "Game seed: ",
      title: `The seed used to generate the world`,
      "font-size": "25px",
      appendTo: this.fpsSettings,
    });

    this.setVisibility(visible);
  }

  showSeed(seed: number): void {
    this.gameSeedRow.innerText = `Game seed: ${seed}`;
  }

  private updateFpsCounter(): void {
    this.fpsDisplay.innerText = numberPad(time.getRealFps(), -1, 2);
    this.fpsSimDisplay.innerText = "sim:" + numberPad(time.getFps(), -1, 2).padStart(7, " ");
  }

  setVisibility(visible: boolean): void {
    this.keyVisualizer.setVisibility(visible);
    if (visible) {
      this.div.classList.remove("nodisp");
      return;
    }
    this.div.classList.add("nodisp");
  }
  isVisible(): boolean {
    return !this.div.classList.contains("nodisp");
  }

  update(): void {
    this.keyVisualizer.update();
    if (time.now - this.lastFpsCounterUpdate >= FPS_COUNTER_INTERVAL_MS) {
      this.lastFpsCounterUpdate = time.now;
      this.updateFpsCounter();
    }
  }
}
