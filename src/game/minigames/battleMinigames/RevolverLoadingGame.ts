import { State } from "@/engine/stateManager";
import { randIntInRange } from "@/lib/random";
import { htmlCreate } from "@/lib/dom";
import AudioPlayer from "@/engine/audio/AudioPlayer";
import soundMap from "@/game/audio/soundMap";
import volumeMap from "@/game/audio/volumeMap";
import type { KeyboardManager } from "@/engine/KeyboardManager";
import type Game from "@/game/Game";

const assetsPath = "img/battle_assets/revolver_minigame/";

type LoadDirection = "left" | "right";

class RevolverLoadingGame extends State {
  readonly game: Game;
  private bullets: number;
  private mainDiv: HTMLElement;
  private soundAgent = new AudioPlayer(soundMap, volumeMap);
  private arrowDivs: HTMLElement[] = [];
  private arrowDirections: LoadDirection[] = [];
  private currentArrow = 0;
  private successfulLoads = 0;

  constructor(game: RevolverLoadingGame["game"], bullets: RevolverLoadingGame["bullets"]) {
    super(true);
    if (bullets <= 0) {
      throw new Error("Loading minigame needs at least one bullet");
    }
    this.game = game;
    this.bullets = bullets;

    const gameContainer = document.querySelector("#game-container");
    if (!gameContainer) throw new Error("Missing #game-container element");
    this.mainDiv = htmlCreate({
      backgroundImage: `url("${assetsPath}revolver-firing-board.png")`,
      id: "shooting-range",
      display: "none",
      appendTo: gameContainer,
    });

    for (let i = 0; i < this.bullets; ++i) {
      const direction = randIntInRange(0, 2) === 0 ? "left" : "right";
      const arrowDiv = htmlCreate({
        backgroundImage: `url("${assetsPath}revolver-load-${direction}.png")`,
        id: "arrow" + i,
        left: 25 + 10 * (i % 3) + "%",
        top: 5 + 50 * Math.floor(i / 3) + "%",
        className: "arrow",
        display: "flex",
        appendTo: this.mainDiv,
      });
      this.arrowDirections.push(direction);
      this.arrowDivs.push(arrowDiv);
    }
  }

  update(): void {}

  override manageInputs(keyman: Pick<KeyboardManager, "manageInput">): void {
    keyman.manageInput("Load Left", () => this.checkLoad("left"));
    keyman.manageInput("Load Right", () => this.checkLoad("right"));
  }

  private checkLoad(playerDirection: LoadDirection): void {
    // in case someone wants to shoot more shots than they have bullets
    if (this.currentArrow >= this.bullets) {
      return;
    }
    const arrowDirection = this.arrowDirections[this.currentArrow];
    const arrowDiv = this.arrowDivs[this.currentArrow];
    if (playerDirection === arrowDirection) {
      arrowDiv.style.backgroundImage = `url("${assetsPath}revolver-load-${arrowDirection}-correct.png")`;
      this.soundAgent.play("revolver-load");
      ++this.successfulLoads;
    } else {
      arrowDiv.style.backgroundImage = `url("${assetsPath}revolver-load-${arrowDirection}-incorrect.png")`;
    }

    ++this.currentArrow;
    if (this.currentArrow >= this.bullets) {
      this.soundAgent.play("revolver-roll", { delay: 300 });
    }
  }

  override startHook(): void {
    this.mainDiv.style.display = "flex";
  }

  override endHook(): void {
    this.mainDiv.style.display = "none";
    console.log("Successful loads: " + this.successfulLoads);
  }
}

export default RevolverLoadingGame;
