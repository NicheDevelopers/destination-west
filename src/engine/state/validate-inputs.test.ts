// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import keyboardManager from "@/engine/KeyboardManager";
import { actions as specialActions } from "@/engine/keybinds";
import { State, type InputManager } from "./State";
import { validateInputs } from "./validate-inputs";

class Menu extends State {
  managedActions: string[];

  constructor(managedActions: string[]) {
    super();
    this.managedActions = managedActions;
  }
  override manageInputs(keyboardManager: InputManager): void {
    for (const action of this.managedActions) {
      keyboardManager.manageInput(action, () => {});
    }
  }
  update(): void {}
}

vi.useFakeTimers();

beforeEach(() => {
  keyboardManager.load({
    Menu: [
      ["escape", "Close"],
      ["tab", specialActions.NONE],
    ],
  });
});

describe("validateInputs", () => {
  it("passes when the state manages exactly its bound actions", () => {
    expect(() => validateInputs(new Menu(["Close"]))).not.toThrow();
  });

  it("throws when the state manages an action that isn't bound to it", () => {
    expect(() => validateInputs(new Menu(["Close", "Jump"]))).toThrow(
      "State 'Menu' manages action 'Jump', which is not bound to it.",
    );
  });

  it("throws when a bound action isn't managed by the state", () => {
    expect(() => validateInputs(new Menu([]))).toThrow(
      "Action 'Close' is not managed by state 'Menu'",
    );
  });

  it("runs on the tick after a state is constructed", () => {
    new Menu(["Jump"]);
    expect(() => vi.runAllTimers()).toThrow("State 'Menu' manages action 'Jump'");
  });
});
