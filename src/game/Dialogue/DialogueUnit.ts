import Animation from "@/engine/Animation";
import { DIALOGUE_PARAMETERS } from "@/game/consts";
import { ButtonList } from "@/lib/ButtonList";
import type Dialogue from "./Dialogue";

/**
 * An effect a DialogueUnit or a menu choice has on the dialogue
 */
export type DialogueAction = (dialogue: Dialogue) => void;

/**
 * A single element read from a dwdialogue file, practically a state
 * that the DialogueDisplay is in.
 * Can represent a single line of dalogue or a menu of dialogue options
 * Manages its own animations and updates to reduce the responsibility
 * of DialogueDisaplay (or other states using it) to calling an update function every frame
 */
export abstract class DialogueUnit {
  /**
   * Create and return an animation of this DialogueUnit
   * Optionally set the changeCallback. Return null if no
   * animation is provided for this DialogueUnit.
   */
  setupAnimation(_changeCallback: () => void): Animation | null {
    return null;
  }

  /**
   * Fills the provided node's innerHTML with the current
   * state of this DialogueUnit
   * @param node - the node to fill
   */
  updateContent(_node: HTMLElement): void {}

  /**
   * Is this unit immediately skippable with the 'Next Dialogue Line'
   * action?
   */
  skippable(): boolean {
    return true;
  }

  /**
   * Test if the Dialogue Unit has been initialized properly.
   * Throw an error if not.
   */
  verify(_dialogue: Dialogue): void {}

  reset(): void {}

  /**
   * A static value returned by `Label.step()` after an operation was called.
   * When that happens it means that the dialogue's `Dialogue.step()` function
   * was called by the operation and the ongoing `Dialogue.step()` should
   * not overwrite the contents of `this.currentUnit` but simply return.
   */
  static readonly OPERATION: unique symbol = Symbol("Dialogue Operation");
}

export class DialogueLine extends DialogueUnit {
  /**
   * The number of currently displayed letters of `text`
   */
  n = 0;
  /**
   * The speaker of the line, eg. "Player" or "Ol' Benjamin"
   */
  who: string;
  text: string;

  constructor(who = "", text = "") {
    super();
    this.who = who;
    this.text = text;
  }

  /**
   * Sets up the line to match the given text written in the dwd format
   * (`who|text`). Returns `this` to enable chaining and in-place
   * construction using this method
   */
  fromText(text: string): this {
    [this.who = "", this.text = ""] = text.split("|");
    this.reset();
    return this;
  }

  override setupAnimation(changeCallback: () => void): Animation {
    const animation = new Animation(this, "n", DIALOGUE_PARAMETERS.lettersPerSecond);
    animation.goal = this.text.length;
    animation.setChangeCallback(changeCallback);
    return animation;
  }

  override updateContent(node: HTMLElement): void {
    node.innerHTML = `${this.who}: ${this.text.substring(0, this.n)}`;
  }

  override reset(): void {
    this.n = 0;
  }
}

export class DialogueMenu extends DialogueUnit {
  /**
   * Non-special labels the choices of this menu lead to
   */
  private readonly destLabels: string[] = [];
  private readonly menu: ButtonList;

  constructor(dialogue: Dialogue) {
    super();
    this.menu = new ButtonList({
      callbackArgument: dialogue,
    });
  }

  override skippable(): boolean {
    return false;
  }

  override updateContent(node: HTMLElement): void {
    node.innerHTML = "";
    this.menu.appendTo(node);
  }

  /**
   * Add a choice written in the dwd format (`choice|destination label`)
   */
  addChoiceFromText(text: string): void {
    const [choice = "", destLabel = ""] = text.split("|");
    const special = specialLabels.get(destLabel);

    let action: DialogueAction;
    if (special) {
      action = special.enter;
    } else {
      this.destLabels.push(destLabel);
      action = (dialogue) => dialogue.gotoLabel(destLabel);
    }
    this.menu.add(choice, action);
  }

  override verify(dialogue: Dialogue): void {
    for (const destLabel of this.destLabels)
      if (!dialogue.labels.has(destLabel))
        throw new Error(
          `DialogueMenu can lead to a label that does ` +
            `not exist in the dialogue: '${destLabel}'`,
        );
  }
}

/**
 * A DialogueUnit representing an operation (a `goto` or `stat`)
 */
export class DialogueOperation extends DialogueUnit {
  private readonly dialogue: Dialogue;
  private action: DialogueAction | null = null;

  constructor(dialogue: Dialogue) {
    super();
    this.dialogue = dialogue;
  }

  call(): void {
    if (!this.action)
      throw new Error(`DialogueOperation was called before being set up with fromText`);
    this.action(this.dialogue);
  }

  /**
   * Sets up the operation to match the given text written in the dwd
   * format (`operation args...`). Returns `this` to enable chaining and
   * in-place construction using this method
   */
  fromText(text: string): this {
    const [operation = "", ...args] = text.split(" ");

    const special = specialLabels.get(operation);
    if (special) {
      this.action = special.enter;
      return this;
    }

    const ordinary = dialogueOperations.get(operation);
    if (ordinary) {
      this.action = ordinary(args.join(" "));
      return this;
    }
    throw new Error(`Unrecognized operation: '${operation}'`);
  }

  static readonly GOTO = "goto";
  static readonly STAT = "stat";
}

/**
 * An iterable collection of Dialogue Units.
 */
export class Label {
  readonly name: string;
  readonly units: DialogueUnit[] = [];
  private n = -1;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Is the currently displayed Unit skippable?
   */
  canStep(): boolean {
    return this.n < 0 || this.units[this.n].skippable();
  }

  /**
   * Get the next Unit in this label. Increments a built-in
   * counter.
   */
  step(): DialogueUnit | undefined | typeof DialogueUnit.OPERATION {
    if (!this.canStep()) throw new Error(`Attempt to step through a non skippable dialogue unit`);

    const unit = this.units[++this.n];
    if (unit instanceof DialogueOperation) {
      unit.call();
      return DialogueUnit.OPERATION;
    }
    return unit;
  }

  /**
   * Is this label exhausted?
   * A label is exhausted when there is no more content to show
   * and the current unit is skippable (using `step` would try to load
   * an non existent unit). If the last unit is not skippable, the label
   * is not exhausted (as some user interaction other than `step` is needed).
   */
  exhausted(): boolean {
    return this.canStep() && this.nextUnit === undefined;
  }

  push(...units: DialogueUnit[]): void {
    this.units.push(...units);
  }

  get last(): DialogueUnit | undefined {
    return this.units.at(-1);
  }

  /**
   * The unit that will be used on the next call to `step()`.
   */
  get nextUnit(): DialogueUnit | undefined {
    return this.units[this.n + 1];
  }

  /**
   * Call `DialogueUnit.verify()` on every Unit present in this label
   */
  verify(dialogue: Dialogue): void {
    for (const unit of this.units) {
      unit.verify(dialogue);
    }
  }

  reset(): void {
    this.n = -1;
    for (const unit of this.units) {
      unit.reset();
    }
  }

  static readonly START = "START";
  static readonly TRADE = "TRADE";
  static readonly END = "END";
  static readonly COMBAT = "COMBAT";
  static readonly ANGER_LIMIT = "ANGER_LIMIT";
}

interface SpecialLabel {
  /**
   * Can the label be redefined in a dwd file?
   */
  canOverride?: boolean;
  /**
   * Called when the dialogue jumps to the label
   */
  enter: DialogueAction;
}

/**
 * Special labels are labels that exist in the dialogue
 * by default. Jumps to them don't require a `goto` keyword.
 * Some of them are initiated automatically (START at the
 * beginning of the dialogue or ANGER_LIMIT when the npc's
 * ANGER_LIMIT has been reached).
 */
export const specialLabels = new Map<string, SpecialLabel>([
  [Label.START, { enter: (dialogue) => dialogue.gotoLabel(Label.START) }],
  [Label.TRADE, { enter: (dialogue) => dialogue.startTrade() }],
  [Label.END, { enter: (dialogue) => dialogue.end() }],
  [Label.COMBAT, { enter: (dialogue) => dialogue.startCombat() }],
  [
    Label.ANGER_LIMIT,
    {
      canOverride: true,
      enter: (dialogue) => dialogue.gotoLabel(Label.ANGER_LIMIT),
    },
  ],
]);

/**
 * Dialogue operations describe how operations are executed
 * in a dialogue. Each one creates a DialogueAction from the
 * operation's arguments text.
 */
export const dialogueOperations = new Map<string, (args: string) => DialogueAction>([
  [DialogueOperation.GOTO, (labelName) => (dialogue) => dialogue.gotoLabel(labelName)],
  [
    DialogueOperation.STAT,
    (args) => {
      const [statName = "", changeValue = ""] = args.split(" ");
      return (dialogue) => dialogue.changeNpcStat(statName.toLowerCase(), parseFloat(changeValue));
    },
  ],
]);
