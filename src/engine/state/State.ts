import { generateID } from "@/lib/utilities";
import type { KeyboardManager } from "@/engine/KeyboardManager";
import { stateManager } from "./StateManager";
import { validateInputs } from "./validate-inputs";

export type InputManager = Pick<KeyboardManager, "manageInput" | "isActionRequested">;

export abstract class State {
  id: number;
  fundamental: boolean;
  startKey: string | null = null;

  constructor(fundamental = false) {
    this.id = generateID(State);
    this.fundamental = fundamental;

    // Validate the state when the constructor finishes,
    // before the next game tick
    setTimeout(() => validateInputs(this), 0);
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

  startHook(): void {}
  endHook(): void {}
  endState(): void {
    stateManager.endState(this);
  }
}
