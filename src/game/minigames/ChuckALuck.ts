import { State, stateManager } from "@/engine/stateManager";
import { createElement } from "@/lib/dom";
import { randIntInRange } from "@/lib/random";
import { CHUCK_A_LUCK_PARAMETERS as cal } from "@/game/consts";
import type Game from "@/game/Game";

const diceSprites = [
  'url("img/minigame_assets/dice_1.png")',
  'url("img/minigame_assets/dice_2.png")',
  'url("img/minigame_assets/dice_3.png")',
  'url("img/minigame_assets/dice_4.png")',
  'url("img/minigame_assets/dice_5.png")',
  'url("img/minigame_assets/dice_6.png")',
];

class ChuckALuck extends State {
  readonly game: Game;
  private score = 0;
  private diceState = [6, 6, 6];
  private chosenNumbers: number[] = [];
  private mainDiv: HTMLDivElement;
  private diceDivs: HTMLDivElement[] = [];
  private scoreDiv: HTMLDivElement;

  constructor(game: ChuckALuck["game"]) {
    super(true);
    this.game = game;

    this.mainDiv = createElement("div", null, null, [], {}, "minigame-table", null);
    this.mainDiv.style.display = "none";

    this.scoreDiv = createElement(
      "div",
      null,
      null,
      ["score-text"],
      {},
      "score-text",
      "Choose up to 3 numbers.",
    );

    this.mainDiv.appendChild(this.createDiceArea());
    this.mainDiv.appendChild(this.createBettingArea());

    const gameContainer = document.querySelector("#game-container");
    if (!gameContainer) throw new Error("Missing #game-container element");
    gameContainer.appendChild(this.mainDiv);
  }

  private createDiceArea(): HTMLDivElement {
    const diceAreaDiv = createElement("div", null, null, [], {}, "dice-area", null);
    diceAreaDiv.addEventListener("click", () => {
      this.rollTheDice();
    });

    for (let i = 0; i < 3; ++i) {
      const div = createElement(
        "div",
        null,
        null,
        ["dice"],
        {
          top: `${i * (cal.diceSize + cal.diceGap)}px`,
          backgroundImage: diceSprites[this.diceState[i] - 1],
        },
        `dice-${i + 1}`,
        null,
      );
      this.diceDivs.push(div);
      diceAreaDiv.appendChild(div);
    }
    return diceAreaDiv;
  }

  private createBettingArea(): HTMLDivElement {
    const bettingAreaDiv = createElement("div", null, null, [], {}, "betting-area", null);
    for (let i = 0; i < 6; ++i) {
      //move the next div N spaces (space width = 63) and N - 1 betting spaces (betting space width = 128) to the left, loop every three iterations
      const top = `${cal.verticalOffset + (cal.bettingSpotSize + cal.verticalGap) * Math.floor(i / 3)}px`;
      //move the div two betting space heights lower(height of one = 128), increase by two betting spaces every 3 iterations (one row)
      const left = `${cal.horizontalGap * ((i % 3) + 1) + cal.bettingSpotSize * (i % 3)}px`;
      const div = createElement(
        "div",
        null,
        null,
        ["betting-spot"],
        {
          left: left,
          top: top,
        },
        `bet-on-${i + 1}`,
        null,
      );
      div.addEventListener("click", () => {
        this.addChoice(i + 1);
      });
      bettingAreaDiv.appendChild(div);
    }
    bettingAreaDiv.appendChild(this.scoreDiv);
    return bettingAreaDiv;
  }

  update(): void {}

  start(): void {
    stateManager.toggleState(this);
    this.refresh();
  }

  private refresh(): void {
    if (this.chosenNumbers.length === 0) {
      this.scoreDiv.innerText = "Choose up to 3 numbers.";
      return;
    }
    this.scoreDiv.innerText =
      "Current score: " + this.score + "\n Chosen numbers: " + this.chosenNumbers.join(", ") + ".";
  }

  private addChoice(number: number): void {
    if (this.chosenNumbers.length < 3) this.chosenNumbers.push(number);
    this.refresh();
  }

  private rollTheDice(): void {
    if (this.chosenNumbers.length === 0) {
      this.scoreDiv.innerText = "You must first choose at least one number!";
      return;
    }
    const interval = setInterval(() => {
      this.rerollDices();
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
      const multiplier = this.judgeScore();
      this.updateScoreText(multiplier);
      this.chosenNumbers.clear();
    }, 1000);
  }

  private judgeScore(): number {
    this.rerollDices();
    let multiplier = 0;
    const scoreJudge = [...this.diceState];
    for (const number of this.chosenNumbers) {
      if (scoreJudge.includes(number)) {
        this.score += 1;
        multiplier += 1;
        scoreJudge.popFirst(number);
        continue;
      }
      this.score -= 1;
    }
    return multiplier;
  }

  private rerollDices(): void {
    for (let i = 0; i < this.diceState.length; ++i) {
      this.diceState[i] = randIntInRange(1, 7);
      this.diceDivs[i].style.backgroundImage = diceSprites[this.diceState[i] - 1];
    }
  }

  private updateScoreText(multiplier: number): void {
    if (multiplier > 0) {
      const displayMultiplier = multiplier + 1;
      this.scoreDiv.innerText = "You won " + displayMultiplier + "x your bet!";
      return;
    }
    this.scoreDiv.innerText = "You lost!";
  }

  override startHook(): void {
    this.mainDiv.style.display = "flex";
  }
  override endHook(): void {
    this.mainDiv.style.display = "none";
    this.score = 0;
    this.chosenNumbers = [];
    /*
      should we set score to zero after ending game?
      now when we come back to gaming table after some time, given score is the same as in previous game
      (so score will always be the same as result of all games played in one playthrough)
      the same for chosenNumbers
    */
  }
}

export default ChuckALuck;
