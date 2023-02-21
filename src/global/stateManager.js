/*
  file: src/StateManager.js
  purpose: define the StateManager class for managing the program's state.
  author: Michał Miłek <https://gitlab.com/mmilk>
  
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

class StateManager {
  constructor() {
    this.stateStack = [];
    this.previous = null;
  }
  pushState(state) {
    this.previous = this.currentState() ?? state;
    state.startHook();
    this.stateStack.push(state);
  }
  popState() {
    this.currentState().endHook();
    this.stateStack.pop();
  }
  currentState() {
    return this.stateStack[this.stateStack.length - 1];
  }
  nthUnderCurrent(n) {
    return this.stateStack[this.stateStack.length - 1 - n];
  }
  stateChanged() {
    return (this.currentState() != this.previous)
  }
  updateCurrentState() {
    this.currentState().update();
    for (let slave of this.currentState().slaves) {
      slave.update();
      if (this.stateChanged()) break;
    }
  }
}

let stateManager = new StateManager();
export default stateManager;
