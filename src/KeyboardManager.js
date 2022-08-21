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

/** Provide a simple interface for managing keyboard
   events */
class KeyboardManager {
  constructor(game, keybinds=[]){
    this.game = game;
    this.binds = new Map(); // [key, array of functions]
    this.bindsNames = new Map(); // [key, array of function names]
    this.load(keybinds);
    // Requests are function names bound to the currently pressed keys
    this.pressedKeys = new Map(); // [key, array of function names]
    this.requests = new Map(); // [function name, true]
  }
  
  /** Add *key* to the keymap and assign function *func* to it
      Returns: true on success, false on failure */
  bind(key, functionName){

    let funcToBind = this.game.isFunctionRegistered(functionName);
    if (!funcToBind) {
      console.error(
	`Keyboard Manager: ` +
	`Attempted to bind a non-registered function: ${functionName}`
      );
      return false;
    }

    let functionNamesArray = this.bindsNames.get(key);
    if (functionNamesArray){ // *key* has been previously bound
      if (functionNamesArray.indexOf(functionName) !== -1) {
	console.error(
	  `Keyboard Manager: ` +
	  `Attempted to bind function \'${functionName}\' to key ` +
	  `\'${key}\' the second time.`
	);
	return false;
      }
//?     this.bindsNames.get(key).push(functionName);
      functionNamesArray.push(funcToBind);
      return true;
    }
    // *key* has not been bound to anything yet
//?    this.binds.set(key, [funcToBind]);
    this.bindsNames.set(key, [functionName]);
    return true;
  }
  unbind(key){
    // Remove *key* from the keymap.
    // Returns: true on success, false on failure
    return this.binds.delete(key);
  }
  load(keyBindArray){
    // Load keybinds from an array with [key, function] pairs
    // Returns: undefined
    this.binds.clear();
    let self = this;
    keyBindArray.forEach((keybind) => {
      self.bind(keybind[0], keybind[1]);
    });
  }
  manageKeydown(event){
    let functionNames = this.bindsNames.get(event.key);
    if (functionNames)
      functionNames.forEach((fName) => {
	if (this.pressedKeys.get(event.key)){
 	  this.pressedKeys.get(event.key).push(fName);
	  this.requests.set(fName, true);
	  return;
	}
	this.pressedKeys.set(event.key, [fName]);
	this.requests.set(fName, true);
      });
  }
  manageKeyup(event){
    if (this.pressedKeys.get(event.key))
      this.pressedKeys.delete(event.key);
  }
  manageRequest(functionName, callback, options = {}){
    if (!this.requests.has(functionName))
      return;
    callback();
    if (options?.once)
      this.requests.delete(functionName);
    
  }
}

export default KeyboardManager;
