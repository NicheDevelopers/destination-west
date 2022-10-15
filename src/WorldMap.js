/*
  file: src/WorldMap.js
  purpose: define the WorldMap class containing an array of all Towns
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

import {randIntInRange} from "./global/utilities.js";
import Town from "./Town.js";
import {genTownName} from "./nameGenerators.js";

// Determine if two towns can be connected without the connection crossing any other connection
function canConnect(l1, l2, i, j) {
  let townA_ID = l1[i].ID;
  let townB_ID = l2[j].ID;
  for (let t = 0; t < l1.length; t++) {
    if (l1[t].ID < townA_ID) {
      for (let u = 0; u < l1[t].connectedTowns.length; u++) {
        if (l1[t].connectedTowns[u] > townB_ID) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Connect two layers
 */
// the last condition in the `if` statement is so we can avoid weird looking connections
// between far-away towns
function connectLayers(l1, l2, chanceOfConnection) {
  for (let i = 0; i < l1.length; i++) {
    for (let j = 0; j < l2.length; j++) {
      if (canConnect(l1, l2, i, j) && Math.random() < chanceOfConnection &&
	l2[j].ID - l1[i].ID <= 3) {
	l1[i].connectedTowns.push(l2[j].ID);
        l2[j].connectedTowns.push(l1[i].ID);
      }
    }
  }
}

function connectInLayer(l1, chanceOfConnection) {
  for (let i = 0; i < l1.length - 1; i++) {
    let town = l1[i];
    let nextTown = l1[i + 1];
    if (Math.random() < chanceOfConnection) {
      town.connectedTowns.push(nextTown.ID);
      nextTown.connectedTowns.push(town.ID);
    }
  }
}

// Check if there is a town connected only to the previous layer,
// meaning that you cannot go to neither a town in current or next layer,
// backtracking would be necessary if there was, make a connection if necessary
function makeFallbackConnectionsInLayer(l1, l2) {
  let townIDsInBothLayers = l1.concat(l2).map(t => t.ID);
  for (let i = 0; i < l1.length; i++) {
    const town = l1[i];
    if (!town.connectedTowns.some(id => townIDsInBothLayers.includes(id))) {
      // make connection in layer
      let otherTown;
      if (i !== l1.length - 1) {
        otherTown = l1[i + 1];
      } else {
        otherTown = l1[i - 1];
      }
      town.connectedTowns.push(otherTown.ID);
      otherTown.connectedTowns.push(town.ID);
    }
  }
}

// Check if l1 connects to l2 and make a connection if it doesn't
function layersAreConnected(l1, l2) {
  let connectionsInLayer1 = new Array();
  l1.forEach(t => {
    connectionsInLayer1.push(...t.connectedTowns)
  });
  const townsInLayer2 = l2.map((t) => t.ID);
  return connectionsInLayer1.some(r => townsInLayer2.includes(r));
}

// Choose two random towns in different layers and connect them
function makeFallbackConnectionBetweenLayers(l1, l2) {
  const randomLayer1Town = l1[Math.floor(Math.random() * l1.length)];
  const randomLayer2Town = l2[Math.floor(Math.random() * l2.length)];
  randomLayer1Town.connectedTowns.push(randomLayer2Town.ID);
  randomLayer2Town.connectedTowns.push(randomLayer1Town.ID);
}

/**
 * Fill 'x' and 'y' attributes of Towns in this.townArray
 * for later distance calculation and display
 */
function positionTowns(numOfLayers, width, height, towns) {
  const horizontalSegmentWidth = Math.floor(width / numOfLayers);
  let rightBorder = width;
  let leftBorder = rightBorder;
  let processedLayer = 0;
  // for every layer
  while (leftBorder - horizontalSegmentWidth >= 0) {
    rightBorder = leftBorder;
    leftBorder -= horizontalSegmentWidth;
    // get towns in processed layer
    let townsInLayer = towns.filter((t) => t.layer === processedLayer);
    // horizontal boundaries are set
    let topBorder = height;
    let segmentHeight = Math.floor(height / townsInLayer.length);
    let bottomBorder = height - segmentHeight;

    for (let i = 0; i < townsInLayer.length; i++) {
      let town = townsInLayer[i];
      // if it's the starting or final town, make sure it's somewhat centered
      if (processedLayer === 0 || processedLayer === numOfLayers - 1) {
        const middle = height / 2;
        const deviation = height / 4;
        topBorder = middle + deviation;
        bottomBorder = middle - deviation;
      }
      // center everything
//      let x = leftBorder + horizontalSegmentWidth/2;
      // let y = bottomBorder + segmentHeight/2;
      let deviationX = horizontalSegmentWidth/3;
      let deviationY = segmentHeight/3;
      let x = Math.floor(randIntInRange(leftBorder + deviationX, rightBorder - deviationX));
      let y = Math.floor(randIntInRange(bottomBorder + deviationY, topBorder - deviationY));
      town.x = x;
      town.y = y;
      topBorder = bottomBorder;
      bottomBorder -= segmentHeight;
    }
    processedLayer++;
  }
}


/**
 * Class for creating a world map containing every town
 */
class WorldMap {
  /**
   * # Create a world map
   @param {number} numOfLayers - number of layers to be generated
   @param {number} chanceOfConnectionBetweenLayers - chance of connection between two towns on different layers, if the connection wouldn't cross another connection
   @param {number} chanceOfConnectionInLayer - chance of connection between two towns on the same layer
   @param {number} minTownsInLayer - minimum number of Towns in a layer
   @param {number} maxTownsInLayer - maximum number of Town in a layer
   @param {number} width - width of the map canvas
   @param {number} height - height of the map canvas
   */
  constructor(numOfLayers,
    chanceOfConnectionBetweenLayers,
    chanceOfConnectionInLayer,
    minTownsInLayer,
    maxTownsInLayer,
    width,
    height
	     ) {
    while(true) {
      this.townArray = this.createTowns(numOfLayers,
    chanceOfConnectionBetweenLayers,
    chanceOfConnectionInLayer,
    minTownsInLayer,
    maxTownsInLayer,
    width,
    height);
      if (this.isConnected()) break;
    }
  }

  createTowns(numOfLayers,
    chanceOfConnectionBetweenLayers,
    chanceOfConnectionInLayer,
    minTownsInLayer,
    maxTownsInLayer,
    width,
    height) {
    // Return a new Town array of a random length
    let townID = 0;
    const newLayerArray = (layer) => {
      let count = randIntInRange(minTownsInLayer, maxTownsInLayer);
      let l = new Array();
      for (let i=0; i<count; i++) {
	l.push(new Town(genTownName(0.4), undefined, undefined, layer, townID++, {}));
      }
      return l;
    }

    let townArray = new Array();

    // Create a starting town
    let startingTown = new Town(genTownName(0.4), undefined, undefined, 0, townID++, {});
    townArray.push(startingTown);

    // Create layer no. 1
    let prevLayer = newLayerArray(1);
    prevLayer.forEach((t) => t.connectedTowns.push(0));
    connectInLayer(prevLayer, chanceOfConnectionInLayer);
    townArray.push(...prevLayer);

    // Create layers no. 2-numOfLayers
    for (let layer = 2; layer <= numOfLayers; layer++) {
      let currLayer = newLayerArray(layer);
      connectInLayer(currLayer, chanceOfConnectionInLayer);
      connectLayers(prevLayer, currLayer, chanceOfConnectionBetweenLayers);
      if (!layersAreConnected(prevLayer, currLayer)) {
        makeFallbackConnectionBetweenLayers(prevLayer, currLayer);
      }
      makeFallbackConnectionsInLayer(prevLayer, currLayer);
      townArray.push(...currLayer);
      prevLayer = currLayer;
    }

    // Create a final town
    let finalTown = new Town(genTownName(0.4), undefined, undefined, ++numOfLayers, townID++, {});
    townArray.push(finalTown);

    // Connect starting and final town with all towns in the neighboring layer
    townArray.map((t) => {
      if (t.layer === numOfLayers - 1) {
        t.connectedTowns.push(finalTown.ID);
      }
      if (t.layer === 0) {
        t.connectedTowns.push(...townArray.filter((u) => {
            return u.layer === 1;
          })
          .map((o) => o.ID));
      }
      if (t.layer === numOfLayers) {
        t.connectedTowns.push(...townArray.filter((u) => {
          return u.layer === numOfLayers-1;
        }).map((o) => o.ID))
      }
    });

    // Fill the 'x' and 'y' attributes of each town
    // numOfLayers+2 because: those in the middle + zero layer + final layer
    positionTowns(numOfLayers + 2, width, height, townArray);
    return townArray;
  }
  
  // return a hash map HashMap<int, [int]>
  intoNeighborList() {
    let map = new Map();
    for (let town of this.townArray) {
      map.set(town.ID, town.connectedTowns);
    }
    return map;
  }

  DFS() {
    let g = this.intoNeighborList();
    let visited = [this.townArray[this.townArray.length-1].ID]
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

  isConnected() {
    return this.DFS().length == this.townArray.length
  }

  /**
   * Debug print the WorldMap
   */
  print() {
    this.townArray.forEach((town) => {
      console.log(town)
    });
  }

  getByID(ID) {
    if (ID > this.townArray.length-1 || ID < 0) {
      throw `WorldMap: no town with ID ${ID} - townArray length is ${this.townArray.length}`;
    }
    return this.townArray[ID];
  }
}

export default WorldMap;
