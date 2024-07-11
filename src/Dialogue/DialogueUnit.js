import Animation from "../core/Animation.js";
import {
  focusBackToPlayerTime as focusTime,
  dialogueParameters
} from "../global/consts.js";
import { ButtonList } from "../global/utilities.js";

/**
 * A single element read from a dwdialogue file, practically a state
 * that the DialogueDisplay is in.
 * Can represent a single line of dalogue or a menu of dialogue options
 * Manages its own animations and updates to reduce the responsibility
 * of DialogueDisaplay (or other states using it) to calling an update function every frame
 */
export class DialogueUnit {
  constructor() { }

  /**
   * Create and return an animation of this DialogueUnit
   * Optionally set the changeCallback. Return null if no
   * animation is provided for this DialogueUnit.
   */
  setupAnimation(changeCallback) {
    return null;
  }

  /**
   * Fills the provided node's innerHTML with the current
   * state of this DialogueUnit
   * @param node - the node to fill
   */
  updateContent(node) { }

  /**
   * Is this unit immediately skippable with the 'Next Dialogue Line'
   * action?
   */
  skippable() {
    return true;
  }

  /**
   * Sets up the object to match the given text written in the dwd format.
   * Returns `this` to enable chaining and in-place construction using
   * this method
   */
  fromText(text) { }

  /**
   * Test if the Dialogue Unit has been initialized properly.
   * Throw an error if not.
   */
  verify(dialogue) { }

  isDialogueMenu() {
    return this.constructor.name === DialogueMenu.name;
  }

  isDialogueOperation() {
    return this.constructor.name === DialogueOperation.name;
  }

  /**
   * Bring this Unit to its initial state
   */
  reset() {
  }

  /**
   * A static value returned by `Label.step()` after an operation was called.
   * When that happens it means that the dialogue's `Dialogue.step()` function
   * was called by the operation and the ongoing `Dialogue.step()` should
   * not overwrite the contents of `this.currentUnit` but simply return.
   */
  static OPERATION = "Dialogue Operation";
}

/**
 * A DialogueUnit representing a single dialogue text line
 */
export class DialogueLine extends DialogueUnit {
  constructor(who, text) {
    super();
    /**
     * who {string} The speaker of the line, eg. "Player" or "Ol' Benjamin"
     */
    this.who = who;
    this.text = text;
    this.reset();
  }
  fromText(text) {
    [this.who, this.text] = text.split('|');
    this.n = 0;
    return this;
  }
  setupAnimation(changeCallback) {
    let animation = new Animation(this, "n", dialogueParameters.lettersPerSecond);
    animation.goal = this.text.length;
    animation.setChangeCallback(changeCallback);
    return animation;
  }
  updateContent(node) {
    node.innerHTML = `${this.who}: ${this.text.substring(0, this.n)}`;
  }
  reset() {
    this.n = 0;
  }
}

/**
 * A DialogueUnit representing a dialogue menu with options
 */
export class DialogueMenu extends DialogueUnit {
  constructor(dialogue) {
    super();
    this.player = dialogue.player;
    this.npc = dialogue.npc;

    this.choices = [];
    this.callbacks = [];
    this.destLabels = [];

    this.menu = new ButtonList({
      callbackArgument: dialogue
    });
  }

  skippable() {
    return false;
  }

  updateContent(node) {
    node.innerHTML = "";
    this.menu.appendTo(node);
  }

  addChoiceFromText(text) {
    let [choice, destLabel] = text.split('|');
    this.choices.push(choice);

    let special = specialLabels.get(destLabel);

    if (special) {
      this.callbacks.push((dialogue) => {
        dialogue[special.fnName](...special.args ?? []);
      });
    }
    else {
      this.destLabels.push(destLabel);
      this.callbacks.push((dialogue) => {
        dialogue.gotoLabel(destLabel);
      });
    }
    this.menu.add(this.choices.last, this.callbacks.last);
  }

  fromText() {
    throw new Error(`DialogueMenu choices should be added with addChoiceFromText`);
  }

  verify(dialogue) {
    for (const destLabel of this.destLabels)
      if (!dialogue.labels.has(destLabel))
        throw new Error(`DialogueMenu can lead to a label that does ` +
        `not exist in the dialogue: '${destLabel}'`);
  }
}

/**
 * A DialogueUnit representing an operation (a `goto` or `stat`)
 */
export class DialogueOperation extends DialogueUnit {
  constructor(dialogue) {
    super();
    this.dialogue = dialogue;
    this.operation = null;
    this.args = null;
  }

  call() {
    if (!this.dialogue[this.operation])
      throw new Error(`Dialogue has no method named '${this.operation}' to call.`);
    this.dialogue[this.operation](...this.args);
  }

  fromText(text) {
    text = text.split(' ');
    let operation = text.first;
    let args = text.slice(1).join(' ');

    let special = specialLabels.get(operation);
    if (special) {
      this.operation = special.fnName;
      this.args = special.args ?? [];
      return this;
    }

    let ordinary = dialogueOperations.get(operation);
    if (ordinary) {
      this.operation = ordinary.fnName;
      this.args = ordinary.createArguments(args);
      return this;
    }
    throw new Error(`Unrecognized operation: '${operation}'`);
  }

  static GOTO = "goto";
  static STAT = "stat";
}

/**
 * An iterable collection of Dialogue Units.
 */
export class Label {
  constructor(name) {
    this.name = name;
    this._n = -1;
    this.units = [];
  }
  /**
   * Is the currently displayed Unit skippable?
   */
  canStep() {
    return this._n < 0 || this.units[this._n].skippable();
  }

  /**
   * Get the next Unit in this label. Increments a built-in
   * counter.
   */
  step() {
    if (!this.canStep())
      throw new Error(`Attempt to step through a non skippable dialogue unit`);

    if (this.nextUnit.isDialogueOperation()) {
      this.units[++this._n].call();
      return DialogueUnit.OPERATION;
    }
    return this.units[++this._n];
  }

  /**
   * Is this label exhausted?
   * A label is exhausted when there is no more content to show
   * and the current unit is skippable (using `step` would try to load
   * an non existent unit). If the last unit is not skippable, the label
   * is not exhausted (as some user interaction other than `step` is needed).
   */
  exhausted() {
    return this.canStep() && this.nextUnit === undefined;
  }

  /**
   * Push elements to the units array of the label
   */
  push(...args) {
    this.units.push(...args);
  }

  /**
   * An accessor to the `units.last` element.
   */
  get last() {
    return this.units.last;
  }

  /**
   * The unit that will be used on the next call to `step()`.
   */
  get nextUnit() {
    return this.units[this._n + 1];
  }

  /**
   * Call `DialogueUnit.verify()` on every Unit present in this label
   */
  verify(dialogue) {
    for (const unit of this.units) {
      unit.verify(dialogue);
    }
  }

  /**
   * Bring this Label to its initial state
   */
  reset() {
    this._n = -1;
    for (const unit of this.units) {
      unit.reset();
    }
  }

  static START = "START";
  static TRADE = "TRADE";
  static END = "END";
  static COMBAT = "COMBAT";
  static ANGER_LIMIT = "ANGER_LIMIT";
}

/**
 * Special labels are labels that exist in the dialogue
 * by default. Jumps to them don't require a `goto` keyword.
 * Some of them are initiated automatically (START at the
 * beginning of the dialogue or ANGER_LIMIT when the npc's
 * ANGER_LIMIT has been reached).
 */
export const specialLabels = new Map([
  [
    Label.START, {
      fnName: 'gotoLabel',
      args: [Label.START]
    }
  ],
  [
    Label.TRADE, {
      fnName: 'startTrade'
    }
  ],
  [
    Label.END, {
      fnName: 'end'
    }
  ],
  [
    Label.COMBAT, {
      fnName: 'startCombat'
    }
  ],
  [
    Label.ANGER_LIMIT, {
      canOverride: true,
      fnName: 'gotoLabel',
      args: [Label.ANGER_LIMIT]
    }
  ]
]);

/**
 * Dialogue operations describe how operations are executed
 * in a dialogue
 */
export const dialogueOperations = new Map([
  [
    DialogueOperation.GOTO, {
      fnName: 'gotoLabel',
      createArguments(text) {
        return [text];
      }
    }
  ],
  [
    DialogueOperation.STAT, {
      fnName: 'changeNpcStat',
      createArguments(text) {
        text = text.split(' ');
        return [text[0].toLowerCase(), parseFloat(text[1])];
      }
    }
  ]
]);
