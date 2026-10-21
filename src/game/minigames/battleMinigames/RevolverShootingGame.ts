import { State } from "@/engine/stateManager";
import { randIntInRange } from "@/lib/random";
import { htmlCreate } from "@/lib/dom";
import AudioPlayer from "@/engine/audio/AudioPlayer";
import soundMap from "@/game/audio/soundMap";
import volumeMap from "@/game/audio/volumeMap";
import type { KeyboardManager } from "@/engine/KeyboardManager";
import type Game from "@/game/Game";

const assetsPath = "img/battle_assets/revolver_minigame/";

const bulletRange = { left: 40, right: 80 };
const bulletOffset = 10;

class RevolverShootingGame extends State {
  readonly game: Game;
  private bullets: number;
  private mainDiv: HTMLElement;
  private borders: number[] = [];
  private soundAgent = new AudioPlayer(soundMap, volumeMap);
  private currentBullet = 0;
  private successfulShots = 0;
  private bulletDivs: HTMLElement[] = [];

  constructor(game: RevolverShootingGame["game"], bullets: RevolverShootingGame["bullets"]) {
    super(true);
    if (bullets <= 0) {
      throw new Error("Shooting minigame needs at least one bullet");
    }
    this.game = game;
    this.bullets = Math.min(bullets, 3);

    const gameContainer = document.querySelector("#game-container");
    if (!gameContainer) throw new Error("Missing #game-container element");
    this.mainDiv = htmlCreate({
      backgroundImage: `url("${assetsPath}revolver-firing-board.png")`,
      id: "shooting-range",
      display: "none",
      appendTo: gameContainer,
    });

    const bulletLefts = this.randomBulletPositions();
    for (let i = 0; i < this.bullets; ++i) {
      this.bulletDivs.push(
        htmlCreate({
          backgroundImage: `url("${assetsPath}revolver-firing-particle.png")`,
          id: "bullet" + i,
          left: bulletLefts[i] + "%",
          className: "bullet",
          transition: "left " + bulletLefts[i] / bulletRange.left + "s linear",
          display: "flex",
          appendTo: this.mainDiv,
        }),
      );
    }
  }

  private randomBulletPositions(): number[] {
    const positions: number[] = [];
    while (positions.length < this.bullets) {
      let position = randIntInRange(bulletRange.left, bulletRange.right);
      position += bulletOffset - (position % bulletOffset);
      if (!positions.includes(position)) positions.push(position);
    }
    // make sure the positions are sorted by distance in ascending order, so that the animation and logic works well
    positions.sort((a, b) => a - b);
    return positions;
  }

  update(): void {}

  override manageInputs(keyman: Pick<KeyboardManager, "manageInput">): void {
    keyman.manageInput("Shoot", () => this.checkShot());
  }

  private checkShot(): void {
    // in case someone wants to shoot more shots than they have bullets
    if (this.bulletDivs.length <= this.currentBullet) {
      // IDEA - this case should play a sound of the trigger being pulled, but no bullet being struck
      return;
    }
    const bulletPosition = this.bulletDivs[this.currentBullet].getBoundingClientRect().x;
    console.log("Bullet position: " + bulletPosition);
    console.log("Borders: " + this.borders[0] + " | " + this.borders[1]);
    if (bulletPosition >= this.borders[0] && bulletPosition <= this.borders[1]) {
      ++this.successfulShots;
    }
    ++this.currentBullet;
    this.soundAgent.play("revolver-shot");
  }

  override startHook(): void {
    this.mainDiv.style.display = "flex";
    const boardData = this.mainDiv.getBoundingClientRect();
    // proposed, arbitrary values - for the given board, these borders
    // determine all bullet positions, in which the bullet touches the
    // success box (if the leftmost bullet is touching the box when the player presses a button - success)
    this.borders = [boardData.width * 0.175 + boardData.x, boardData.width * 0.22 + boardData.x];
    for (const bulletDiv of this.bulletDivs) {
      bulletDiv.classList.add("flying");
    }
  }

  override endHook(): void {
    this.mainDiv.style.display = "none";
    console.log("Successful shots: " + this.successfulShots);
  }
}

export default RevolverShootingGame;
