import { State, stateManager } from "../global/stateManager.js";

class DialogueDisplay extends State {
  constructor(game) {
    super(false);
    this.game = game;
    this.actions = ['Next Dialogue Line']
    this.dialogue = null;
    this.currentLine = null;
    let div = document.createElement('div');
    div.id = 'dialogue-div';
    div.className = 'hidden';
    this.div = div;
    let gc = document.getElementById('game-container');
    gc.appendChild(this.div);
  }
  drawNextLine() {
    let line = this.dialogue.next();
    if (line === null) return;
    this.currentLine = line;
  }
  setDialogue(d) {
    this.dialogue = d;
  }
  update() {
    this.div.innerHTML = this.dialogue.formatLine(this.currentLine);
    this.currentLine.n = (this.currentLine.n + 1).clamp(0, this.currentLine.what.length);
    if (this.dialogue.exhausted()) return;
    /* This is weird. For now I have to use the 'Interact' action,
       but perhaps we should change that once we make state-specific keymaps */
    this.game.app.manageRequest(
      'Interact',
      () => {
        this.drawNextLine();
      },
      { once: true }
    );
    
  }
  startHook() {
    this.drawNextLine();
    this.div.className = "visible";
  }
  endHook() {
    this.div.className = 'hidden';
  }
}

export default DialogueDisplay;
