/*
  file: src/App.js
  purpose: define the App class - the one highest in class hierarchy
  authors: Artur Gulik <https://gitlab.com/ArturGulik>
           Michał Miłek <https://gitlab.com/mmilek>
  
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

import time from "./global/time.js";
import Browser from "./Browser.js";
import KeyMan from "./KeyboardManager.js";
import AudioPlayer from "./AudioPlayer.js";
import KeyboardVisualizer from "./KeyboardVisualizer.js";
import Animation from "./Animation.js";
import StateManager from "./StateManager.js";
import Game from "./Game.js";

class App {
  constructor(keybinds = []) {
    this.game = new Game(this);
    this.stateManager = new StateManager();
    this.userFunctionsMap = new Map();

    this.debugging = false;

    this.browser = new Browser(this);
    this.audioPlayer = new AudioPlayer();

    this.fps = 0;
    this.testFPSCounter = new Animation(this, '()updateFPSCounter', 5);

    /* Keyman has to load keybinds AFTER functions are written to
       userFunctionsMap. This means it has to be instantinated AFTER
       every function provider */

    this.keyman = new KeyMan(this, keybinds);

    this.keyVisualizer = new KeyboardVisualizer(this);

    let self = this;
    document.addEventListener("keydown", (event) => {
      self.keyman.manageKeydown(event);
    });
    document.addEventListener("keyup", (event) => {
      self.keyman.manageKeyup(event);
    });
  }

  isActionRequested(action) {
    return this.keyman.isActionRequested(action);
  }

  manageRequest(...args) {
    this.keyman.manageRequest(...args);
  }

  debug() {
    this.game.debug();
  }

  loop() {
    window.requestAnimationFrame(() => this.loop());
    time.update();

    this.keyVisualizer.update();
    this.browser.update();
    this.testFPSCounter.next();

    this.game.loop();

    if (this.debugging)
      this.debug();
  }

  updateFPSCounter() {
    this.fps = time.getFPS();
    this.fps = ((this.fps > 99) ? "" : " ") + this.fps;
  }
}

export default App;
