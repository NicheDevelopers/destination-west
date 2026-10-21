import App from "@/engine/App";
import keyman from "@/engine/KeyboardManager";
import SpriteLoader from "@/engine/Sprite/SpriteLoader";
import { stateManager } from "@/engine/state/StateManager";
import { randIntInRange } from "@/lib/random";
import defaultKeybinds from "./defaultKeybinds";
import Game from "./Game";
import { devSetup } from "./dev-setup";
import imgInfo from "./imgInfo";

keyman.load(defaultKeybinds);

void SpriteLoader.loadSprites(imgInfo).then(() => {
  const app = new App();
  try {
    const game = new Game(app, randIntInRange(0, 1000000));
    devSetup(game);
    stateManager.pushState(game);
  } catch (e) {
    app.crash(e);
    return;
  }
  app.loop();
});
