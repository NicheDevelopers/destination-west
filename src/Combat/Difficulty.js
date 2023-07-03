/*
  file: src/Difficulty.js
  purpose: Define the Difficulty enum and DifficultyLevel class for modifying enemy stats
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

const Difficulty = {
  Cowboy: 0,
  Outlaw: 1,
  Gunslinger: 2,
  ManWithNoName: 3
}

class DifficultyLevel {
  constructor(d) {
    //placeholder
    this.d = d
  }
}

const difficulties = [
  new DifficultyLevel(0),
  new DifficultyLevel(1),
  new DifficultyLevel(2),
  new DifficultyLevel(3),
]

export { Difficulty, difficulties }
