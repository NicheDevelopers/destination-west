import defaultKeybinds from "@/game/defaultKeybinds";
import { SpecialKey } from "@/engine/keybinds";
import type { Keybinds } from "@/engine/KeyboardManager";
import type { SoundKind } from "@/engine/audio/Sound";
import volumeMap from "@/game/audio/volumeMap";
import { State, stateManager } from "@/engine/stateManager";
import { createElement, htmlCreate } from "@/lib/dom";
import type Game from "@/game/Game";

class PauseMenu extends State {
  readonly game: Game;
  private customKeybinds: Keybinds = defaultKeybinds;
  private customVolumeMap: Map<SoundKind, number> = volumeMap;
  private pauseMenu: HTMLElement;
  private settingsMenu: HTMLDivElement;
  private exitMenu: HTMLDivElement;

  constructor(game: PauseMenu["game"]) {
    super(true);
    this.game = game;

    const pauseMenu = document.getElementById("pause-menu");
    if (!pauseMenu) throw new Error("Missing #pause-menu element");
    this.pauseMenu = pauseMenu;

    this.settingsMenu = createElement("div", null, null, [], {}, "settings-menu", null);
    this.fillSettingsMenu();

    this.exitMenu = createElement("div", null, null, [], {}, "exit-menu", null);
    this.fillExitMenu();

    this.pauseMenu.append(
      this.createMainButtons(),
      this.createWantedPoster(),
      this.settingsMenu,
      this.exitMenu,
    );
  }

  private createMainButtons(): HTMLDivElement {
    const pauseMenuButtonsDiv = createElement(
      "div",
      null,
      null,
      ["pause-menu-divs"],
      {},
      "pause-menu-buttons-div",
      null,
    );
    const resumeButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-resume-button",
      "Resume",
    );
    const settingsButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-settings-button",
      "Settings",
    );
    const saveButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-save-button",
      "Save",
    );
    const exitButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      {},
      "pause-menu-exit-button",
      "Exit",
    );
    pauseMenuButtonsDiv.append(resumeButton, settingsButton, saveButton, exitButton);

    resumeButton.addEventListener("click", () => {
      stateManager.toggleState(this);
    });
    settingsButton.addEventListener("click", () => {
      this.enterSettingsMenu();
    });
    exitButton.addEventListener("click", () => {
      this.enterExitMenu();
    });

    return pauseMenuButtonsDiv;
  }

  private createWantedPoster(): HTMLDivElement {
    const pauseMenuWantedDiv = createElement(
      "div",
      null,
      null,
      ["pause-menu-divs"],
      {},
      "pause-menu-wanted-div",
      null,
    );
    const pauseMenuWantedPoster = createElement(
      "div",
      null,
      null,
      [],
      {},
      "pause-menu-wanted-poster",
      null,
    );
    pauseMenuWantedDiv.append(pauseMenuWantedPoster);
    return pauseMenuWantedDiv;
  }

  private fillSettingsMenu(): void {
    const exitSettingsButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "button"],
      { position: "absolute", top: "3%", right: "3%" },
      null,
      "Return",
    );
    const settingsActionLabel = createElement(
      "div",
      null,
      null,
      [],
      { padding: "5px 0 10px 0" },
      null,
      null,
    );
    const settingsActions = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline-block" },
      null,
      "Actions:",
    );
    const settingsKeys = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline" },
      null,
      "Keys:",
    );
    const settingsSounds = createElement(
      "div",
      null,
      null,
      [],
      { width: "50%", display: "inline-block" },
      null,
      "Sounds:",
    );
    const settingsVolumes = createElement(
      "div",
      null,
      null,
      [],
      { display: "inline" },
      null,
      "Volume:",
    );
    const settingsVolumeLabel = createElement(
      "div",
      null,
      null,
      [],
      { padding: "20px 0 10px 0" },
      null,
      null,
    );

    this.settingsMenu.append(exitSettingsButton, settingsActionLabel);
    settingsActionLabel.append(settingsActions, settingsKeys);
    this.loadKeybinds();
    this.settingsMenu.append(settingsVolumeLabel);
    settingsVolumeLabel.append(settingsSounds, settingsVolumes);
    this.loadVolumeMap();

    exitSettingsButton.addEventListener("click", () => {
      this.exitSettingsMenu();
    });
  }

  private fillExitMenu(): void {
    const exitMenuPrompt = createElement(
      "div",
      null,
      null,
      [],
      { padding: "0 0 35% 0" },
      null,
      "Do you really want to exit?",
    );
    // width of the prompt minus 2 widths of buttons (buttons are now 32% in width)
    const exitMenuConfirmationButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "exit-menu-button", "button"],
      { margin: "0 48% 0 0" },
      null,
      "Yes",
    );
    const exitMenuRefusalButton = createElement(
      "button",
      null,
      null,
      ["pause-menu-button", "exit-menu-button", "button"],
      {},
      null,
      "No",
    );
    const exitMenuDiv = document.createElement("div");

    this.exitMenu.append(exitMenuDiv);
    exitMenuDiv.append(exitMenuPrompt, exitMenuConfirmationButton, exitMenuRefusalButton);

    exitMenuRefusalButton.addEventListener("click", () => {
      this.exitExitMenu();
    });
  }

  update(): void {}

  override startHook(): void {
    this.pauseMenu.style.display = "flex";
    this.game.togglePause();
  }

  override endHook(): void {
    this.pauseMenu.style.display = "none";
    this.exitMenu.style.display = "none";
    this.settingsMenu.style.display = "none";
    this.game.togglePause();
  }

  // functions displaying settings
  loadKeybinds(): void {
    for (const category in this.customKeybinds) {
      for (const [key, action] of this.customKeybinds[category]) {
        if (key instanceof SpecialKey) {
          // TODO - implement special key display in settings
          continue;
        }
        const div = htmlCreate({
          classList: "keybind-container",
          appendTo: this.settingsMenu,
        });
        htmlCreate({ innerText: action + ":", appendTo: div });
        htmlCreate({
          tagName: "button",
          classList: "pause-menu-button settings-menu-button button",
          innerText: key.capitalized(),
          appendTo: htmlCreate({ classList: "button-container", appendTo: div }),
        });
      }
    }
  }

  // function loading volumeMap
  loadVolumeMap(): void {
    for (const soundKind of this.customVolumeMap.keys()) {
      const div = createElement(
        "div",
        null,
        null,
        [],
        { padding: "5px 0 10px 0", borderBottom: "2px solid brown" },
        null,
        null,
      );
      const volume = createElement(
        "div",
        null,
        null,
        [],
        { width: "50%", display: "inline-block" },
        null,
        soundKind.capitalized() + ":",
      );
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "1";
      slider.step = "0.1";
      div.append(volume);
      div.append(slider);
      this.settingsMenu.append(div);
    }
  }

  // functions toggling settings menu
  enterSettingsMenu(): void {
    this.settingsMenu.style.display = "flex";
  }
  exitSettingsMenu(): void {
    this.settingsMenu.style.display = "none";
  }

  //functions toggling exit menu
  enterExitMenu(): void {
    this.exitMenu.style.display = "flex";
  }
  exitExitMenu(): void {
    this.exitMenu.style.display = "none";
  }
}

export default PauseMenu;
