import { State } from "../global/stateManager.js";
import { FOCUS_BACK_TO_PLAYER_TIME as focusTime } from "../global/consts.js";
import { htmlCreate } from "../utilities/dom.js";
import type { KeyboardManager } from "../core/KeyboardManager.js";
import type Camera from "../core/Camera.js";
import type Game from "../game/Game.js";
import type Dialogue from "./Dialogue.ts";

class DialogueDisplay extends State {
  readonly game: Game;
  private readonly div: HTMLElement;
  private dialogue: Dialogue | null = null;
  private zoomBeforeDialogue: number | undefined;

  constructor(game: Game) {
    super();
    this.game = game;

    this.div = htmlCreate({
      id: "dialogue-div",
      classList: "hidden",
      appendTo: document.getElementById("game-container"),
    });
    this.reset();
  }

  reset(): void {
    this.dialogue = null;
    this.div.innerHTML = "";
  }

  setDialogue(dialogue: Dialogue): void {
    this.reset();
    this.dialogue = dialogue;
    this.dialogue.setupDisplay(this, this.div, () => this.endState());
  }

  override manageInputs(keyman: Pick<KeyboardManager, "manageInput">): void {
    keyman.manageInput("Next Dialogue Line", () => {
      this.getDialogue().step();
    });
  }

  update(): void {
    this.getDialogue().update();
  }

  override startHook(): void {
    this.div.className = "visible";
    this.zoomBeforeDialogue = this.camera.zoom;
    this.camera.setFocusedEntity(this.getDialogue().npc);
  }

  override endHook(): void {
    this.div.className = "hidden";
    this.camera.setFocusedEntity(this.getDialogue().player, this.zoomBeforeDialogue, focusTime);
  }

  /**
   * The game's camera, created when the game is initialized
   */
  private get camera(): Camera {
    if (!this.game.camera) throw new Error(`Game camera is not initialized`);
    return this.game.camera;
  }

  private getDialogue(): Dialogue {
    if (!this.dialogue)
      throw new Error(`DialogueDisplay has no dialogue, call setDialogue() first`);
    return this.dialogue;
  }
}

export default DialogueDisplay;
