/*
  file: src/PauseMenu.js
  purpose: define the PauseMenu class to toggle on and off  provide a simple interface
           for keyboard event management
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Sebastian Nowak <https://gitlab.com/sebnow91>

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

import defaultKeybinds, { SpecialKey } from "@/global/defaultKeybinds.js";
import volumeMap from "@/audio/volumeMap.js";
import { State, stateManager } from "@/global/stateManager.js";
import { createElement, htmlCreate } from "@/utilities/dom.js";

class PauseMenu extends State {
  constructor(game) {
    super(true);
    // basic functions
    this.game = game;
    this.paused = false;
    this.customKeybinds = defaultKeybinds;
    this.customVolumeMap = volumeMap;
    // create buttons and divs inside pauseMenu
    this.pauseMenu = document.getElementById("pause-menu");
    const pauseMenuButtonsDiv = createElement(
      "div",
      null,
      null,
      ["pause-menu-divs"],
      {},
      "pause-menu-buttons-div",
      null,
    );
    const pauseMenuWantedDiv = createElement(
      "div",
      null,
      null,
      ["pause-menu-divs"],
      {},
      "pause-menu-wanted-div",
      null,
    );
    const pauseMenuWantedPoster = createElement(
      "div",
      null,
      null,
      [],
      {},
      "pause-menu-wanted-poster",
      null,
    );

    // settingsMenu
    this.settingsMenu = createElement("div", null, null, [], {}, "settings-menu", null);
    const exitSettingsButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      { position: "absolute", top: "3%", right: "3%" },
      null,
      "Return",
    );
    const settingsActionLabel = createElement(
      "div",
      null,
      null,
      [],
      { padding: "5px 0 10px 0" },
      null,
      null,
    );
    const settingsActions = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline-block" },
      null,
      "Actions:",
    );
    const settingsKeys = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline" },
      null,
      "Keys:",
    );
    const settingsSounds = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline-block" },
      null,
      "Sounds:",
    );
    const settingsVolumes = createElement(
      "div",
      null,
      null,
      [],
      { display: "inline" },
      null,
      "Volume:",
    );
    const settingsVolumeLabel = createElement(
      "div",
      null,
      null,
      [],
      { padding: "20px 0 10px 0" },
      null,
      null,
    );

    // exitMenu
    this.exitMenu = createElement("div", null, null, [], {}, "exit-menu", null);
    const exitMenuPrompt = createElement(
      "div",
      null,
      null,
      [],
      { padding: "0 0 35% 0" },
      null,
      "Do you really want to exit?",
    );
    // width of the prompt minus 2 widths of buttons (buttons are now 32% in width)
    const exitMenuConfirmationButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "exit-menu-button", "button"],
      { margin: "0 48% 0 0" },
      null,
      "Yes",
    );
    // this.exitMenuConfirmationButton = document.createElement("button");
    const exitMenuRefusalButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "exit-menu-button", "button"],
      {},
      null,
      "No",
    );
    const exitMenuDiv = document.createElement("div");

    //Pause menu main buttons
    const resumeButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-resume-button",
      "Resume",
    );
    const settingsButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-settings-button",
      "Settings",
    );
    const saveButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-save-button",
      "Save",
    );
    const exitButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-exit-button",
      "Exit",
    );

    // append created divs and buttons to corresponding parents
    this.pauseMenu.append(
      pauseMenuButtonsDiv,
      pauseMenuWantedDiv,
      this.settingsMenu,
      this.exitMenu,
    );
    pauseMenuWantedDiv.append(pauseMenuWantedPoster);
    pauseMenuButtonsDiv.append(resumeButton, settingsButton, saveButton, exitButton);
    this.settingsMenu.append(exitSettingsButton, settingsActionLabel);
    settingsActionLabel.append(settingsActions, settingsKeys);
    this.loadKeybinds();
    this.settingsMenu.append(settingsVolumeLabel);
    settingsVolumeLabel.append(settingsSounds, settingsVolumes);
    this.loadVolumeMap();
    this.exitMenu.append(exitMenuDiv);
    exitMenuDiv.append(exitMenuPrompt, exitMenuConfirmationButton, exitMenuRefusalButton);
    // buttons eventListeners
    resumeButton.addEventListener("click", () => {
      stateManager.toggleState(this);
    });
    settingsButton.addEventListener("click", () => {
      this.enterSettingsMenu();
    });
    exitSettingsButton.addEventListener("click", () => {
      this.exitSettingsMenu();
    });
    exitButton.addEventListener("click", () => {
      this.enterExitMenu();
    });
    exitMenuRefusalButton.addEventListener("click", () => {
      this.exitExitMenu();
    });
  }

  manageInputs(_keyman) {}

  update() {}

  startHook() {
    this.pauseMenu.style.display = "flex";
    this.paused = true;
    this.game.togglePause();
  }

  endHook() {
    this.pauseMenu.style.display = "none";
    this.exitMenu.style.display = "none";
    this.settingsMenu.style.display = "none";
    this.paused = false;
    this.game.togglePause();
  }

  // functions displaying settings
  loadKeybinds() {
    for (const category in this.customKeybinds) {
      this.customKeybinds[category].forEach(([key, action]) => {
        if (key instanceof SpecialKey) {
          // TODO - implement special key display in settings
          return;
        }
        let div = htmlCreate({
          classList: "keybind-container",
          appendTo: this.settingsMenu,
        });
        htmlCreate({ innerText: action + ":", appendTo: div });
        htmlCreate({
          tagName: "button",
          classList: "pause-menu-button settings-menu-button button",
          innerText: key.capitalized(),
          appendTo: htmlCreate({ classList: "button-container", appendTo: div }),
        });
      });
    }
  }

  // function loading volumeMap
  loadVolumeMap() {
    this.customVolumeMap.forEach((_value, key) => {
      let div = createElement(
        "div",
        null,
        null,
        [],
        { padding: "5px 0 10px 0", borderBottom: "2px solid brown" },
        null,
        null,
      );
      let volume = createElement(
        "div",
        null,
        null,
        [],
        { width: "50%", display: "inline-block" },
        null,
        key.charAt(0).toUpperCase() + key.slice(1) + ":",
      );
      let slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "1";
      slider.step = "0.1";
      div.append(volume);
      div.append(slider);
      this.settingsMenu.append(div);
    });
  }

  // functions toggling settings menu
  enterSettingsMenu() {
    this.settingsMenu.style.display = "flex";
  }
  exitSettingsMenu() {
    this.settingsMenu.style.display = "none";
  }

  //functions toggling exit menu
  enterExitMenu() {
    this.exitMenu.style.display = "flex";
  }
  exitExitMenu() {
    this.exitMenu.style.display = "none";
  }
}

export default PauseMenu;
