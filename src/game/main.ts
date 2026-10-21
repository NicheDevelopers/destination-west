import App from "@/engine/App";
import keyman from "@/engine/KeyboardManager";
import SpriteLoader from "@/engine/Sprite/SpriteLoader";
import { stateManager } from "@/engine/stateManager";
import defaultKeybinds from "./defaultKeybinds";
import Game from "./Game";
import imgInfo from "./imgInfo";

keyman.load(defaultKeybinds);

void SpriteLoader.loadSprites(imgInfo).then(() => {
  const app = new App();
  const game = new Game(app, () => {
    stateManager.pushState(game);
  });
  app.loop();
});
