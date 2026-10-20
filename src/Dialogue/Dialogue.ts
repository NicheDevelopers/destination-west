import Stats from "@/Entity/Stats.js";
import type Equipment from "@/Equipment/Equipment.js";
import type Game from "@/game/Game.js";
import type Animation from "@/core/Animation.js";
import {
  DialogueUnit,
  DialogueLine,
  DialogueMenu,
  DialogueOperation,
  Label,
  specialLabels,
} from "./DialogueUnit.ts";

/**
 * A character taking part in a dialogue
 */
export interface Speaker {
  name: string;
  equipment: Equipment;
}

/**
 * A character the player is talking to
 */
export interface NpcSpeaker extends Speaker {
  changeStat(statName: string, changeValue: number): void;
  checkStat(statName: string): string;
}

/**
 * The state displaying a dialogue (e.g. DialogueDisplay or CombatDisplay)
 */
export interface DialogueHost {
  game: Game;
  endState(): void;
}

/**
 * A class managing the flow of a dialogue. Can be bound to a
 * DialogueDisplay with `setupDisplay()`.
 */
export class Dialogue {
  readonly player: Speaker;
  readonly npc: NpcSpeaker;

  readonly labels = new Map<string, Label>(
    [...specialLabels.keys()].map((labelName) => [labelName, new Label(labelName)]),
  );

  /**
   * The currently displayed DialogueUnit, taken from the currentLabel
   */
  private currentUnit: DialogueUnit | undefined;
  private currentLabel: Label;
  private animation: Animation | null = null;

  private display: DialogueHost | null = null;
  private contentContainer: HTMLElement | null = null;
  private endCallback: () => void = () => {};

  constructor(player: Speaker, npc: NpcSpeaker, filename = "") {
    this.player = player;
    this.npc = npc;
    this.currentLabel = this.getLabel(Label.START);

    if (filename !== "") void this.load(filename);
  }

  /**
   * Load dialogue content from a dwd file
   */
  async load(filepath: string): Promise<void> {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`Dialogue Fetch Error: ${response.status}`);
    this.fromText(await response.text());
  }

  fromText(text: string): this {
    this.parseDialogue(text);
    this.currentLabel = this.getLabel(Label.START);
    this.step();

    return this;
  }

  update(): void {
    this.animation?.next();
  }

  /**
   * Step through the dialogue, display the next DialogueUnit
   */
  step(): void {
    if (this.exhausted()) return this.endCallback();
    if (!this.currentLabel.canStep()) return;

    const nextUnit = this.currentLabel.step();

    if (nextUnit === DialogueUnit.OPERATION) return;

    this.currentUnit = nextUnit;

    this.animation = this.currentUnit?.setupAnimation(() => this.updateContainer()) ?? null;
    this.updateContainer();
  }

  /**
   * Jump to the first DialogueUnit in the provided label
   */
  gotoLabel(labelName: string): void {
    this.animation = null;
    this.currentLabel = this.getLabel(labelName);
    this.currentLabel.reset();
    this.step();
  }

  changeNpcStat(statName: string, changeValue: number): void {
    this.npc.changeStat(statName, changeValue);
    if (this.npc.checkStat(statName) === Stats.MAX) {
      return this.gotoLabel(Label.ANGER_LIMIT);
    }
    this.step();
  }

  /**
   * If contentContainer is set, update its content to match
   * the current state of the dialogue
   */
  updateContainer(): void {
    if (!this.contentContainer || !this.currentUnit) return;
    this.currentUnit.updateContent(this.contentContainer);
  }

  /**
   * Returns true if the dialogue is finished (no more content
   * can be displayed). False otherwise.
   */
  exhausted(): boolean {
    return this.currentLabel.exhausted();
  }

  /**
   * Sets up dialogue's variables to prepare it for display
   * @param display - The state managing this dialogue's display
   * @param node - A node that will be automatically
   * updated to match the current state of the dialogue.
   * @param endCallback - A callback called when this
   * dialogue is exhausted and `step()` is called.
   */
  setupDisplay(display: DialogueHost, node: HTMLElement, endCallback: () => void = () => {}): void {
    this.display = display;
    this.contentContainer = node;
    this.endCallback = endCallback;
  }

  end(): void {
    this.getDisplay().endState();
  }

  startTrade(): void {
    const display = this.getDisplay();
    this.end();
    display.game.startTransfer(this.player.equipment, this.npc.equipment, true);
  }

  startCombat(): void {
    console.log("TODO: Combat start point");
    this.end();
  }

  private getDisplay(): DialogueHost {
    if (!this.display) throw new Error(`Dialogue has no display, call setupDisplay() first`);
    return this.display;
  }

  private getLabel(labelName: string): Label {
    const label = this.labels.get(labelName);
    if (!label)
      throw new Error(
        `Attempt to go to label '${labelName}', which does not ` +
          `exist.\nExisting labels: ${[...this.labels.keys()].join(", ")}`,
      );
    return label;
  }

  private parseDialogue(text: string): void {
    const lines = text
      .split(/\r?\n/)
      .filter((line) => line)
      .map((line) =>
        line
          .replace(/ *\| */g, "|")
          .replaceAll("NPC_NAME", this.npc.name)
          .replaceAll("PLAYER_NAME", this.player.name),
      );

    let currentLabel = this.getLabel(Label.START);

    for (let line of lines) {
      if (/^[PN]/.test(line)) {
        line = line.replace(/^P\|/, `${this.player.name}|`).replace(/^N\|/, `${this.npc.name}|`);
        currentLabel.push(new DialogueLine().fromText(line));
        continue;
      }
      if (line.startsWith("|")) {
        const last = currentLabel.last;
        const menu = last instanceof DialogueMenu ? last : new DialogueMenu(this);
        if (menu !== last) currentLabel.push(menu);
        menu.addChoiceFromText(line.substring(1));
        continue;
      }
      if (/: *$/.test(line)) {
        const labelName = line.replace(/ *: */, "");
        if (this.labels.has(labelName) && specialLabels.get(labelName)?.canOverride !== true) {
          throw new Error(`Attempt to override a dialogue label: ${labelName}`);
        }

        currentLabel = new Label(labelName);
        this.labels.set(labelName, currentLabel);
        continue;
      }
      if (line.startsWith("-|")) {
        currentLabel.push(new DialogueOperation(this).fromText(line.slice(2)));
        continue;
      }
      if (/^ *#/.test(line)) {
        continue;
      }
      throw new Error(`No information on how to parse line: ${line}`);
    }
    this.verify();
  }

  /**
   * Call `Label.verify()` on every Label present in this Dialogue
   */
  verify(): void {
    for (const label of this.labels.values()) {
      label.verify(this);
    }
  }
}

export default Dialogue;
