import Tile from "./Tile.js";
import preset1 from "./static/buildingPresets.js";
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
    this.placeStreets(preset1);
    this.placeBuildings(preset1);
    this.placeBackground('sand');
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
    /*
    for (let i = 0; i < 37; i++) {
      for (let j = 5; j < 8; j++) {
        let x = new Tile('street', i * 16, j * 16);
        this.array[i][j] = x;
      }
    }
    
    for (let i = 25; i < 27; i++) {
      for (let j = 0; j < 20; j++) {
        this.array[i][j] = new Tile('street', i * 16, j * 16);
      }
    }
    */
    /*
    for (let i = 27; i < 31; i++) this.array[i][10] =
      new Tile('street', i * 16, 10 * 16);
    
    for (let i = 27; i < 31; i++) this.array[i][14] =
      new Tile('street', i * 16, 14 * 16);
    for (let i = 27; i < 31; i++) this.array[i][18] =
    new Tile('street', i * 16, 18 * 16);
    
    for (let i = 19; i < 25; i++) this.array[i][16] =
    new Tile('street', i * 16, 16 * 16);
    */
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
