import { State, stateManager } from "../global/stateManager.js";

import { focusBackToPlayerTime as focusTime, dialogueParameters } from "../global/consts.js";

import Animation from "../core/Animation.js";

class DialogueDisplay extends State {
  constructor(game) {
    super(false);
    this.game = game;
    this.actions = ['Next Dialogue Line'];
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
    this.div.innerHTML = this.dialogue.formatLine(this.currentLine);
    
    this.textAnimation = new Animation(this, "currentLine.n", dialogueParameters.lettersPerSecond);
    this.textAnimation.goal = this.currentLine.what.length;
    this.textAnimation.setChangeCallback(() => {
      this.div.innerHTML = this.dialogue.formatLine(this.currentLine);
    });
  }
  setDialogue(d) {
    this.dialogue = d;
  }
  update() {
    if (!this.dialogue.loaded) return;
    if (this.currentLine === null) this.drawNextLine();

    this.textAnimation.next();
    
    /* This is weird. For now I have to use the 'Interact' action,
       but perhaps we should change that once we make state-specific keymaps */
    this.game.app.manageRequest(
      'Interact',
      () => {
	if (this.dialogue.exhausted()) {
	  // End the dialogue
	  stateManager.popState();
	}
        this.drawNextLine();
      },
      { once: true }
    );
    
  }
  startHook() {
    this.div.className = "visible";
    this.zoomBeforeDialogue = this.game.camera.zoom;
    this.game.camera.setFocusedEntity(this.dialogue.npc);
  }
  endHook() {
    this.div.className = 'hidden';
    this.game.camera.setFocusedEntity(this.dialogue.player,
				      this.zoomBeforeDialogue,
				      focusTime);
  }
}

export default DialogueDisplay;
