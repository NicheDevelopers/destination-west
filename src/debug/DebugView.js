import KeyboardVisualizer from "./KeyboardVisualizer.js";
import { htmlCreate, numberPad } from "../global/utilities.js";
import Animation from "../core/Animation.js";
import time from "../global/time.js";

/**
 * Create and manage a group of HTML elements useful for debugging
 */
export default class DebugView {
  constructor(app) {
    this.app = app;
    this.keyVisualizer = new KeyboardVisualizer(app);

    this.div = htmlCreate({
      id: "dev-settings",
      classList: "nodisp",
      appendTo: document.body
    });
    
    this.fpsDisplay = htmlCreate({
      id: "fps-counter",
      innerText: "FPS",
      classList: "counter",
      onclick: () => {
	this.fpsSettings.classList.toggle("nodisp");
      },
      appendTo: this.div
    });

    this.fpsSimDisplay = htmlCreate({
      id: "fps-sim-counter",
      innerText: "sim FPS",
      classList: "counter",
      onclick: () => {
	this.fpsSettings.classList.toggle("nodisp");
      },
      appendTo: this.div
    });

    this.fpsSettings = htmlCreate({
      id: "fps-settings",
      innerText: "Developer Settings",
      classList: "nodisp",
      appendTo: this.div
    });

    this.closeFpsSettings = htmlCreate({
      id: "dev-settings-button",
      onclick: () => {
	this.fpsSettings.classList.add("nodisp");
      },
      appendTo: this.fpsSettings
    });
    
    this.timeScaleRow = htmlCreate({
      innerText: "Time scale: ",
      title: `A value by which time differences are multipled by` +
	` to simulate shorter or longer game update delays (simulate` +
	` a different time speed / scale)`,
      "font-size": "25px",
      appendTo: this.fpsSettings
    });
    this.timeScaleInput = htmlCreate({
      what: "input",
      id: "time-scale-input",
      type: "number",
      min: "0.1",
      max: "10.0",
      step: "0.1",
      value: "1.0",
      onchange: (i) => {
	time.speed = Number(i.target.value);
      },
      appendTo: this.timeScaleRow
    });

    this.simSettingsRow = htmlCreate({
      innerText: "Show simulated FPS: ",
      title: `Simulated FPS is calculated using the given timescale` +
	` and represents the refresh frequency as perceived from the` +
	` game loop perspective`,
      "font-size": "25px",
      appendTo: this.fpsSettings
    });
    
    this.showSimInput = htmlCreate({
      what: "input",
      type: "checkbox",
      checked: true,
      onchange: (i) => {
	if (i.target.checked)
	  this.fpsSimDisplay.classList.remove("nodisp");
	else this.fpsSimDisplay.classList.add("nodisp");
      },
      appendTo: this.simSettingsRow
    });
    
    this.fpsCounter = new Animation(this, '()updateFpsCounter', 5);

    this.setVisibility(this.app.debugging);
  }
  
  updateFpsCounter() {
    this.fpsDisplay.innerText = numberPad(time.getRealFps(), -1, 2);
    this.fpsSimDisplay.innerText = "sim:" + numberPad(time.getFps(), -1, 2).padStart(7, ' ');
  }

  setVisibility(visible) {
    this.keyVisualizer.setVisibility(visible);
    if (visible) {
      this.div.classList.remove("nodisp");
      return;
    }
    this.div.classList.add("nodisp");
  }
  isVisible() {
    return !this.div.classList.contains("nodisp");
  }
  
  update() {
    this.keyVisualizer.update();
    this.fpsCounter.next();
  }
}
