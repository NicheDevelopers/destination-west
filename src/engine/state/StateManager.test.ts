// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vite-plus/test";
import time from "@/engine/time";
import { State } from "./State";
import { stateManager } from "./StateManager";

let calls: string[] = [];

class TestState extends State {
  label: string;

  constructor(label: string, fundamental = false) {
    super(fundamental);
    this.label = label;
  }
  override manageInputs(): void {
    calls.push(`${this.label}.manageInputs`);
  }
  update(): void {
    calls.push(`${this.label}.update`);
  }
  override startHook(): void {
    calls.push(`${this.label}.startHook`);
  }
  override endHook(): void {
    calls.push(`${this.label}.endHook`);
  }
}

let game: TestState;

beforeEach(() => {
  stateManager.stateStack = [];
  stateManager.previousState = null;
  stateManager.lastUpdateTime = time.now;
  game = new TestState("game", true);
  stateManager.pushState(game);
  calls = [];
});

describe("StateManager", () => {
  it("throws when asked for the current state before any state was started", () => {
    stateManager.stateStack = [];
    expect(() => stateManager.currentState).toThrow("No state has been started yet");
  });

  it("starts a state with its start key and ends it", () => {
    const menu = new TestState("menu");

    stateManager.startState(menu, "escape");
    expect(stateManager.currentState).toBe(menu);
    expect(menu.startKey).toBe("escape");

    menu.endState();
    expect(stateManager.currentState).toBe(game);
    expect(calls).toEqual(["menu.startHook", "menu.endHook"]);
  });

  it("toggles a state on and off", () => {
    const map = new TestState("map");

    stateManager.toggleState(map);
    expect(stateManager.currentState).toBe(map);

    stateManager.toggleState(map);
    expect(stateManager.currentState).toBe(game);
  });

  it("refuses to start the current state or end a state that isn't current", () => {
    const menu = new TestState("menu");
    stateManager.startState(menu);

    expect(() => stateManager.startState(menu)).toThrow(
      "Attempt to start a state which is already the current state",
    );
    expect(() => stateManager.endState(game)).toThrow(
      "Attempt to end a state which is not the current state",
    );
  });

  describe("updateStates", () => {
    it("updates states from the top down to the first fundamental one", () => {
      stateManager.pushState(new TestState("dialogue"));
      calls = [];

      stateManager.updateStates();

      expect(calls).toEqual(["dialogue.manageInputs", "dialogue.update", "game.update"]);
    });

    it("stops and re-runs the old state's inputs when a state changes the current state", () => {
      const menu = new TestState("menu");
      game.update = () => {
        calls.push("game.update");
        stateManager.startState(menu);
      };

      stateManager.updateStates();

      expect(calls).toEqual([
        "game.manageInputs",
        "game.update",
        "menu.startHook",
        "game.manageInputs",
      ]);
    });

    it("skips an update when too much time has passed since the last one", () => {
      stateManager.lastUpdateTime = time.now - stateManager.maxUpdateTime - 1;

      stateManager.updateStates();

      expect(calls).toEqual([]);
    });
  });

  describe("potentialStateChange", () => {
    it("sets the start key of a state started since the last update", () => {
      const menu = new TestState("menu");
      stateManager.updateStates();
      stateManager.pushState(menu);

      stateManager.potentialStateChange("escape");

      expect(menu.startKey).toBe("escape");
    });

    it("leaves the start key alone when the state hasn't changed", () => {
      stateManager.updateStates();

      stateManager.potentialStateChange("escape");

      expect(game.startKey).toBe(null);
    });
  });
});
