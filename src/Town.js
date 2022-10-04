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

import Tile from "./Tile.js";
import presets from "./static/townPresets.js";
import {randIntInRange} from "./global/utilities.js";

class Town {
  constructor(name, x, y, layer, ID, numBldInTown = {}) {
    this.layer = layer;
    this.ID = ID;
    this.name = name;
    this.x = x;
    this.y = y;
    this.numBldInTown = numBldInTown;
    this.visited = false;
    this.connectedTowns = new Array();
    this.array = undefined;
  }
  createTown() {
    this.array = this.town1();
  }
  town1() {
    // look https://gitlab.com/niche-devs/destination-west/-/wikis/Technical-Documentation/Classes/Town/Town-Presets
    this.array = new Array(42);
    for (let x = 0; x < 42; ++x) {
      this.array[x] = new Array(20);
    }
    let preset = presets[randIntInRange(0,presets.length)];
    this.placeStreets(preset);
    this.placeBuildings(preset);
    this.placeBackground('sand');
    this.placeDecoration();
    return this.array;
  }
  
  nearToBuilding(xPoz,yPoz){
    for(let i=-1; i<2; i++){
      for(let j=-1; j<2; j++){
        if(xPoz===0) continue;
        if(xPoz===this.array.length-1) continue;
        if(yPoz===0) continue;
        if(yPoz===this.array[0].length-1) continue;
        if(this.array[xPoz+i][yPoz+j].typeName.substring(0,9)=='building-') return true;
      }
    }
    return false;
  }

  placeDecoration(){
    let decorations = ["cactus-3x", "small-stone-3x", "big-stone-1x", "small-dry-bush-left-1x", "small-dry-bush-right-1x", "big-dry-grass-1x", "small-dry-grass-left-1x", "small-dry-grass-right-1x"];
    let length = this.array.length;
    let height = this.array[0].length;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < height; j++) {
        if (this.array[i][j].typeName === 'sand' &&  randIntInRange(1,15) === 1 && this.nearToBuilding(i,j)===false)
	  this.array[i][j] = new Tile("decoration-" + decorations[randIntInRange(0,decorations.length)], i * 16, j * 16);
      }
    }
    return this.array;
  }

  placeBackground(background) {
    let length = this.array.length;
    let height = this.array[0].length;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < height; j++) {
        if (this.array[i][j] === undefined)
	  this.array[i][j] = new Tile(background, i * 16, j * 16);
      }
    }
    return this.array;
  }
  placeBuilding(xStart, yStart, building) {
    for (let i = 0; i < building.xTiles; i++) {
      for (let j = 0; j < building.yTiles; j++) {
	this.array[xStart + i][yStart + j] = building.array[i][j];
	this.array[xStart + i][yStart + j].x = xStart * 16 + building.array[i][j].x;
	this.array[xStart + i][yStart + j].y = yStart * 16 + building.array[i][j].y;
      }
    }
  }
  
  placeStreets(preset) {
    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i){
	for (let j = street.start.y; j < street.start.y + street.height; ++j){
	  this.array[i][j] = new Tile('street', i*16, j*16);
	}
      }
    });
  }
  
  placeBuildings(preset) {
    let buildings = preset.buildings;
    // `buildings` holds an array with objects describing
    // building positions and sizes
    let numBlds = buildings.length;
    let requiredNumBlds = 0;
    if (this.numBldInTown.saloon !== undefined) requiredNumBlds +=
      this.numBldInTown.saloon;
    if (this.numBldInTown.sheriff !== undefined) requiredNumBlds +=
      this.numBldInTown.sheriff;
    if (this.numBldInTown.house !== undefined) requiredNumBlds +=
      this.numBldInTown.house;
    if (requiredNumBlds > numBlds) requiredNumBlds = numBlds;
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
class Building {
  constructor(xTiles, yTiles, buildingType) {
    this.xTiles = xTiles;
    this.yTiles = yTiles;
    this.buildingType = buildingType;
    this.array = new Array(this.xTiles);
    for (let x = 0; x < this.xTiles; ++x) {
      this.array[x] = new Array(this.yTiles);
    }
    this.create();
  }
  createTile(name, x, y) {
    this.array[x][y] = new Tile('building-' + this.buildingType +
      "-" + name, x * 16, y * 16);
    this.array[x][y].walkable = false;
  }
  create() {
    let min = {
      x: 0,
      y: 0
    };
    let max = {
      x: this.xTiles - 1,
      y: this.yTiles - 1
    };
    this.createTile('leftwall', min.x, max.y);
    this.createTile('rightwall', max.x, max.y);
    this.createTile('door', max.x / 2 | 0, max.y);
    for (let x = 1; x < max.x; x++) {
      if (this.array[x][max.y] !== undefined) continue;
      if (randIntInRange(0,7) === 1) {
	this.createTile('barrels', x, max.y);
	continue;
      }
      this.createTile('wall', x, max.y);
    }
    for (let y = 1; y < max.y; y++) {
      this.createTile('leftwall', min.x, y);
      this.createTile('rightwall', max.x, y);
      for (let x = 1; x < max.x; x++) {
        if (this.array[x][y] !== undefined) continue;
	let r = randIntInRange(0,6);
        if (r === 4){
	  this.createTile('window', x, y);
	  continue;
	}
	if (r === 5){
	  this.createTile('smallwindow', x, y);
	  continue;
	}
        this.createTile('wall', x, y);
      }
    }
    this.createTile('leftroof', min.x, min.y);
    this.createTile('rightroof', max.x, min.y);
    if (max.x === 2) {
      this.createTile('roofdecoration', 1, min.y);
      return;
    }
    this.createTile('lefthighroof', min.x + 1, min.y);
    this.createTile('righthighroof', max.x - 1, min.y);
    if (max.x === 3) return;
    if (max.x === 4) {
      this.createTile('highroof', 2, min.y);
      return;
    }
    this.createTile('lefthighroof', min.x + 2, min.y);
    this.createTile('righthighroof', max.x - 2, min.y);
  }
}
export default Town;
