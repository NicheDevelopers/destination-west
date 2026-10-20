import { State } from "@/global/stateManager.js";
import { randIntInRange } from "@/utilities/random.js";
import { htmlCreate } from "@/utilities/dom.js";
import AudioPlayer from "@/audio/AudioPlayer.js";

class RevolverLoadingGame extends State {
  constructor(game, bullets) {
    super(true);

    this.gameContainer = document.querySelector("#game-container");
    this.game = game;
    this.mainDiv = htmlCreate({
      "background-image": `url("img/battle_assets/revolver_minigame/revolver-firing-board.png")`,
      id: "shooting-range",
      appendTo: this.gameContainer,
    });
    this.soundAgent = new AudioPlayer();

    this.bullets = bullets;
    if (this.bullets <= 0) {
      error("Loading minigame initiated with a negative count of bullets!");
    }
    this.arrowDivs = [];
    // array which stores respective arrows' direction, so that there's no need to extract it later from file names or something else
    this.arrowDirections = [];
    for (let i = 0; i < this.bullets; ++i) {
      let arrowid = "arrow" + i;
      let direction = randIntInRange(0, 2);
      direction = direction == 0 ? "left" : "right";
      this.arrowDirections.push(direction);
      this.arrowDivs.push(
        htmlCreate({
          "background-image":
            `url("img/battle_assets/revolver_minigame/revolver-load-` + direction + `.png")`,
          id: arrowid,
          left: 25 + 10 * (i % 3) + "%",
          top: 5 + 50 * ~~(i / 3) + "%",
          className: "arrow",
          appendTo: this.mainDiv,
        }),
      );
      this.arrowDivs[i].style.display = "flex";
    }
    this.mainDiv.style.display = "none";
    this.currentArrow = 0;
    this.successfulLoads = 0;
  }

  start() {
    console.log("Startuje");
  }

  update() {}

  manageInputs(keyman) {
    keyman.manageInput("Load Left", () => this.checkLoad("left"));
    keyman.manageInput("Load Right", () => this.checkLoad("right"));
  }

  checkLoad(playerDirection) {
    // in case someone wants to shoot more shots than they have bullets
    if (this.currentArrow >= this.bullets) {
      return;
    }
    if (playerDirection == this.arrowDirections[this.currentArrow]) {
      this.arrowDivs[this.currentArrow].style.backgroundImage =
        `url("img/battle_assets/revolver_minigame/revolver-load-` +
        this.arrowDirections[this.currentArrow] +
        `-correct.png")`;
      this.soundAgent.play("revolver-load");
      ++this.successfulLoads;
      ++this.currentArrow;
      if (this.currentArrow >= this.bullets) this.soundAgent.play("revolver-roll", { delay: 300 });
      return;
    }
    this.arrowDivs[this.currentArrow].style.backgroundImage =
      `url("img/battle_assets/revolver_minigame/revolver-load-` +
      this.arrowDirections[this.currentArrow] +
      `-incorrect.png")`;
    ++this.currentArrow;
    if (this.currentArrow >= this.bullets) this.soundAgent.play("revolver-roll", { delay: 300 });
  }

  startHook() {
    this.mainDiv.style.display = "flex";
  }

  endHook() {
    this.mainDiv.style.display = "none";
    console.log("Successful loads: " + this.successfulLoads);
  }
}

export default RevolverLoadingGame;
