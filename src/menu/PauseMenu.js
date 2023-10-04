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

import defaultKeybinds from "../global/defaultKeybinds.js";
import volumeMap from "../audio/volumeMap.js";
import { State, stateManager } from "../global/stateManager.js"

class PauseMenu extends State {
  constructor(game) {
    super(true);
    // basic functions
    this.game = game;
    this.actions = ['Toggle Pause Menu'];
    this.paused = false;
    this.customKeybinds = defaultKeybinds;
    this.customVolumeMap = volumeMap;
    // create buttons and divs inside pauseMenu
    this.pauseMenu = document.getElementById("pause-menu");
    this.pauseMenuButtonsDiv = document.createElement("div");
    this.pauseMenuButtonsDiv.id = "pause-menu-buttons-div";
    this.pauseMenuButtonsDiv.classList.add("pause-menu-divs");
    this.pauseMenuWantedDiv = document.createElement("div");
    this.pauseMenuWantedDiv.id = "pause-menu-wanted-div";
    this.pauseMenuWantedDiv.classList.add("pause-menu-divs");
    this.pauseMenuWantedPoster = document.createElement("div");
    this.pauseMenuWantedPoster.id = "pause-menu-wanted-poster";

    // settingsMenu
    this.settingsMenu = document.createElement("div");
    this.settingsMenu.id = "settings-menu";
    this.exitSettingsButton = document.createElement("button");
    this.settingsActionLabel = document.createElement("div");
    this.settingsActions = document.createElement("div");
    this.settingsKeys = document.createElement("div");
    this.settingsSounds = document.createElement("div");
    this.settingsVolumes = document.createElement("div");
    this.settingsVolumeLabel = document.createElement("div");

    // settingsMenu settings
    // this.settingsActionLabel.style.border = "2px solid brown";
    // write a function creating labels for settings menu
    this.settingsActionLabel.style.padding = "5px 0 10px 0";
    this.exitSettingsButton.classList.add("pause-menu-buttons", "button");
    this.exitSettingsButton.innerHTML = "Return";
    this.exitSettingsButton.style.position = "absolute";
    this.exitSettingsButton.style.top = "5px";
    this.exitSettingsButton.style.right = "12px";
    this.settingsActions.innerHTML = "Actions:";
    this.settingsActions.style.width = "50%";
    this.settingsKeys.innerHTML = "Keys:";
    this.settingsActions.style.display = "inline-block";
    this.settingsKeys.style.display = "inline";
    this.settingsSounds.innerHTML = "Sounds:";
    this.settingsSounds.style.width = "50%";
    this.settingsSounds.style.display = "inline-block";
    this.settingsVolumes.innerHTML = "Volume:";
    this.settingsVolumes.style.display = "inline";
    this.settingsVolumeLabel.style.padding = "20px 0 10px 0";

    // exitMenu
    this.exitMenu = document.createElement("div");
    this.exitMenuConfirmationButton = document.createElement("button");
    this.exitMenuRefusalButton = document.createElement("button");
    this.exitMenuPrompt = document.createElement("div");
    this.exitMenuDiv = document.createElement("div");

    // add classes, id and other settings for buttons
    // exitMenu settings
    this.exitMenu.id = "exit-menu";
    this.exitMenuPrompt.innerHTML = "Do you really want to exit?";
    this.exitMenuPrompt.style.padding = "0 0 35% 0";
    this.exitMenuConfirmationButton.innerHTML = "Yes";
    this.exitMenuConfirmationButton.classList.add("pause-menu-buttons", "button");
    this.exitMenuConfirmationButton.style.margin = "0 calc(100% - 132px) 0 0"; // width of the propmt minus 2 widths of buttons
    this.exitMenuRefusalButton.innerHTML = "No";
    this.exitMenuRefusalButton.classList.add("pause-menu-buttons", "button");

    // resumeButton settings
    let createButton = (text) => {
      let b = document.createElement("button");
      b.id = 'pause-menu-' + text.toLowerCase() + '-button';
      b.classList.add('pause-menu-buttons', 'button');
      b.innerHTML = text;
      return b;
    };
    this.resumeButton = createButton("Resume");
    this.settingsButton = createButton("Settings");
    this.saveButton = createButton("Save");
    this.exitButton = createButton("Exit");

    // append created divs and buttons to corresponding parents
    this.pauseMenu.appendChild(this.pauseMenuButtonsDiv);
    this.pauseMenu.appendChild(this.pauseMenuWantedDiv);
    this.pauseMenu.appendChild(this.settingsMenu);
    this.pauseMenu.appendChild(this.exitMenu);
    this.pauseMenuWantedDiv.appendChild(this.pauseMenuWantedPoster);
    this.pauseMenuButtonsDiv.appendChild(this.resumeButton);
    this.pauseMenuButtonsDiv.appendChild(this.settingsButton);
    this.pauseMenuButtonsDiv.appendChild(this.saveButton);
    this.pauseMenuButtonsDiv.appendChild(this.exitButton);
    this.settingsMenu.appendChild(this.exitSettingsButton);
    this.settingsMenu.appendChild(this.settingsActionLabel);
    this.settingsActionLabel.appendChild(this.settingsActions);
    this.settingsActionLabel.appendChild(this.settingsKeys);
    this.loadKeybinds();
    this.settingsMenu.appendChild(this.settingsVolumeLabel);
    this.settingsVolumeLabel.appendChild(this.settingsSounds);
    this.settingsVolumeLabel.appendChild(this.settingsVolumes);
    this.loadVolumeMap();
    this.exitMenu.appendChild(this.exitMenuDiv);
    this.exitMenuDiv.appendChild(this.exitMenuPrompt);
    this.exitMenuDiv.appendChild(this.exitMenuConfirmationButton);
    this.exitMenuDiv.appendChild(this.exitMenuRefusalButton);

    // buttons eventListeners
    this.resumeButton.addEventListener("click", () => { stateManager.toggleState(this) });
    this.settingsButton.addEventListener("click", () => { this.enterSettingsMenu() });
    this.exitSettingsButton.addEventListener("click", () => { this.exitSettingsMenu() });
    this.exitButton.addEventListener("click", () => { this.enterExitMenu() });
    this.exitMenuRefusalButton.addEventListener("click", () => { this.exitExitMenu() });
  }

  update() {
    this.game.app.manageRequest(
      'Toggle Pause Menu',
      () => stateManager.toggleState(this),
      { once: true }
    );
  }

  startHook() {
    this.pauseMenu.style.display = 'flex';
    this.paused = true;
    this.game.togglePause();
  }

  endHook() {
    this.pauseMenu.style.display = 'none';
    this.exitMenu.style.display = 'none';
    this.settingsMenu.style.display = 'none';
    this.paused = false;
    this.game.togglePause();
  }

  // functions displaying settings
  loadKeybinds() {
    this.customKeybinds.forEach(e => {
      let actionName = e[1];
      let keyName = e[0];
      let div = document.createElement("div");
      div.style.borderBottom = "2px solid brown";
      div.style.padding = "5px 0 10px 0";
      let action = document.createElement("div");
      action.style.width = "50%";
      action.style.display = "inline-block";
      action.innerHTML = actionName + ":";
      div.appendChild(action);
      let key = document.createElement("button");
      key.innerHTML = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      key.classList.add("pause-menu-buttons", "button");
      div.appendChild(key);
      this.settingsMenu.appendChild(div);
    });
  }

  // function loading volumeMap
  loadVolumeMap() {
    this.customVolumeMap.forEach((value, key) => {
      let div = document.createElement("div");
      div.style.padding = "5px 0 10px 0";
      div.style.borderBottom = "2px solid brown";
      let volume = document.createElement("div");
      volume.style.width = "50%";
      volume.style.display = "inline-block";
      volume.innerHTML = key.charAt(0).toUpperCase() + key.slice(1) + ":";
      let slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "1";
      slider.step = "0.1";
      div.appendChild(volume);
      div.append(slider);
      this.settingsMenu.appendChild(div);
    })
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
    this.exitMenu.style.display = 'flex';
  }
  exitExitMenu() {
    this.exitMenu.style.display = 'none';
  }
}

export default PauseMenu;
