/*
  file: src/TravelDisplay.js
  purpose: Define the TravelDisplay class and Chunks class for easier displaying travel  
  authors: Szymon Nowak <https://gitlab.com/leszmak>
  
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

import Location from "./Location.js";
import { randIntInRange } from "../global/utilities.js";
import Building from "./Building.js";
import {tileSize} from "../global/consts.js";
import Portal, { PortalType } from "../Entity/Portal.js";
import { roll } from "../global/utilities.js";

// the leght of chunk must be at least 10 tiles

let buildingChance = 0.1; 

let newStreet = (x1, y1, width, height) =>
  ({ start: { x: x1, y: y1 }, width: width, height: height });

class Travel extends Location{
  constructor(game, distance, fromId, toId, background){
    super(20*(~~(distance/20)), 16);
    this.chunkWidth = 20;
    this.distance = distance;
    this.background = background ?? "sand";
    this.fromId = fromId;
    this.toId = toId;
    this.game = game;
    // Spawn player on the left for now
    this.playerSpawn = {x: 3*tileSize, y: this.heightPx - 3*tileSize};
    this.createLocation();
  }

  numberOfChunks() {
    return ~~(this.distance/this.chunkWidth)
  }
  
  createLocation(){
    this.array = new Array(this.width);
    
    for (let x = 0; x < this.width; ++x)
      this.array[x] = new Array(this.height);

    var preset = {streets: []};
    preset.streets.push(newStreet(0,this.height - 3,this.width,1)); 
    
    for(let chunk = 0; chunk < this.numberOfChunks(); chunk++){
      
        // no event
        // left building
        let yStart = this.height - 5 - randIntInRange(this.height - 5);
        if( roll(buildingChance)){
          let xStart = this.chunkWidth/2 - 5 + randIntInRange(2) + chunk*this.chunkWidth;
          this.placeBuilding(xStart, yStart, new Building(3, 2, "house"));
          preset.streets.push(newStreet(xStart+1,yStart+2 ,1,this.height-yStart-5)); 
        }
        // right building
        if( roll(buildingChance)){
          let xStart = this.chunkWidth/2 + randIntInRange(2) + chunk*this.chunkWidth;
          this.placeBuilding(xStart, yStart, new Building(3, 2, "house"));
          preset.streets.push(newStreet(xStart+1,yStart+2 ,1,this.height-yStart-4));
        }
  
    }

    this.portals.push(new Portal(this.game,
                                 "decoration-roadsign",
                                 //(this.width-3)*tileSize, (this.height-4)*tileSize,
                                 4*tileSize, (this.height-4)*tileSize,
                                 PortalType.teleport(this.fromId)));
    this.portals.push(new Portal(this.game,
                                 "decoration-roadsign",
                                 3*tileSize, (this.height-4)*tileSize,
                                 PortalType.teleport(this.toId)));
    this.placeStreets(preset);
    this.placeBackground(this.background);
    this.placeGenericDecoration();
    this.prerender();
  }
}
export default Travel;
