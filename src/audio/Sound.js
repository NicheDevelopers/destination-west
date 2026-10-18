/*
  file: src/Sound.js
  purpose: define the Sound class - a wrapper for audio paths and kinds
  author: Michał Miłek <https://gitlab.com/mmilek>
  
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

// Improvised enum defining sound kind
const soundKind = {
  Music: "music",
  MenuMusic: "menu-music",
  Effect: "effect",
  Dialogue: "dialogue",
};

/**
 * Helper class representing a single sound object, a wrapper over HTMLAudioElement
 */
class Sound {
  constructor(src, kind) {
    this.sound = new Audio(src);
    this.kind = kind;
  }
}

export { Sound, soundKind };
