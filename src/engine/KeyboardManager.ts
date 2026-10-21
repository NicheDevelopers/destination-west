import { TwoWayMap } from "@/lib/TwoWayMap";
import { stateManager } from "./stateManager";
import { actions as specialActions, StateStartKey, CopyKey, type SpecialKey } from "./keybinds";

/* Prevent accidental game exit. To be used in the future
window.onbeforeunload = (e) => {
  e.preventDefault();
  e.returnValue = 'Are you sure you want to exit Destination West?';
  };
*/

export type Keybinds = Record<string, [string | SpecialKey, string][]>;

type InputOptions = { once?: boolean };

type GeneralAction = { fn: (key: string) => void; flags?: InputOptions };

export class KeyboardManager {
  /**
   * A map, mapping state names to their keybinds
   */
  stateBinds: Map<string, TwoWayMap<string | SpecialKey, string>>;
  keybinds: Keybinds = {};
  generalActions: Map<string, GeneralAction>;
  requests: TwoWayMap<string, string>;
  ignore: Map<string, boolean>;
  private onKeyDown: (event: KeyboardEvent) => void;
  private onKeyUp: (event: KeyboardEvent) => void;

  constructor() {
    this.stateBinds = new Map();

    this.generalActions = new Map();

    this.requests = new TwoWayMap(); // [key, action]
    this.ignore = new Map(); // [action, true]

    this.onKeyDown = this.manageKeydown.bind(this);
    this.onKeyUp = this.manageKeyup.bind(this);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  }

  load(keybinds: Keybinds): void {
    this.keybinds = keybinds;
    this.stateBinds = new Map();

    for (const state in keybinds) {
      this.stateBinds.set(state, new TwoWayMap(keybinds[state]));
    }
  }

  manageKeydown(event: KeyboardEvent): void {
    let key = event.key.toLowerCase();

    if (this.ignore.has(key)) return;

    let action = this.getAction(key);

    if (action === specialActions.NONE) return;

    if (action && !this.requests.hasValue(action)) this.requests.set(key, action);
  }
  manageKeyup(event: KeyboardEvent): void {
    let key = event.key.toLowerCase();
    this.ignore.delete(key);

    this.requests.deleteByKey(key);
  }
  isActionRequested(action: string): boolean {
    return this.requests.hasValue(action);
  }

  /**
   * Manage a particular action by calling a callback
   * if that action has been requested due to a keypress
   * @param action - The name of the managed action
   * @param callback - The function to call if the action has been requested
   * @param options.once [true] - Whether the input is meant to be managed
   * once per keypress (and not every tick while the key is down).
   */
  manageInput(action: string, callback: (key: string) => void, options: InputOptions = {}): void {
    if (!this.isActionRequested(action)) return;

    let key = this.requests.getKey(action);

    if (!key) return;

    if (options.once === undefined || options.once) {
      this.requests.deleteByValue(action);
      this.ignore.set(key, true);
    }

    callback(key);

    stateManager.potentialStateChange(key);
  }

  /**
   * Manages requests for actions stored in generalActions
   */
  manageGeneralInputs(): void {
    for (const [name, action] of this.generalActions) {
      this.manageInput(name, action.fn, action.flags);
    }
  }

  /**
   * Returns the TwoWayMap of keybinds of a specified state.
   * The TwoWayMap is prepared for usage by replacing special keys
   * with their actual values.
   */
  bindsAt(stateName: string): TwoWayMap<string | SpecialKey, string> | undefined {
    return this.stateBinds.get(stateName)?.map(([key, action]) => {
      if (key instanceof StateStartKey) return [stateManager.currentState.startKey ?? key, action];

      if (key instanceof CopyKey) {
        const copiedKey = this.bindsAt(key.state)?.getKey(key.action);
        if (copiedKey === undefined) {
          throw new Error(`Cannot copy unbound action '${key.action}' of state '${key.state}'`);
        }
        return [copiedKey, action];
      }

      return [key, action];
    }, true);
  }

  /**
   * Returns the TwoWayMap of keybinds of the current state.
   */
  currentBinds(): TwoWayMap<string | SpecialKey, string> | undefined {
    return this.bindsAt(stateManager.currentState.name);
  }

  /**
   * Returns the key bound to the given action if this action is
   * available within the current state or the "general" bind collection.
   * Returns undefined otherwise.
   */
  getKey(action: string): string | SpecialKey | undefined {
    return this.currentBinds()?.getKey(action) ?? this.bindsAt("general")?.getKey(action);
  }

  /**
   * Attempts to get the action bound to a key in the current state
   * or in the general keybinds. Returns undefined if the key is not bound in either.
   */
  getAction(key: string): string | undefined {
    return this.currentBinds()?.getValue(key) ?? this.bindsAt("general")?.getValue(key);
  }

  clearInputs(): void {
    // IMPROVEMENT TODO:
    // Translate requests between states: if a key is pressed in one state
    // and the same key is bound to a different action in another state,
    // the action should be requested in the other state.
    // If the key is not bound in the other state, the request should be preserved
    // until the key is released (as the state might change again to one which
    // has the key bound to some action).
    this.requests.clear();
  }

  /**
   * Detach the KeyboardManager from the document, removing all event listeners.
   */
  detach(): void {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
  }
}

export default new KeyboardManager();
