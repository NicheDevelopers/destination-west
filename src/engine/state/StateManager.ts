import time from "@/engine/time";
import keyman from "@/engine/KeyboardManager";
import type { State } from "./State";

class StateManager {
  stateStack: State[] = [];
  previousState: State | null = null;
  lastUpdateTime = time.now;
  maxUpdateTime = 100;

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

    const stateBeforeUpdate = this.currentState;
    this.previousState = stateBeforeUpdate;

    keyman.manageGeneralInputs();
    for (const state of this.stateStack.slice().reverse()) {
      if (state.id === this.currentState.id) state.manageInputs(keyman);
      state.update();
      if (this.stateChanged()) {
        keyman.clearInputs();
        stateBeforeUpdate.manageInputs(keyman);
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

export const stateManager = new StateManager();
