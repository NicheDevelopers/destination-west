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

class PauseMenu {
  constructor(game){
    this.game = game;
    this.div = document.getElementById("pause-menu");
    this.paused = false;
    this.registerActions();
    this.resumeButton = document.createElement("button");
    this.resumeButton.id = "pause-menu-resume-button";
    this.resumeButton.classList.add("pause-menu-buttons");
    this.resumeButton.innerHTML = "Resume";
    this.settingsButton = document.createElement("button");
    this.settingsButton.id = "pause-menu-settings-button";
    this.settingsButton.classList.add("pause-menu-buttons");
    this.settingsButton.innerHTML = "Settings";
    this.saveButton = document.createElement("button");
    this.saveButton.id = "pause-menu-save-button";
    this.saveButton.classList.add("pause-menu-buttons");
    this.saveButton.innerHTML = "Save";
    this.exitButton = document.createElement("button");
    this.exitButton.id = "pause-menu-exit-button";
    this.exitButton.classList.add("pause-menu-buttons");
    this.exitButton.innerHTML = "Exit";
    this.div.appendChild(this.resumeButton);
    this.div.appendChild(this.settingsButton);
    this.div.appendChild(this.saveButton);
    this.div.appendChild(this.exitButton);
  }
  registerActions() {
    this.game.registerAction('Toggle Pause Menu');
  }
  update(){
    this.game.manageRequest(
      'Toggle Pause Menu',
      () => this.togglePauseMenuFunc(),
      {once: true}
    );
  }
  togglePauseMenuFunc() {
    if (this.paused){
      this.div.style.display  = 'none';
      this.paused = false;
      this.game.togglePause();
      return;
    }
    this.div.style.display = 'flex';
    this.paused = true;
    this.game.togglePause();
  }
}

export default PauseMenu;
