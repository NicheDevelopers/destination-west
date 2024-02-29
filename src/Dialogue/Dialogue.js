import Stats from "../Entity/Stats.js";
import { DialogueUnit, DialogueLine, DialogueMenu,
	 DialogueOperation, Label, specialLabels } from "./DialogueUnit.js";

/**
 * A class managing the flow of a dialogue. Can be bound to a
 * DialogueDisplay with `setupDisplay()`.
 */
class Dialogue {
  constructor(filename, player, npc) {
    this.player = player;
    this.npc = npc;
    
    this.currentUnit = null;
    this.currentLabel = null;
    this.animation = null;
    this.labels = new Map(
      specialLabels.keysArray().map((labelName) => {
	return [labelName, new Label(labelName)];
      })
    );

    this.contentContainer = null;
    this.endCallback = () => {};
    
    this.load(filename);
  }
  
  /**
   * Loads the dialogue content from a dwd file
   */
  load(filepath) {
    fetch(filepath)
      .then(r => {
        if (!r.ok)
          throw new Error("Dialogue Fetch Error: " + r.status);
        return r.text();
      })
      .then(text => {
	this.parseDialogue(text);
	this.currentLabel = this.labels.get(Label.START);
	this.step();
      });
  }
  
  update() {
    if (this.animation)
      this.animation.next();
  }
    
  /**
   * Step through the dialogue, display the next DialogueUnit
   */
  step() {
    if (this.exhausted()) return this.endCallback();
    if (!this.currentLabel.canStep()) return;

    let nextUnit = this.currentLabel.step();

    if (nextUnit === DialogueUnit.OPERATION)
      return;
        
    this.currentUnit = nextUnit;

    this.animation = this.currentUnit?.setupAnimation(
      () => this.updateContainer());
    this.updateContainer();
  }

  /**
   * Jump to the first DialogueUnit in the provided label
   */
  gotoLabel(labelName) {
    this.animation = null;
    if (!this.labels.has(labelName))
      throw `Attempt to go to label '${labelName}', which does not ` +
      `exist.\nExisting labels: ${this.labels.keysArray()}`;
    this.currentLabel = this.labels.get(labelName);
    this.currentLabel.reset();
    this.step();
  }

  changeNpcStat(statName, changeValue) {
    this.npc.changeStat(statName, changeValue);
    if (this.npc.checkStat(statName) === Stats.MAX) {
      return this.gotoLabel(Label.ANGER_LIMIT)
    }
    this.step();
  }

  /**
   * If contentContainer is set, update its content to match
   * the current state of the dialogue
   */
  updateContainer() {
    if (!this.contentContainer || !this.currentUnit) return;
    this.currentUnit.updateContent(this.contentContainer);
  }
  
  /**
   * Returns true if the dialogue is finished (no more content
   * can be displayed). False otherwise.
   */
  exhausted() {
    return this.currentLabel.exhausted();
  }

  /**
   * Sets up dialogue's variables to prepare it for display
   * @param display {DialogueDisplay} - The state managing this
   * dialogue's display
   * @param node {HTML...Element} - A node that will be automatically
   * updated to match the current state of the dialogue.
   * @param endCallback {function} - A callback called when this
   * dialogue is exhausted and `step()` is called.
   */
  setupDisplay(display, node, endCallback=()=>{}) {
    this.display = display;
    this.contentContainer = node;
    this.endCallback = endCallback;
  }

  end() {
    this.display.endState();
  }
  
  startTrade() {
    this.end();
    this.display.game.startTransfer(
      this.player.equipment,
      this.npc.equipment, true);
  }

  startCombat() {
    console.log("TODO: Combat start point");
    this.end();
  }
  
  parseDialogue(text) {
    let lineSplit = (/\r\n/).test(text) ? '\r\n' : '\n';
    const lines = text.split(lineSplit)
      .filter(line => line)
      .map(line => line
      .replace(/[ ]*\|[ ]*/g, "|")
      .replaceAll("NPC_NAME", this.npc.name)
      .replaceAll("PLAYER_NAME", this.player.name));
    
    let currentLabel = this.labels.get(Label.START);
    
    for (let i=0, line=lines[0]; i<lines.length; ++i, line=lines[i]) {
      if (/^P|^N/.test(line)) {
	line = line.replace(/^P\|/, `${this.player.name}|`)
	  .replace(/^N\|/, `${this.npc.name}|`);
	currentLabel.push(new DialogueLine().fromText(line));
	continue;
      }
      if (/^[|]/.test(line)) {
	if (!currentLabel.last?.isDialogueMenu()) {
	  currentLabel.push(new DialogueMenu(this));
	}
	line = line.substring(1);
	currentLabel.last.addChoiceFromText(line);
	continue;
      }
      if (/:[ ]*$/.test(line)) {
	let labelName = line.replace(/[ ]*:[ ]*/, "");
	if (this.labels.has(labelName) &&
	  specialLabels.get(labelName)?.canOverride !== true) {
	  throw `Attempt to override a dialogue label: ${labelName}`;
	}
	
	this.labels.set(labelName, new Label(labelName));
	currentLabel = this.labels.get(labelName);
	continue;
      }
      if (/^-[|]/.test(line)) {
	line = line.slice(2);
	currentLabel.push(new DialogueOperation(this).fromText(line));
	continue;
      }
      if (/^[ ]*#/.test(line)) {
	continue;
      }
      throw `No information on how to parse line: ${line}`;
    }
    this.verify();
  }

  /**
   * Call `Label.verify()` on every Label present in this Dialogue
   */
  verify() {
    for (const label of this.labels) {
      label.last.verify(this);
    }
  }
}

export default Dialogue;
