/*
  file: src/Browser.js
  purpose: define the Browser class for dealing with browser related matters
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/

import type App from "@/App.js";
import { htmlCreate, makeErrorInfoHeader } from "@/utilities/dom.js";

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
      appendTo: document.querySelector("#game-container"),
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

const gc = document.querySelector("#game-canvas") as HTMLCanvasElement;
if (!gc) throw new Error("Missing #game-canvas element");

const gameContext = gc.getContext("2d");
if (!gameContext) throw new Error("Failed to get 2D rendering context for #game-canvas");

/**
 * The canvas rendering context for the canvas #game-canvas
 */
const ctx: CanvasRenderingContext2D = gameContext;

export function getGameCanvasSizeX(): number {
  return gc.scrollWidth;
}

export function getGameCanvasSizeY(): number {
  return gc.scrollHeight;
}

export { Browser, ctx };
