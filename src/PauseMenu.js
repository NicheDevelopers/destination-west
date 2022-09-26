/*
  file: src/PauseMenu.js
  purpose: define the PauseMenu class to toggle on and off  provide a simple interface
           for keyboard event management
  author: Artur Gulik <https://gitlab.com/ArturGulik>
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
    this.div.style.display = 'block';
    this.paused = true;
    this.game.togglePause();
  }
}

export default PauseMenu;
