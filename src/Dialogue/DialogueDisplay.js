import { State, stateManager } from "../global/stateManager.js";

import { focusBackToPlayerTime as focusTime,
	 dialogueParameters } from "../global/consts.js";

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
    this.div.innerHTML = "";
    this.postDialogueMenu?.reset();
  }
  
  /**
   * Sets a dialogue to be displayed
   * @param {Dialogue} dialogue - The new dialogue
   */
  setDialogue(dialogue) {
    this.reset();
    this.dialogue = dialogue;
    this.dialogue.setupDisplay(this, this.div, () => this.endState());
  }

  update() {
    this.dialogue.update();
    
    /* This is weird. For now I have to use the 'Interact' action,
       but perhaps we should change that once we make state-specific keymaps */
    this.game.app.manageRequest(
      'Interact',
      () => {
	this.dialogue.step();
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
