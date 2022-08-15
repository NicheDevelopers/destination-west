/*
  file: src/Browser.js
  purpose: define the Browser class for dealing with browser related matters
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
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

/**
 * Class for dealing with browser-specific methods, requests
 */
export default class Browser{
    
  constructor(game){
    this.game = game;
    this.addUserFunctions();
  }
  
  addUserFunctions(){
    this.game.registerFunction('Toggle Fullscreen');
  }
  
  update(){
    this.game.manageRequest(
      'Toggle Fullscreen',
      this.toggleFullscreen,
      {once: true}
    );
  }

  toggleFullscreen(){
    if (document.fullscreenElement){
      document.exitFullscreen();
      return;
    }
    document.documentElement.requestFullscreen();
  }
}


