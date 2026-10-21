import { StateStartKey, CopyKey, actions } from "@/engine/keybinds";
import type { Keybinds } from "@/engine/KeyboardManager";

/**
 * A collection of arrays describing keybinds in particular states.
 * The 'general' keybinds are used in every state unless overwritten
 * by it. `actions.NONE` can be used to disable a keybind.
 * Note: Order matters! The first keybind that matches a keypress will be used.
 * This also applies to special keys.
 */
const defaultKeybinds: Keybinds = {
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
