/**
 * An abstract class for special keys that can be used in keybinds.
 * @abstract
 */
export class SpecialKey {
  constructor() {
    this.name = this.constructor.name;
  }
}

/**
 * A special key that is used to describe the key used to start the current state.
 */
export class StateStartKey extends SpecialKey {
  constructor() {
    super();
  }
}

/**
 * Used to describe that a keybind should be the same as another one.
 * (for example 'Interact' in game and 'Shoot' in combat minigame)
 * @param {string} action
 * @param {keyof defaultKeybinds} state
 */
export class CopyKey extends SpecialKey {
  constructor(action, state) {
    super();
    this.action = action;
    this.state = state;
  }
}

export const actions = {
  NONE: "NONE",
};

/**
 * A collection of arrays describing keybinds in particular states.
 * The 'general' keybinds are used in every state unless overwritten
 * by it. `actions.NONE` can be used to disable a keybind.
 * Note: Order matters! The first keybind that matches a keypress will be used.
 * This also applies to special keys.
 * @type {Object.<string, Array<[string|SpecialKey, string]>>}
 */
const defaultKeybinds = {
  general: [
    [new StateStartKey(), "Close Window"],
    ["escape", "Close Window"],
    ["f", "Toggle Fullscreen"],
    ["n", "Toggle Debug Mode"],
  ],
  Game: [
    ["a", "Move Left"],
    ["d", "Move Right"],
    ["w", "Move Up"],
    ["s", "Move Down"],
    ["shift", "Toggle Sprint"],
    ["c", "Toggle Sneak"],
    ["m", "Open Map"],
    ["h", "Open Designer"],
    ["e", "Interact"],
    ["g", "Open Equipment"],
    ["=", "Camera zoom in"],
    ["-", "Camera zoom out"],
    ["escape", "Open Pause Menu"],
  ],
  DialogueDisplay: [
    [new CopyKey("Interact", "Game"), "Next Dialogue Line"],
    ["escape", actions.NONE],
  ],
  CombatDisplay: [[new StateStartKey(), "Next Dialogue Line"]],
  RevolverShootingGame: [[new CopyKey("Interact", "Game"), "Shoot"]],
  RevolverLoadingGame: [
    [new CopyKey("Move Left", "Game"), "Load Left"],
    [new CopyKey("Move Right", "Game"), "Load Right"],
  ],
};

export default defaultKeybinds;
