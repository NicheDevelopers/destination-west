/*
  file: src/Location.js
  purpose: Define virtual Location class to use the same methods in class
          Town and Travel.  
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
import Entity from "./Entity/Entity.js";
import ctx from "./global/ctx.js";
import { distance, roll } from "./global/utilities.js";
import { createCanvas } from "./global/utilities.js";
import { tileSize, percentageOfGenericDecoration as pGD, playerParameters as pp } from "./global/consts.js";

/* pathInfo keys describe the presence of paths on adjacent squares.
   The first digit describes the top-left adjacent tile. If that tile
   is a path then we represet is as a 1, otherwise as 0.
   The next digit describes the tile over the top edge and so on.
   After checking a whole row we move to the next one.
*/

const pathInfo = new Map([
  ["street", "street"],
  ["00100010", ["path-narrow-side-1","path-narrow-side-2","path-narrow-side-3"]],
  ["00100011", ["path-narrow-side-1","path-narrow-side-2","path-narrow-side-3"]],
  ["01100010", ["path-narrow-side-1","path-narrow-side-2","path-narrow-side-3"]],
  ["01110010", ["path-narrow-side-1","path-narrow-side-2","path-narrow-side-3"]], 
  ["00001010", ["path-narrrow-corner-1","path-narrrow-corner-2"]],
  ["00000010", ["path-narrow-end-1","path-narrow-end-2"]],
  ["10001010", ["path-narrow-fork-1","path-narrow-fork-2"]],
  ["10101010", ["path-narrow-crossroad-1","path-narrow-crossroad-2"]],
  ["11111111", ["path-wide-full-1"]],
  ["11111110", ["path-wide-inner-corner-1","path-wide-inner-corner-2"]],
  ["00111110", ["path-wide-side-1","path-wide-side-2"]],
  ["01111110", ["path-wide-side-1","path-wide-side-2"]],
  ["00111111", ["path-wide-side-1","path-wide-side-2"]],
  ["00001110", ["path-wide-corner-1","path-wide-corner-2"]],
  //path-wide-fork
  //["11111010","path-wide-corner-1"],
  //path-wider-fork-left
  //["11100010","path-wide-corner-1"],
  //path-wider-fork-right
  //["10100011","path-wide-corner-1"],
]);

class Location {
  constructor(width, height) {
    this.array = undefined;
    this.created = false;
    this.width = width;
    this.height = height;
    this.widthPx = this.width * tileSize;
    this.heightPx = this.height * tileSize;
    this.awaitAssets = 0;
    //temporary
    this.containers = new Array();
    this.droppedItems = new Array();
    this.npcs = new Array();
    this.decorations = new Array();
    this.focused = null;
  }

  prerender() {
    if (this.awaitAssets > 0) {
      setTimeout(() => this.prerender(), 0);
      return;
    }
    let { canvas, context: offCtx } =
      createCanvas(this.widthPx, this.heightPx);
    offCtx.clearRect(0, 0, this.widthPx, this.heightPx);

    this.drawRaw(0, 0, offCtx);
    this.image = new Image(this.widthPx, this.heightPx);
    this.image.onload = () => { this.created = true; };
    this.image.src = canvas.toDataURL('image/png');
  }

  // check if there's a builing in the 5x5 square surrounding a tile
  nearToBuilding(xPos, yPos) {
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) {
        if (xPos + i < 0 || xPos + i >= this.array.length) continue;
        if (yPos + j < 0 || yPos + j >= this.array[0].length) continue;
        if (this.array[xPos + i][yPos + j].typeName.substring(0, 9) == 'building-') return true;
      }
    return false;
  }

  /**
   * Place generic decorations according to tiles' proximity to buildings.
   * Generic decorations are objects like cacti, stones, bushes. We don't care about their placement that much.
   * Special decorations are more unique objects such as roadsigns, wells, things that shouldn't appear as often.
   * Tiles within a 5x5 square of a building are considered to be close to it.
   */
  placeGenericDecoration() {
    let rural_generic_decorations = [
      ["cactus-1x"],
      ["small-stones-1"],
      ["green-bush-1"]
    ];

    let town_generic_decorations = [
      //["roadsign", 1],
      //["stone-well", 1],
      ["big-bag-3x"],
    ];

    for (let i = 0; i < this.array.length; i++)
      for (let j = 0; j < this.array[0].length; j++) {
        if (this.array[i][j].typeName !== 'sand') continue;
        let array = null;
        
        if (this.nearToBuilding(i, j) && roll(pGD.town_percentage))
          array = town_generic_decorations;
        else if (!this.nearToBuilding(i, j) && roll(pGD.rural_percentage))
          array = rural_generic_decorations;
        
        if (array)
          this.decorations.push(new Entity("decoration-" + array.randomElement(), i * tileSize, j * tileSize));
      }
  }

  getNumOfTiles() {
    return this.array.length * this.array[0].length;
  }

  placeBackground(background) {
    let length = this.array.length;
    let height = this.array[0].length;
    for (let i = 0; i < length; i++)
      for (let j = 0; j < height; j++) {
        if (this.array[i][j] === undefined)
          this.array[i][j] = new Tile(background, i * tileSize, j * tileSize);
      }
  }

  placeBuilding(xStart, yStart, building) {
    for (let i = 0; i < building.xTiles; i++)
      for (let j = 0; j < building.yTiles; j++) {
        this.array[xStart + i][yStart + j] = building.array[i][j];
        this.array[xStart + i][yStart + j].x = xStart * tileSize + building.array[i][j].x;
        this.array[xStart + i][yStart + j].y = yStart * tileSize + building.array[i][j].y;
      }
  }

  chooseStreet(streetArray, x, y) {
    let string = '';

    console.assert(streetArray != undefined, "streetArray is undefined");
    const surrounding = [
      [0, -1], [1, -1],
      [1, 0], [1, 1], 
      [0, 1], [-1, 1], 
      [-1, 0], [-1, -1]
    ];
    surrounding.forEach(place => {
      try {
        streetArray[x + place[0]][y + place[1]] === 1 ? string += '1' : string += '0';
      }
      catch (e) {
        if (e instanceof TypeError) string += '1'; else throw e;
      }
    });

    

    for (const element of [0, 90, 180, 270]) {
      if (pathInfo.has(string)) 
        return [pathInfo.get(string).randomElement(), element];
      string = string.substring(2, 8) + string.substring(0, 2)
    }

    return [pathInfo.get('street'), 0];

  }

  placeStreets(preset) {

    let streetArray = new Array(this.width);
    for (let x = 0; x < this.width; ++x) streetArray[x] = new Array(this.height);

    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i)
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          streetArray[i][j] = 1;
        }
    });

    preset.streets.forEach((street) => {
      for (let i = street.start.x; i < street.start.x + street.width; ++i) {
        for (let j = street.start.y; j < street.start.y + street.height; ++j) {
          this.awaitAssets++;
          let nameAndDegree = this.chooseStreet(streetArray, i, j);
          if (streetArray[i][j] == 1) this.array[i][j] = new Tile(
	    nameAndDegree[0], i * tileSize, j * tileSize,
	    {
              rotation: nameAndDegree[1],
	      callback: () => {
                this.awaitAssets--;
              }
            });
        }
      }
    });
  }

  getInteractibles() {
    return this.droppedItems.concat(this.npcs).concat(this.containers);
  }

  /*
    Assign true to property `focus` of the element which is
    the closest to `point`.
  */
  updateFocus(player) {
    if (this.focused) {
      this.focused.focus = false;
      this.focused = null;
    }
    let minDist = 50.0;
    
    let testFn = player.direction.facesLeft() ? (e) => e.x <= player.x : (e) => e.x >= player.x ;
    let entities = this.getInteractibles().filter(testFn);
    
    for (let item of entities) {
      let d = distance(item, player);
      if (d < minDist) {
        minDist = d;
        this.focused = item;
      }
    }

    if (!this.focused) return;
    this.focused.focus = true;
  }
  
  draw(x = 0, y = 0, context = ctx, width = 672, height = 288) {
    if (!this.created)
      return;
    context.drawImage(this.image, x, y, width, height,
                      0, 0, width, height);
  }
  
  drawRaw(x0 = 0, y0 = 0, context = ctx) {
    for (let x = 0; x < this.array.length; ++x)
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.draw(x0 + tile.x, y0 + tile.y, context);
      }
  }
  drawDebugInfo() {
    for (let x = 0; x < this.array.length; ++x)
      for (let y = 0; y < this.array[0].length; ++y) {
        let tile = this.array[x][y];
        tile.drawDebugInfo();
      }
  }

  /* Returns two arrays:
     1. Entities that should be drawn first and depth doesn't matter.
     2. Entities where depth matters, sorted in drawing order. */
  entitiesByDepth(location, player) {
    let arr = [
      location.droppedItems,
      location.containers,
      location.npcs,
      location.decorations,
      player,
    ].flat();

    let sorted = arr.filter(e => !e.ignoreDepth)
      .sort((e1, e2) => {
	const y1 = (e1.y + e1?.relativeCenterPoint?.y) || e1.y+64;
	const y2 = (e2.y + e2?.relativeCenterPoint?.y) || e2.y+64;
	
	return y1-y2;
      });
    
    return [
      arr.filter(e => e.ignoreDepth),
      sorted
    ];
  }
}

export default Location;
