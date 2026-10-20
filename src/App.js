import time from "@/global/time.js";
import { Browser } from "@/core/Browser.js";
import keyman from "@/core/KeyboardManager.js";
import AudioPlayer from "@/audio/AudioPlayer.js";
import DebugView from "@/debug/DebugView.js";
import Game from "@/game/Game.js";
import { stateManager } from "@/global/stateManager.js";
import { notifier } from "@/global/notifier.js";

class App {
  constructor() {
    this.game = new Game(this, () => {
      stateManager.pushState(this.game);
    });

    this.animationFrameID = null;

    this.debugging = false;

    this.browser = new Browser(this);
    this.audioPlayer = new AudioPlayer();

    this.debugView = new DebugView(this);

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

  loop() {
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
  crash(error) {
    stateManager.crashed = true;
    keyman.detach();
    window.cancelAnimationFrame(this.animationFrameID);
    this.browser.displayError(error);
    console.error(error);
  }
}

export default App;
