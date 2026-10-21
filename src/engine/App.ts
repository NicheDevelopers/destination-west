import time from "./time";
import { Browser } from "./Browser";
import keyman from "./KeyboardManager";
import DebugView from "@/engine/debug/DebugView";
import { stateManager } from "@/engine/state/StateManager";
import { notifier } from "./notifier";

class App {
  animationFrameID: number;
  debugging: boolean;
  browser: Browser;
  debugView: DebugView;

  constructor() {
    this.animationFrameID = 0;

    this.debugging = false;

    this.browser = new Browser(this);

    this.debugView = new DebugView(this.debugging);

    keyman.generalActions.set("Toggle Fullscreen", {
      fn: () => this.browser.toggleFullscreen(),
    });
    keyman.generalActions.set("Close Window", {
      fn: () => stateManager.currentState.endState(),
    });
    keyman.generalActions.set("Toggle Debug Mode", {
      fn: () => {
        this.debugging = !this.debugging;
        this.debugView.setVisibility(this.debugging);
      },
    });
  }

  loop(): void {
    this.animationFrameID = window.requestAnimationFrame(() => this.loop());
    try {
      time.update();

      this.debugView.update();

      stateManager.updateStates();
      notifier.update();
    } catch (e) {
      this.crash(e);
    }
  }

  /**
   * Run when an error occurs in the game loop or in some asynchronous callback.
   */
  crash(error: unknown): void {
    keyman.detach();
    window.cancelAnimationFrame(this.animationFrameID);
    if (error instanceof Error) this.browser.displayError(error);
    else this.browser.displayError(new Error(String(error)));
    console.error(error);
  }
}

export default App;
