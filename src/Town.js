/*
  file: src/Town.js
  purpose: Define the Town class for creating Towns from presets and
           populating them with buildngs  
  authors: Szymon Nowak <https://gitlab.com/leszmak>
          Artur Gulik <https://gitlab.com/ArturGulik>
  
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

import presets from "./static/townPresets.js";
import { generateID } from "./global/utilities.js";
import Location from "./Location.js";
import Building from "./Building.js";
import { defaultTownHeight, defaultTownWidth } from "./global/consts.js";
import { genTownName } from "./nameGenerators.js";
import {tileSize} from "./global/consts.js";

class Town extends Location {
  constructor(x, y, numBldInTown = {}) {
    super(defaultTownWidth, defaultTownHeight);
    this.ID = generateID(Town);
    this.name = genTownName();
    this.x = x;
    this.y = y;
    this.numBldInTown = numBldInTown;
    this.visited = false;
    this.connectedTowns = new Array();
    this.lastPlayerPos = null;
    this.playerSpawn = {x: 3*tileSize, y: 5*tileSize};
  }
  
  createTown() {
    // see https://gitlab.com/niche-devs/destination-west/-/wikis/Technical-Documentation/Classes/Town/Town-Presets
    this.array = new Array(this.width);
    for (let x = 0; x < this.width; ++x) this.array[x] = new Array(this.height);
    let preset = presets.randomElement();
    this.placeStreets(preset);
    this.placeBuildings(preset);
    this.placeBackground('sand');
    this.placeGenericDecoration();
    this.prerender();
  }

  placeBuildings(preset) {
    let buildings = preset.buildings;
    // `buildings` holds an array with objects describing
    // building positions and sizes
    let numBlds = buildings.length;
    let requiredNumBlds = 0;
    if (this.numBldInTown.saloon !== undefined) 
      requiredNumBlds += this.numBldInTown.saloon;
    if (this.numBldInTown.sheriff !== undefined) 
      requiredNumBlds += this.numBldInTown.sheriff;
    if (this.numBldInTown.house !== undefined) 
      requiredNumBlds += this.numBldInTown.house;
    if (requiredNumBlds > numBlds) 
      requiredNumBlds = numBlds;
    let counter = 0;
    let toPlace;

    ['saloon', 'sheriff', 'house'].forEach((place) => {
      if (!this.numBldInTown[place]) toPlace = 0;
      else if (this.numBldInTown[place] + counter < numBlds)
        toPlace = this.numBldInTown[place];
      else toPlace = numBlds - counter;
      for (let i = 0; i < toPlace; i++) {
        this.placeBuilding(
          buildings[counter].xStart,
          buildings[counter].yStart,
          new Building(
            buildings[counter].xTiles,
            buildings[counter].yTiles,
            place)
        );
        counter++;
      }
    });
  }

}

export default Town;
