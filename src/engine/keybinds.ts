/**
 * An abstract class for special keys that can be used in keybinds.
 * @abstract
 */
export class SpecialKey {
  name: string;

  constructor() {
    this.name = this.constructor.name;
  }
}

/**
 * A special key that is used to describe the key used to start the current state.
 */
export class StateStartKey extends SpecialKey {}

/**
 * Used to describe that a keybind should be the same as another one.
 * (for example 'Interact' in game and 'Shoot' in combat minigame)
 * @param {string} action
 * @param {keyof defaultKeybinds} state
 */
export class CopyKey extends SpecialKey {
  action: string;
  state: string;

  constructor(action: string, state: string) {
    super();
    this.action = action;
    this.state = state;
  }
}

export const actions = {
  NONE: "NONE",
};
