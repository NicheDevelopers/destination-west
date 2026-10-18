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

import { htmlCreate, formatError, makeErrorInfoHeader } from "../global/utilities.js";

class Browser {
  constructor(app) {
    this.app = app;
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen();
  }

  displayError(error) {
    let errorMessageBox = htmlCreate({
      id: "error-message-box",
      appendTo: document.querySelector("#game-container"),
    });

    htmlCreate({
      what: "h1",
      innerText: "An error occurred",
      appendTo: errorMessageBox,
    });

    makeErrorInfoHeader(error, errorMessageBox);

    htmlCreate({
      what: "span",
      innerText: formatError(error),
      appendTo: errorMessageBox,
    });
  }
}

const gc = document.querySelector("#game-canvas");

/**
 * The canvas rendering context for the canvas #game-canvas
 */
const ctx = gc.getContext("2d");

export function getGameCanvasSizeX() {
  return gc.scrollWidth;
}

export function getGameCanvasSizeY() {
  return gc.scrollHeight;
}

export { Browser, ctx };
