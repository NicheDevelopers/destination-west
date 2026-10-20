import App from "./src/App.js";
import SpriteLoader from "./src/Sprite/SpriteLoader.js";

void SpriteLoader.loadSprites().then(() => {
  const app = new App();
  app.loop();
});
