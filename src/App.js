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
import { Browser, ctx } from "./core/Browser.js";
import KeyMan from "./core/KeyboardManager.js";
import AudioPlayer from "./audio/AudioPlayer.js";
import DebugView from "./debug/DebugView.js";
import Animation from "./core/Animation.js";
import Game from "./game/Game.js";
import { stateManager } from "./global/stateManager.js"
import { notifier } from "./global/notifier.js";

class App {
  constructor(keybinds = []) {
    this.game = new Game(this, () => {
      stateManager.pushState(this.game);
    });
    
    this.animationFrameID = null;
    this.userFunctionsMap = new Map();

    this.debugging = false;

    this.browser = new Browser(this);
    this.audioPlayer = new AudioPlayer();

    /* Keyman has to load keybinds AFTER functions are written to
       userFunctionsMap. This means it has to be instantinated AFTER
       every function provider */

    this.keyman = new KeyMan(this, keybinds);

    this.debugView = new DebugView(this);
    
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

  update() {
    this.manageRequest(
      'Toggle Debug Mode',
      () => {
	this.debugging = !this.debugging;
	this.debugView.setVisibility(this.debugging);
      }, { once: true });
  }

  loop() {
    this.animationFrameID =
      window.requestAnimationFrame(() => this.loop());
    try {
      time.update();

      this.update();
      this.debugView.update();
      this.browser.update();
      
      stateManager.updateStates();
      notifier.update();
    }
    catch(e) {
      window.cancelAnimationFrame(this.animationFrameID);
      throw e;
    }
  }

}

export default App;
