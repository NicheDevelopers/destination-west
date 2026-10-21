import time from "./time";
import { generateID } from "@/lib/utilities";
import keyman, { type KeyboardManager } from "./KeyboardManager";
import { actions as specialActions } from "./keybinds";

type InputManager = Pick<KeyboardManager, "manageInput" | "isActionRequested">;

abstract class State {
  id: number;
  fundamental: boolean;
  async: boolean;
  validated: boolean;
  startKey: string | null = null;

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
  get name(): string {
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
  manageInputs(_keyman: InputManager): void {}

  abstract update(): void;

  /**
   * An internal test function to verify that the state is correctly
   * managing its inputs. This function should be called when the state
   * is ready to call `manageInputs`.
   * By default `validate` is called using a setTimeout
   * with 0 delay in the constructor. If the state is prepared asycnhronously,
   * it should be called manually.
   */
  validate(): void {
    let managedInputs: string[] = [];
    let keymanMock: InputManager = {
      manageInput: (input) => {
        managedInputs.push(input);
      },
      isActionRequested: (input) => {
        managedInputs.push(input);
        return false;
      },
    };
    this.manageInputs(keymanMock);

    let thisStateKeybinds = keyman.keybinds[this.name]?.map((bind) => bind[1]);

    for (const input of managedInputs) {
      if (!thisStateKeybinds?.includes(input))
        throw new Error(
          `Validation failed: ` +
            `State '${this.name}' manages action '${input}', which ` +
            `is not bound to it.`,
        );
    }

    for (const input of thisStateKeybinds ?? []) {
      if (input === specialActions.NONE) continue;
      if (!managedInputs.includes(input))
        throw new Error(
          `Validation failed: ` + `Action '${input}' is not managed by state '${this.name}'`,
        );
    }

    this.validated = true;
  }
  startHook(): void {}
  endHook(): void {}
  endState(): void {
    stateManager.endState(this);
  }
}

class StateManager {
  stateStack: State[];
  previousState: State | null;
  lastUpdateTime: number;
  maxUpdateTime: number;
  crashed: boolean;

  constructor() {
    this.stateStack = [];
    this.previousState = null;
    this.lastUpdateTime = time.now;
    this.maxUpdateTime = 100;

    this.crashed = false;
  }
  pushState(state: State, startKey: string | null = null): void {
    state.startKey = startKey;
    state.startHook();
    this.stateStack.push(state);
  }
  popState(): void {
    this.currentState.endHook();
    this.stateStack.pop();
  }
  get currentState(): State {
    const state = this.stateStack.last;
    if (!state) throw new Error(`No state has been started yet`);
    return state;
  }
  currentStateIs(state: State): boolean {
    return state.id === this.currentState.id;
  }
  nthUnderCurrent(n: number): State {
    return this.stateStack.lastNthElement(n);
  }
  stateChanged(): boolean {
    return this.currentState !== this.previousState;
  }
  updateStates(): void {
    if (time.now - this.lastUpdateTime > this.maxUpdateTime) {
      // Cancelling update due to exceeding the maximum allowed udpate time
      this.lastUpdateTime = time.now;
      return;
    }
    this.lastUpdateTime = time.now;
    if (this.stateStack.length === 0) return;

    const previousState = this.currentState;
    this.previousState = previousState;

    keyman.manageGeneralInputs();
    for (let state of this.stateStack.slice().reverse()) {
      if (state.id === this.currentState.id) state.manageInputs(keyman);
      state.update();
      if (this.stateChanged()) {
        keyman.clearInputs();
        previousState.manageInputs(keyman);
        break;
      }
      if (state.fundamental) break;
    }
  }
  // If the state is the current one, pop it and run its endHook, else push it and run its startHook
  toggleState(state: State, startKey: string | null = null): void {
    if (this.currentState.id === state.id) this.popState();
    else this.pushState(state, startKey);
  }
  startState(state: State, startKey: string | null = null): void {
    if (this.currentState.id === state.id)
      throw new Error(`Attempt to start a state which is already the current state`);
    this.pushState(state, startKey);
  }
  endState(state: State): void {
    if (this.currentState.id !== state.id)
      throw new Error(`Attempt to end a state which is not the current state`);
    this.popState();
  }
  /**
   * Called when a key is pressed. If the state has changed, the new state's
   * startKey is set to the key that caused the state change.
   * @param {string} key - The key that was pressed
   */
  potentialStateChange(key: string): void {
    if (this.stateChanged()) {
      this.currentState.startKey = key;
    }
  }
}

let stateManager = new StateManager();
export { stateManager, State };
