import keyboardManager from "@/engine/KeyboardManager";
import { actions as specialActions } from "@/engine/keybinds";
import type { InputManager, State } from "./State";

/**
 * An internal test function to verify that the state is correctly
 * managing its inputs. This function should be called when the state
 * is ready to call `manageInputs`.
 * By default `validateInputs` is called using a setTimeout
 * with 0 delay in the State constructor.
 */
export function validateInputs(state: State): void {
  const managedInputs: string[] = [];
  const keyboardManagerMock: InputManager = {
    manageInput: (input) => {
      managedInputs.push(input);
    },
    isActionRequested: (input) => {
      managedInputs.push(input);
      return false;
    },
  };
  state.manageInputs(keyboardManagerMock);

  const stateKeybinds = keyboardManager.keybinds[state.name]?.map((bind) => bind[1]) ?? [];

  for (const input of managedInputs) {
    if (!stateKeybinds.includes(input))
      throw new Error(
        `Validation failed: ` +
          `State '${state.name}' manages action '${input}', which ` +
          `is not bound to it.`,
      );
  }

  for (const input of stateKeybinds) {
    if (input === specialActions.NONE) continue;
    if (!managedInputs.includes(input))
      throw new Error(
        `Validation failed: ` + `Action '${input}' is not managed by state '${state.name}'`,
      );
  }
}
