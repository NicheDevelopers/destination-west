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

import time from "./time.js";
import { generateID } from "../utilities/utilities.js";
import keyman from "../core/KeyboardManager.js";
import defaultKeybinds, { actions as specialActions } from "./defaultKeybinds.js";

class State {
  constructor(fundamental = false, options = { async: false }) {
    this.id = generateID(State);
    this.fundamental = fundamental;
    /**
     * Indicates whether the state is prepared asynchronously, i.e. it's
     * not ready to validate its inputs immediately after construction.
     * (like Game with its `init` function)
     */
    this.async = options.async;
    this.validated = false;

    if (!this.async) {
      // Validate the state when the constructor finishes,
      // before the next game tick
      setTimeout(() => this.validate(), 0);
    } else {
      // If the state is prepared asynchronously, the `validate`
      // function should be called manually. This is checked after 5 seconds.
      setTimeout(() => {
        if (stateManager.crashed) {
          // If the game loop has crashed, the validation could falsely indicate an error
          return;
        }
        if (!this.validated)
          throw new Error(
            `Async state '${this.name}' was not validated. ` +
              `(validate check timed out after 5 seconds) ` +
              `The 'validate' function should be called manually.`,
          );
      }, 5000);
    }
  }
  get name() {
    return this.constructor.name;
  }
  /**
   * Manage this state's action requests. This is the entry point for keyboard
   * user input from the State's perspective. Should handle inputs related
   * to the state directly and call `manageInputs` functions implemented on
   * member objects that also need to handle keyboard inputs of their own.
   * The member objects' `mangeInputs` functions work the same, creating
   * a recursive mechanism.
   */
  manageInputs(_keyman) {}

  /**
   * An internal test function to verify that the state is correctly
   * managing its inputs. This function should be called when the state
   * is ready to call `manageInputs`.
   * By default `validate` is called using a setTimeout
   * with 0 delay in the constructor. If the state is prepared asycnhronously,
   * it should be called manually.
   */
  validate() {
    let managedInputs = [];
    let keymanMock = {
      manageInput: (input) => {
        managedInputs.push(input);
      },
      isActionRequested: (input) => {
        managedInputs.push(input);
      },
    };
    this.manageInputs(keymanMock);

    let thisStateKeybinds = defaultKeybinds[this.name]?.map((bind) => bind[1]);

    for (const input of managedInputs) {
      if (!thisStateKeybinds?.includes(input))
        throw new Error(
          `Validation failed: ` +
            `State '${this.name}' manages action '${input}', which ` +
            `is not bound to it.`,
        );
    }

    for (const input of thisStateKeybinds ?? []) {
      if (input === null || input === specialActions.NONE) continue;
      if (!managedInputs.includes(input))
        throw new Error(
          `Validation failed: ` + `Action '${input}' is not managed by state '${this.name}'`,
        );
    }

    this.validated = true;
  }
  startHook() {}
  endHook() {}
  endState() {
    stateManager.endState(this);
  }
}

class StateManager {
  constructor() {
    this.stateStack = [];
    this.previousState = null;
    this.lastUpdateTime = time.now;
    this.maxUpdateTime = 100;

    this.crashed = false;
  }
  pushState(state, startKey) {
    state.startKey = startKey;
    state.startHook();
    this.stateStack.push(state);
  }
  popState() {
    this.currentState.endHook();
    this.stateStack.pop();
  }
  get currentState() {
    return this.stateStack.last;
  }
  currentStateIs(state) {
    return state.id === this.currentState.id;
  }
  nthUnderCurrent(n) {
    return this.stateStack.lastNthElement(n);
  }
  stateChanged() {
    return this.currentState !== this.previousState;
  }
  updateStates() {
    if (time.now - this.lastUpdateTime > this.maxUpdateTime) {
      // Cancelling update due to exceeding the maximum allowed udpate time
      this.lastUpdateTime = time.now;
      return;
    }
    this.lastUpdateTime = time.now;
    this.previousState = this.currentState;

    keyman.manageGeneralInputs();
    for (let state of this.stateStack.slice().reverse()) {
      if (state.id === this.stateStack.last.id) state.manageInputs(keyman);
      state.update();
      if (this.stateChanged()) {
        keyman.clearInputs();
        this.previousState.manageInputs(keyman);
        break;
      }
      if (state.fundamental) break;
    }
  }
  // if cond is true, pop and run endhook, else push and run starthook
  toggleState(state, startKey) {
    if (this.currentState.id === state.id) this.popState();
    else this.pushState(state, startKey);
  }
  startState(state, startKey) {
    if (this.currentState.id === state.id)
      throw new Error(`Attempt to start a state which is already the current state`);
    this.pushState(state, startKey);
  }
  endState(state) {
    if (this.currentState.id !== state.id)
      throw new Error(`Attempt to end a state which is not the current state`);
    this.popState();
  }
  /**
   * Called when a key is pressed. If the state has changed, the new state's
   * startKey is set to the key that caused the state change.
   * @param {string} key - The key that was pressed
   */
  potentialStateChange(key) {
    if (this.stateChanged()) {
      this.currentState.startKey = key;
    }
  }
}

let stateManager = new StateManager();
export { stateManager, State };
