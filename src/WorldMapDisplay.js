/*
  file: src/WorldMap.js
  purpose: Define the WorldMapDisplay class for drawing and displaying the WorldMap
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

import { createCanvas, createElement } from "./global/utilities.js";
import { State, stateManager } from "./global/stateManager.js";
import { mapParameters, townSizes, worldMapDisplay as wmd } from "./global/consts.js";

class WorldMapDisplay extends State {
  constructor(game) {
    super(false);
    this.game = game;
    this.actions = ['Toggle Map Display'];
    this.div = createElement(
      'div', mapParameters.displayWidth, mapParameters.displayHeight, ['map-canvas-div'], {
      position: 'absolute',
      display: 'none',
      zIndex: '1'
    });
    this.mapCanvas = createCanvas(mapParameters.displayWidth, mapParameters.displayHeight).canvas;
    this.mapCanvas.id = 'map-canvas';
    //this.mapCanvas.style.background = 'rgba(150,130,100, 0.8)';
    this.div.appendChild(this.mapCanvas);
    document.getElementById('game-container').appendChild(this.div);
    this.drawnDivs = new Array(this.game.worldMap.locations.length).fill(false);
  }

  draw() {
    let map = this.game.worldMap;
    let map_ctx = this.mapCanvas.getContext('2d');
    map_ctx.fillStyle = 'white';
    map_ctx.font = "20px Verdana";
    map_ctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    for (let i = this.div.childNodes.length - 1; i >= 0; i--) {
      const childNode = this.div.childNodes[i];
      if (childNode.tagName !== 'CANVAS') {
        this.div.removeChild(childNode);
      }
    }
    let visibleTowns =
      [...new Set(
        this.game.worldMap.locations
          .filter((t) => t.visited)
          .map((m) => m.connectedLocations)
          .flat()
          .concat(this.game.worldMap.locations
            .filter((t) => t.visited)
            .map((x) => x.ID)))];

    // Draw all connections so that they get completely overlapped by towns
    for (const location of map.locations) {
      for (let connection of location.connectedLocations) {
        let other = this.game.worldMap.getByID(connection);
        if (location.visited && (other.visited || visibleTowns.includes(other.ID))) {
          drawLine(map_ctx, location.x, location.y, other.x, other.y, 'black', 3);
        }
      }
    }

    for (let town of map.locations) {
      map_ctx.fillStyle = 'white';
      let size = this.computeTownSize(town);

      // if the town has been visited, is the current town or can be reached from the current town, draw it
      if (town.visited ||
        this.game.worldMap.locations
          .filter((t) => t.visited)
          .map((m) => m.connectedLocations)
          .some((e) => e.includes(town.ID))) {
        if (this.game.currentTown.connectedLocations?.includes(town.ID) && town.ID !== this.game.currentTown.ID) {
          let d = createElement('div', 80, 80, [`town-div`], {
            display: 'block',
            position: 'absolute',
            height: size * 2 + 'px',
            width: size * 2 + 'px',
            left: town.x - size + 'px',
            top: town.y - size + 'px',
            'border-radius': '100%'
          });
          d.dataset.id = town.ID;
          d.addEventListener('click', (evt) => {
            this.game.travel(evt.target.dataset.id);
          })
          this.div.appendChild(d);
        }
        //this.drawnDivs[town.ID] = true;
        let townColor = 'black';
        if (this.game.currentTown.ID == town.ID) townColor = 'green';
        if (this.game.currentTown.connectedLocations?.includes(town.ID)) townColor = 'red';
        drawCircle(map_ctx, town.x, town.y, size, 2, townColor);
      }

    }
    for (let t of visibleTowns.map((r) => this.game.worldMap.getByID(r))) {
      map_ctx.fillStyle = 'white';
      map_ctx.fillText(t.name, t.x + wmd.townNameOffsetX, t.y + wmd.townNameOffsetY);
    }
  }

computeTownSize(town) {
  // make the last town large
  if (town.ID === this.game.worldMap.locations.last.ID)
    return townSizes.large;
  if (town.connectedLocations.length < wmd.lowConnection) return townSizes.small;
  else if (town.connectedLocations.length < wmd.mediumConnection) return townSizes.medium;
  else if (town.connectedLocations.length < wmd.highConnection) return townSizes.large;
}

update() {
  this.game.app.manageRequest(
    'Toggle Map Display',
    () => stateManager.toggleState(this),
    { once: true }
  );
}

startHook() {
  this.draw();
  this.div.style.display = 'block';
}
endHook() {
  this.div.style.display = 'none';
}
}

function drawCircle(ctx, x, y, radius, strokeWidth, color) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = color;
  ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
}

function drawLine(ctx, start_x, start_y, end_x, end_y, strokeStyle, lineWidth) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(start_x, start_y);
  ctx.lineTo(end_x, end_y);
  ctx.stroke();
}

export default WorldMapDisplay;
