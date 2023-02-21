/*
  file: src/KeyboardManager.js
  purpose: define the KeyboardManager class; provide a simple interface
           for keyboard event management
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


/* Prevent accidental game exit. To be used in the future
window.onbeforeunload = (e) => {
  e.preventDefault();
  e.returnValue = 'Are you sure you want to exit Destination West?';
  };
*/

/**
 * Provide a simple interface for managing keyboard events
 */
class KeyboardManager {
  constructor(app, keybinds = []) {
    this.app = app;
    this.actions = new Map(); // [key, array of actions]

    this.load(keybinds);
    // Requests are actions bound to the currently pressed keys
    this.requests = new Map(); // [action, true]

    // Ignored actions are meant to be ignored on key presses
    this.ignore = new Map(); // [action, true]
  }

  /**
   * Add *key* to the keymap and assign function *func* to it
   @returns true on success, false on failure
  */
  bind(key, action) {
    if (!this.actions.get(key)) this.actions.set(key, []);

    let actions = this.actions.get(key);

    if (actions.indexOf(action) !== -1) {
      throw `Keyboard Manager: ` +
      `Attempted to bind function \'${action}\' to key ` +
      `\'${key}\' the second time.`;
    }

    actions.push(action);
    return true;
  }

  unbind(key, action = false) {
    // Remove *key* from the keymap.
    // Returns: true on success, false on failure
    let actions = this.actions.get(key);
    if (!actions) return false;

    if (!action) {
      actions.delete(key);
      return true;
    }

    let i = actions.indexOf(action);
    if (i === -1) return false;

    actions[i] = actions[actions.length - 1];
    actions.pop();
    return true;
  }
  load(keybinds) {
    // Load keybinds from an array with [key, action] pairs
    // Returns: undefined
    keybinds.forEach(keybind => {
      this.bind(keybind[0], keybind[1]);
    });
  }
  manageKeydown(event) {
    let k = event.key.toLowerCase();
    let actions = this.actions.get(k);
    if (!actions) return;
    actions.forEach(action => {
      if (!this.ignore.has(action))
        this.requests.set(action, true);
    });
  }
  manageKeyup(event) {
    let k = event.key.toLowerCase();
    let actions = this.actions.get(k);
    if (!actions) return;
    actions.forEach(action => {
      this.ignore.delete(action);
      this.requests.delete(action);
    });
  }
  isActionRequested(action) {
    return this.requests.has(action);
  }
  manageRequest(action, callback, options = {}) {
    if (!this.requests.has(action))
      return;
    if (options?.once) {
      this.requests.delete(action);
      this.ignore.set(action, true);
    }
    return callback();
  }
}

export default KeyboardManager;
