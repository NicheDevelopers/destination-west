import { State } from "@/global/stateManager.js";
import { randIntInRange } from "@/utilities/random.js";
import { htmlCreate } from "@/utilities/dom.js";
import AudioPlayer from "@/audio/AudioPlayer.js";

class RevolverShootingGame extends State {
  constructor(game, bullets) {
    super(true);

    let gameContainer = document.querySelector("#game-container");
    this.game = game;
    this.mainDiv = htmlCreate({
      "background-image": `url("img/battle_assets/revolver_minigame/revolver-firing-board.png")`,
      id: "shooting-range",
      appendTo: gameContainer,
    });
    this.mainDiv.style.display = "none";

    // array of floats, whose values determine whether a shot was accurate or not
    this.borders = [];
    this.soundAgent = new AudioPlayer();

    this.bullets = bullets >= 3 ? 3 : bullets;
    if (this.bullets <= 0) {
      error("Shooting minigame initiated with a negative count of bullets!");
    }
    this.currentBullet = 0; // index of the first bullet which hasn't been interacted with yet
    this.successfulShots = 0;

    this.bulletDivs = [];
    //17.5% should be the leftmost bound of accepting a shot as a success, 22 - rightmost
    let bulletRange = { left: 40, right: 80 };
    let bulletOffset = 10; // we don't want more than one bullet in the same space
    // array of randomized bullet positions
    let bulletlefts = [];
    for (let i = 0; i < this.bullets; ++i) {
      let position = randIntInRange(bulletRange.left, bulletRange.right);
      position += bulletOffset - (position % bulletOffset);
      while (bulletlefts.includes(position)) {
        position = randIntInRange(bulletRange.left, bulletRange.right);
        position += bulletOffset - (position % bulletOffset);
      }
      bulletlefts.push(position);
    }
    // make sure the positions are sorted by distance in ascending order, so that the animation and logic works well
    bulletlefts.sort((a, b) => a - b);

    for (let i = 0; i < this.bullets; ++i) {
      let bulletid = "bullet" + i;
      this.bulletDivs.push(
        htmlCreate(
          // no, we can't just use colored divs, i want those to look like actual bullets
          // which someone will need to draw (i can do it, i just need time)
          {
            "background-image": `url("img/battle_assets/revolver_minigame/revolver-firing-particle.png")`,
            id: bulletid,
            left: bulletlefts[i] + "%",
            className: "bullet",
            transition: "left " + bulletlefts[i] / bulletRange.left + "s linear",
            appendTo: this.mainDiv,
          },
        ),
      );
      this.bulletDivs[i].style.display = "flex";
    }
  }

  start() {
    console.log("Startuje");
  }
  update() {}

  manageInputs(keyman) {
    keyman.manageInput("Shoot", () => this.checkShot());
  }

  checkShot() {
    // in case someone wants to shoot more shots than they have bullets
    if (this.bulletDivs.length <= this.currentBullet) {
      // IDEA - this case should play a sound of the trigger being pulled, but no bullet being struck
      return;
    }
    let bulletPosition = this.bulletDivs[this.currentBullet].getBoundingClientRect().x;
    console.log("Bullet position: " + bulletPosition);
    console.log("Borders: " + this.borders[0] + " | " + this.borders[1]);
    if (bulletPosition >= this.borders[0] && bulletPosition <= this.borders[1]) {
      ++this.successfulShots;
    }
    ++this.currentBullet;
    this.soundAgent.play("revolver-shot");
  }

  startHook() {
    this.mainDiv.style.display = "flex";
    console.log(this.mainDiv.getBoundingClientRect());
    let boardData = this.mainDiv.getBoundingClientRect();
    // proposed, arbitrary values - for the given board, these borders
    // determine all bullet positions, in which the bullet touches the
    // success box (if the leftmost bullet is touching the box when the player presses a button - success)
    this.borders.push(boardData.width * 0.175 + boardData.x, boardData.width * 0.22 + boardData.x);
    // let disappear = boardData.width * 0.15 + boardData.x;
    console.log(this.mainDiv);
    for (let i = 0; i < this.bulletDivs.length; ++i) {
      console.log(this.bulletDivs[i].getBoundingClientRect().left);
      this.bulletDivs[i].classList.add("flying");
    }
  }

  endHook() {
    this.mainDiv.style.display = "none";
    console.log("Successful shots: " + this.successfulShots);
    return this.successfulShots;
  }
}

export default RevolverShootingGame;
