/*
  file: src/minigames/ChuckALuck.js
  purpose: define the ChuckALuck class
  author: Kamil Małecki <https://gitlab.com/gaussx>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/
import { State, stateManager } from "@/global/stateManager.js";
import { createElement } from "@/utilities/dom.js";
import { randIntInRange } from "@/utilities/random.js";
import { CHUCK_A_LUCK_PARAMETERS as cal } from "@/global/consts.js";

class ChuckALuck extends State {
  constructor(game) {
    super(true);

    let gameContainer = document.querySelector("#game-container");
    this.game = game;

    this.score = 0;

    this.mainDiv = createElement("div", null, null, [], {}, "minigame-table", null);

    this.mainDiv.style.display = "none";

    this.diceState = [6, 6, 6];
    this.diceSprites = [
      'url("img/minigame_assets/dice_1.png")',
      'url("img/minigame_assets/dice_2.png")',
      'url("img/minigame_assets/dice_3.png")',
      'url("img/minigame_assets/dice_4.png")',
      'url("img/minigame_assets/dice_5.png")',
      'url("img/minigame_assets/dice_6.png")',
    ];
    this.chosenNumbers = [];

    this.diceAreaDiv = createElement("div", null, null, [], {}, "dice-area", null);
    this.diceAreaDiv.addEventListener("click", () => {
      this.rollTheDice();
    });
    this.diceDivs = [];

    for (let i = 0; i < 3; ++i) {
      let div = createElement(
        "div",
        null,
        null,
        ["dice"],
        {
          top: `${i * (cal.diceSize + cal.diceGap)}px`,
          backgroundImage: this.diceSprites[this.diceState[i] - 1],
        },
        `dice-${i + 1}`,
        null,
      );
      this.diceDivs.push(div);
      this.diceAreaDiv.appendChild(div);
    }

    this.bettingAreaDiv = createElement("div", null, null, [], {}, "betting-area", null);
    this.bettingDivs = [];
    for (let i = 0; i < 6; ++i) {
      //move the next div N spaces (space width = 63) and N - 1 betting spaces (betting space width = 128) to the left, loop every three iterations
      let top = `${cal.verticalOffset + (cal.bettingSpotSize + cal.verticalGap) * ~~(i / 3)}px`;
      //move the div two betting space heights lower(height of one = 128), increase by two betting spaces every 3 iterations (one row)
      let left = `${cal.horizontalGap * ((i % 3) + 1) + cal.bettingSpotSize * (i % 3)}px`;
      let div = createElement(
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
      this.bettingDivs.push(div);
      this.bettingAreaDiv.appendChild(div);
    }

    this.scoreDiv = createElement(
      "div",
      null,
      null,
      ["score-text"],
      {},
      "score-text",
      "Choose up to 3 numbers.",
    );
    this.bettingAreaDiv.appendChild(this.scoreDiv);

    this.mainDiv.appendChild(this.diceAreaDiv);
    this.mainDiv.appendChild(this.bettingAreaDiv);
    gameContainer.appendChild(this.mainDiv);
  }

  manageInput(keyman) {
    keyman.manageRequest("Toggle Pause Menu", () => stateManager.toggleState(this));
  }

  update() {}

  start() {
    stateManager.toggleState(this);
    this.refresh();
  }

  refresh() {
    if (this.chosenNumbers.length === 0) {
      this.renderWithoutBet();
      return;
    }
    this.renderWithBet();
  }

  renderWithoutBet() {
    this.scoreDiv.innerText = "Choose up to 3 numbers.";
    this.update();
  }

  renderWithBet() {
    let text = "Current score: " + this.score + "\n Chosen numbers: ";
    for (let i = 0; i < this.chosenNumbers.length; ++i) {
      if (i + 1 === this.chosenNumbers.length) {
        text += this.chosenNumbers[i] + ".";
        continue;
      }
      text += this.chosenNumbers[i] + ", ";
    }
    this.scoreDiv.innerText = text;
    this.update();
  }

  addChoice(number) {
    if (this.chosenNumbers.length < 3) this.chosenNumbers.push(number);
    this.refresh();
  }

  rollTheDice() {
    if (this.chosenNumbers.length === 0) {
      this.scoreDiv.innerText = "You must first choose at least one number!";
      return;
    }
    let interval = setInterval(() => {
      this.rerollDices();
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
      let multiplier = this.judgeScore();
      this.updateScoreText(multiplier);
      this.chosenNumbers.clear();
    }, 1000);
  }

  judgeScore() {
    this.rerollDices();
    let multiplier = 0;
    let scoreJudge = [...this.diceState];
    for (let number of this.chosenNumbers) {
      // console.log(number, this.chosenNumbers);
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

  rerollDices() {
    for (let i = 0; i < this.diceState.length; ++i) {
      this.diceState[i] = randIntInRange(1, 7);
      this.diceDivs[i].style.backgroundImage = this.diceSprites[this.diceState[i] - 1];
    }
  }

  updateScoreText(multiplier) {
    if (multiplier > 0) {
      let display_multiplier = multiplier + 1;
      this.scoreDiv.innerText = "You won " + display_multiplier + "x your bet!";
      return;
    }
    this.scoreDiv.innerText = "You lost!";
  }

  startHook() {
    this.mainDiv.style.display = "flex";
  }
  endHook() {
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
