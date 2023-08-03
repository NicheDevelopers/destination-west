import { randIntInRange, resetIdFor } from "./global/utilities.js";
import { mapParameters as mp } from "./global/consts.js"
import Town from "./Town.js";

function distance([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

class WorldMap {
  constructor() {
    while (true) {
      this._generateLocations(mp.minLocations, mp.maxLocations);
      this._connectLocations();
      if (this._locationsConnected()) break;
    }
  }

  getByID(id) {
    if (id > this.locations.length - 1 || id < 0) {
      throw `WorldMap: no town with ID ${id} - locations length is ${this.locations.length}`;
    }
    return this.locations[id];
  }
  
  _generateLocations(min, max) {
    resetIdFor(Town);
    let numOfLocations = randIntInRange(min, max);
    let locations = new Array();

    for (let i = 0; i < numOfLocations; i++) {
      let [x, y] = this._getValidCoordinates(locations)
      locations.push(new Town(x, y, { sheriff: 1, house: 2, saloon: 11 }));
    }
    this.locations = locations;
  }

  _connectLocations() {
    for (let location of this.locations) {
      let nearby = this.locations
        .filter((l) => distance([l.x, l.y], [location.x, location.y]) < mp.minDistanceForConnection)
        .filter((l) => l.ID != location.ID)
        .map((l) => l.ID);
      location.connectedLocations = nearby;
    }
  }

  _locationsConnected() {
    return this._dfs(this.locations).length == this.locations.length
  }

  intoNeighborList() {
    let map = new Map();
    for (let location of this.locations) {
      map.set(location.ID, location.connectedLocations);
    }
    return map;
  }

  _dfs() {
    let g = this.intoNeighborList();
    let visited = [this.locations[this.locations.length - 1].ID]
    const dfsUtil = (g, start) => {
      visited.push(start)
      for (let v of g.get(start)) {
        if (!visited.includes(v)) {
          dfsUtil(g, v);
        }
      }
    }
    let start = 0;
    dfsUtil(g, start);
    return visited;
  }

  _getValidCoordinates(existingLocations) {
    while (true) {
      let [x, y] = [randIntInRange(mp.paddingX, mp.displayWidth - mp.paddingX),
      randIntInRange(mp.paddingY, mp.displayHeight - mp.paddingY)];
      if (existingLocations.none((t) =>
        distance([t.x, t.y], [x, y]) < mp.minDistanceBetweenLocations)) {
        return [x, y];
      }
    }
  }

}

export default WorldMap;
