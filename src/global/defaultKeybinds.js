export const specialKeys = {
  STATE_START_KEY: "STATE_START_KEY"
}

export const actions = {
  NONE: "NONE"
}

/**
 * A collection of arrays describing keybinds in particular states.
 * The 'general' keybinds are used in every state unless overwritten
 * by it. `actions.NONE` can be used to disable a keybind without overwriting.
 * Note: Order matters! The first keybind that matches a keypress will be used.
 * This also applies to special keys.
 */
const defaultKeybinds = {
  general: [
    [specialKeys.STATE_START_KEY, 'Close Window'],
    ['escape', 'Close Window'],
    ['f', 'Toggle Fullscreen'],
    ['n', 'Toggle Debug Mode'],
  ],
  Game: [
    ['a', 'Move Left'],
    ['d', 'Move Right'],
    ['w', 'Move Up'],
    ['s', 'Move Down'],
    ['shift', 'Toggle Sprint'],
    ['c', 'Toggle Sneak'],
    ['m', 'Open Map'],
    ['h', 'Open Designer'],
    ['e', 'Interact'],
    ['g', 'Open Equipment'],
    ['=', 'Camera zoom in'],
    ['-', 'Camera zoom out'],
    ['escape', 'Open Pause Menu'],
  ],
  DialogueDisplay: [
    [specialKeys.STATE_START_KEY, 'Next Dialogue Line'],
    ['escape', actions.NONE],
  ],
  EquipmentDisplay: [
    ['g', 'Open Equipment'],
  ],
  CombatDisplay: [
    [specialKeys.STATE_START_KEY, 'Next Dialogue Line'],
  ],
};

export default defaultKeybinds;
