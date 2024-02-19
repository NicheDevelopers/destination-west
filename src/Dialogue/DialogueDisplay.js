import { State, stateManager } from "../global/stateManager.js";

import { focusBackToPlayerTime as focusTime,
	 dialogueParameters } from "../global/consts.js";

import Animation from "../core/Animation.js";

import { htmlCreate, ButtonList } from "../global/utilities.js";

class DialogueDisplay extends State {
  constructor(game, options={}) {
    super(false);
    this.game = game;
        
    this.div = htmlCreate({
      id: 'dialogue-div',
      classList: 'hidden',
      appendTo: document.getElementById('game-container')
    });
    /**
       A ButtonList displayed after the dialogue.
     */
    this.postDialogueMenu = null;
    
    this.reset();
  }
  /**
     Sets a ButtonList that will be displayed after the dialogue.
     @param {ButtonList} buttonList - The button list to display after
     the dialogue
  */
  setPostDialogueMenu(buttonList) {
    this.postDialogueMenu = buttonList;
  }
  /**
   * Brings the DialogueDisplay to its initial state
   */
  reset() {
    this.dialogue = null;
    this.currentLine = null;
    this.div.innerHTML = "";
    this.postDialogueMenu?.clear();
  }
  
  endState() {
    stateManager.popState();
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

  /**
   * Sets a dialogue to be displayed
   * @param {Dialogue} dialogue - The new dialogue
   * @param {ButtonList} postDialogueMenu - Optional. A menu to display
   * after the dialogue
   */
  setDialogue(dialogue, postDialogueMenu) {
    this.reset();
    this.dialogue = dialogue;
    this.postDialogueMenu = postDialogueMenu ?? null;
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
	  if (this.postDialogueMenu) {
	    this.textAnimation.finish();
	    this.div.innerHTML = "";
	    this.postDialogueMenu.appendTo(this.div);
	  }
	  else this.endState();
	  return;
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
