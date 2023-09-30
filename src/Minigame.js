import { State, stateManager } from "./global/stateManager.js"
import ctx, { getGameCanvasSizeX, getGameCanvasSizeY } from "./global/ctx.js"
import { randIntInRange } from "./global/utilities.js";
import AudioPlayer from "./AudioPlayer.js";
import { chuckALuck } from "./global/consts.js";

class Minigame extends State {
  constructor(game) {
    super(true);

    let gameContainer = document.querySelector("#game-container");
    this.game = game;

    this.score = 0;

    this.mainDiv = document.createElement("div");
    this.mainDiv.id = "minigame-table";
    this.mainDiv.style.display = "none";

    this.diceState = [6, 6, 6];
    this.diceSprites = ['url("img/minigame_assets/dice_1.png")',
                        'url("img/minigame_assets/dice_2.png")', 
                        'url("img/minigame_assets/dice_3.png")', 
                        'url("img/minigame_assets/dice_4.png")', 
                        'url("img/minigame_assets/dice_5.png")', 
                        'url("img/minigame_assets/dice_6.png")'];
    this.chosenNumbers = [];
    
    this.diceAreaDiv = document.createElement("div");
    this.diceAreaDiv.id = "dice-area";
    this.diceDivs = [];

    for(let i = 0; i < 3; ++i){
      this.diceDivs.push(document.createElement("div"));
      this.diceDivs[i].id = "dice-" + (i+1).toString();
      this.diceDivs[i].classList.add("dice");
      this.diceDivs[i].style.top = i * (chuckALuck.diceSize + chuckALuck.diceGap)+ "px";
      this.diceDivs[i].style.backgroundImage = this.diceSprites[this.diceState[i] - 1];
      this.diceDivs[i].addEventListener("click", () => {this.rollTheDice()});
      this.diceAreaDiv.appendChild(this.diceDivs[i]);

    }

    this.bettingAreaDiv = document.createElement("div");
    this.bettingAreaDiv.id = "betting-area";
    this.bettingDivs = [];
    for(let i = 0; i < 6; ++i){
      this.bettingDivs.push(document.createElement("div"));
      this.bettingDivs[i].id = "bet-on-" + (i + 1).toString();
      this.bettingDivs[i].classList.add("betting-spot");
      this.bettingDivs[i].style.left = (chuckALuck.horizontalGap * (i % 3 + 1) + chuckALuck.bettingSpotSize * (i % 3)) + "px";
      //move the next div N spaces (space width = 63) and N - 1 betting spaces (betting space width = 128) to the left, loop every three iterations
      this.bettingDivs[i].style.top = (chuckALuck.verticalOffset + (chuckALuck.bettingSpotSize + chuckALuck.verticalGap) * (~~(i / 3))) + "px";
      this.bettingDivs[i].addEventListener("click", () => {this.addChoice(i + 1)});
      //move the div two betting space heights lower(height of one = 128), increase by two betting spaces every 3 iterations (one row)
      this.bettingAreaDiv.appendChild(this.bettingDivs[i]);
    }

    this.scoreDiv = document.createElement("div");
    this.scoreDiv.id = "score-text";
    this.scoreDiv.innerText = "Choose up to 3 numbers.";
    this.bettingAreaDiv.appendChild(this.scoreDiv)

    this.mainDiv.appendChild(this.diceAreaDiv);
    this.mainDiv.appendChild(this.bettingAreaDiv);
    gameContainer.appendChild(this.mainDiv);
  }
  /**
     Function run every tick this state is active
  */
  update() {
    this.game.app.manageRequest(
      'Toggle Pause Menu',
      () => stateManager.toggleState(this),
      { once: true }
    );
  }
  
  start() {
    stateManager.toggleState(this);
    this.refresh()
  }

  refresh() {
    if(this.chosenNumbers.length > 0){
      let text = "Current score: " + this.score.toString() + ". Chosen numbers: ";
      for(let i = 0; i < this.chosenNumbers.length; ++i){
        if(i + 1 === this.chosenNumbers.length){
          text += this.chosenNumbers[i].toString() + ".";
          continue;
        }
        text += this.chosenNumbers[i].toString() + ", ";
      }
      this.scoreDiv.innerText = text;
    }
    else{
      this.scoreDiv.innerText = "Choose up to 3 numbers.";
    }
    this.update();
  }

  addChoice(number){
    if(this.chosenNumbers.length < 3)
      this.chosenNumbers.push(number);
    this.refresh();
  }

  rollTheDice(){
    if(this.chosenNumbers.length === 0){
      this.scoreDiv.innerText = "You must first choose at least one number!";
      return;
    }
    let interval = setInterval(() => {
      for(let i = 0; i < this.diceState.length; ++i){
        this.diceState[i] = randIntInRange(1, 7);
        this.diceDivs[i].style.backgroundImage = this.diceSprites[this.diceState[i] - 1];
      }
    }, 10);
    setTimeout(() => {
      clearInterval(interval);
      for(let i = 0; i < this.diceState.length; ++i){
        this.diceState[i] = randIntInRange(1, 7);
        this.diceDivs[i].style.backgroundImage = this.diceSprites[this.diceState[i] - 1];
      }
      this.currentMultiplier = 0;
      let scoreJudge = [...this.diceState];
      for(let number of this.chosenNumbers){
        console.log(number, this.chosenNumbers);
        if(scoreJudge.indexOf(number) > -1){
          this.score += 1;
          this.currentMultiplier += 1;
          scoreJudge.popFirst(number);
          continue;
        }
        this.score -= 1;
      }
      this.chosenNumbers.length = 0;
      if(this.currentMultiplier > 0) {
        this.scoreDiv.innerText = "You won " + this.currentMultiplier.toString() + ":1!";
        return;
      }
      this.scoreDiv.innerText = "You lost!";
    }, 1000);
  }

  startHook() {
    this.mainDiv.style.display = "flex";
  }
  endHook() {
    this.mainDiv.style.display = "none";
  }
}

export default Minigame;
