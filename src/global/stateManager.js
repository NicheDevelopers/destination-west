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

import { generateID } from "./utilities.js"

class State {
  constructor(fundamental) {
    this.slaves = [];
    this.id = generateID("state");
    this.fundamental = fundamental;
  }
  startHook() {}
  endHook() {}
}

class StateManager {
  constructor() {
    this.stateStack = [];
    this.previous = null;
  }
  pushState(state) {
    state.startHook();
    this.stateStack.push(state);
  }
  popState() {
    this.currentState().endHook();
    this.stateStack.pop();
  }
  currentState() {
    return this.stateStack.last;
  }
  nthUnderCurrent(n) {
    return this.stateStack.lastNthElement(n);
  }
  stateChanged() {
    return (this.currentState() !== this.previous)
  }
  updateStates() {
    this.previous = this.currentState();
    for (let state of this.stateStack.slice().reverse()) {
      state.update();
      for (let slave of this.currentState().slaves) {
        slave.update();
        if (this.stateChanged()) break;
      }
      if (state.fundamental) break;
    }
  }
  // if cond is true, pop and run endhook, else push and run starthook
  toggleState(state) {
    (this.currentState().id === state.id) ?
      this.popState() : this.pushState(state)
  }
  print() {
    console.log(this.stateStack.map((s) => s.id));
  }
}

let stateManager = new StateManager();
export { stateManager, State };
