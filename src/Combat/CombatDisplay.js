/*
  file: src/Combat/Combat.js
  purpose: Define the Combat class for handling fights, shootouts
  author: Michał Miłek <https://gitlab.com/mmilek>
  
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

import { stateManager, State } from "../global/stateManager.js"

class CombatDisplay extends State {
  constructor(game) {
    super(true);
    this.game = game;
    this.combat = null;
    this.actions = ['Toggle Combat Display'];
    this.div = document.createElement("div");
    let gameContainer = document.querySelector("#game-container");
    this.div.id = "combat";
    gameContainer.appendChild(this.div);
    
    this.visualizerDiv = document.createElement('div');
    this.menuDiv = document.createElement('div');
    
    this.visualizerDiv.id = 'combat-visualizer';
    this.menuDiv.id = 'combat-menu';

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'combat-canvas';
    this.visualizerDiv.appendChild(this.canvas);
    
    this.div.append(this.visualizerDiv, this.menuDiv);

    this.slaves = [
      this.game.pauseMenu
    ]
  }

  loadCombat(combat) {
    //temporary
    this.combat = combat
  }

  startHook() {
    this.div.style.display = "flex";
  }

  endHook() {
    this.div.style.display = "none";
  }

  update() {
    this.game.app.manageRequest(
      'Toggle Combat Display',
      () => stateManager.toggleState(this),
      { once: true }
    );
  }
}

export default CombatDisplay;
