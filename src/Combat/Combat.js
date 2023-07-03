/*
  file: src/Combat/Combat.js
  purpose: Define the Combat class for handling fights, shootouts
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

import {difficulties} from "./Difficulty.js"

class CombatBuilder {
  constructor() {
    this.combat = new Combat()
  }
  setControlledEntity(entity) {
    this.combat.player = entity
    return this
  }
  setEnemiesArray(enemies) {
    this.combat.enemies = enemies
    return this
  }
  setBackground(sprite) {
    this.combat.background = sprite
    return this
  }
  setDifficulty(d) {
    this.combat.difficulty = difficulties[d]
    return this
  }
  build() {
    return this.combat
  }
}

class Combat {
  constructor() {
    this.player;
    this.enemies;
    this.difficulty
    this.background;
  }
}

