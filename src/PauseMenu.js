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

import defaultKeybinds from "./global/defaultKeybinds.js";
import volumeMap from "./static/volumeMap.js";

class PauseMenu {
  constructor(game){
    // basic functions
    this.game = game;
    this.registerActions();
    this.paused = false;
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

    // settingsMenu settings
    this.exitSettingsButton.classList.add("pause-menu-buttons", "button");
    this.exitSettingsButton.innerHTML = "Return";
    this.exitSettingsButton.style.position = "absolute";
    this.exitSettingsButton.style.top = "5px";
    this.exitSettingsButton.style.right = "5px";

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
    this.exitMenu.appendChild(this.exitMenuDiv);
    this.exitMenuDiv.appendChild(this.exitMenuPrompt);
    this.exitMenuDiv.appendChild(this.exitMenuConfirmationButton);
    this.exitMenuDiv.appendChild(this.exitMenuRefusalButton);

    // buttons eventListeners
    this.resumeButton.addEventListener("click", () => {this.togglePauseMenu()});
    this.settingsButton.addEventListener("click", () => {this.enterSettingsMenu()});
    this.exitSettingsButton.addEventListener("click", () => {this.exitSettingsMenu()});
    this.exitButton.addEventListener("click", () => {this.enterExitMenu()});
    this.exitMenuRefusalButton.addEventListener("click", () => {this.exitExitMenu()});
  }
  // functions needed for keyboardManager
  registerActions() {
    this.game.registerAction('Toggle Pause Menu');
  }
  update(){
    this.game.manageRequest(
      'Toggle Pause Menu',
      () => this.togglePauseMenu(),
      {once: true}
    );
  }

  // function passed to the keyboardManager
  togglePauseMenu() {
    if (this.paused){
      this.pauseMenu.style.display  = 'none';
      this.exitMenu.style.display = 'none';
      this.settingsMenu.style.display = 'none';
      this.paused = false;
      this.game.togglePause();
      return;
    }
    this.pauseMenu.style.display = 'flex';
    this.paused = true;
    this.game.togglePause();
  }

  // functions displaying settings

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
