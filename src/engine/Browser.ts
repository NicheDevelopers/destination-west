import type App from "./App";
import { htmlCreate, makeErrorInfoHeader } from "@/lib/dom";

class Browser {
  readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen();
  }

  displayError(error: Error): void {
    let errorMessageBox = htmlCreate({
      id: "error-message-box",
      appendTo: gameContainer,
    });

    htmlCreate({
      tagName: "h1",
      innerText: "An error occurred",
      appendTo: errorMessageBox,
    });

    makeErrorInfoHeader(error, errorMessageBox);

    htmlCreate({
      tagName: "span",
      innerText: error.message,
      appendTo: errorMessageBox,
    });
  }
}

const gameContainer = document.getElementById("game-container")!;

const gameCanvas = document.querySelector("#game-canvas") as HTMLCanvasElement;
if (!gameCanvas) throw new Error("Missing #game-canvas element");

const gameContext = gameCanvas.getContext("2d");
if (!gameContext) throw new Error("Failed to get 2D rendering context for #game-canvas");

/**
 * The canvas rendering context for the canvas #game-canvas
 */
const ctx: CanvasRenderingContext2D = gameContext;

export function getGameCanvasSizeX(): number {
  return gameCanvas.scrollWidth;
}

export function getGameCanvasSizeY(): number {
  return gameCanvas.scrollHeight;
}

export { Browser, ctx, gameCanvas, gameContainer };
