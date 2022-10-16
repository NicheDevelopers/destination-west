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

import { createCanvas, createDiv } from "./global/utilities.js";

function drawCircle(ctx, x, y, radius, strokeWidth) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = 'black'
  ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = 'black'
  ctx.stroke()
}

function drawLine(ctx, start_x, start_y, end_x, end_y, strokeStyle, lineWidth) {
  // set line stroke and line width
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  
  // draw a red line
  ctx.beginPath();
  ctx.moveTo(start_x, start_y);
  ctx.lineTo(end_x, end_y);
  ctx.stroke();
}

class WorldMapDisplay {
  constructor(game) {
    this.game = game;
    this.div = createDiv(1344, 576, ['map-canvas-div'], {
      position: 'absolute',
      display: 'none',
      zIndex: '1'});
    this.mapCanvas = createCanvas(1344,576).canvas;
    this.mapCanvas.style.background = 'rgb(150,130,100,0.8)';
    this.div.appendChild(this.mapCanvas);
    document.getElementById('game-container').appendChild(this.div);
    this.drawnDivs= new Array(this.game.worldMap.townArray.length).fill(false);
    this.register();
  }
  
  register() {
    this.game.registerAction('Toggle Map Display');
  }

  draw() {
    let map = this.game.worldMap;
    let map_ctx = this.mapCanvas.getContext('2d');
    map_ctx.fillStyle = 'white';
    map_ctx.font = "20px Verdana";
    map_ctx.clearRect(0,0,this.mapCanvas.width, this.mapCanvas.height);
    let visibleTowns = [...new Set(this.game.worldMap.townArray
      .filter((t) => t.visited)
      .map((m) => m.connectedTowns)
      .flat()
      .concat(this.game.worldMap.townArray
      .filter((t) => t.visited)
      .map((x) => x.ID)))];

    for (let town of map.townArray) {
      map_ctx.fillStyle = 'white';
      let size;
      if (town.connectedTowns.length < 3) size = 10;
      else if (town.connectedTowns.length < 5) size = 20;
      else if (town.connectedTowns.length < 10) size = 30;
      // make the last town large
      if (town.ID === this.game.worldMap.townArray[this.game.worldMap.townArray.length-1].ID) {
	size = 30;
      }

      
      // if the town has been visited, is the current town or can be reached from the current town, draw it
      if (town.visited || this.game.worldMap.townArray.filter((t) => t.visited).map((m) => m.connectedTowns).some((e) => e.includes(town.ID))) {
	if (!this.drawnDivs[town.ID]) {
	  let d = createDiv(80, 80, [`town-div`], {
	    display: 'block',
	    position: 'absolute',
	    height: size*2 + 'px',
	    width: size * 2 + 'px',
	    left: town.x - size + 'px',
	    top: town.y - size + 'px',
	    'border-radius': '100%',
	  });
	  d.dataset.id = town.ID;
	  d.addEventListener('click', (evt) => {
	    this.game.travel(evt.target.dataset.id);
	  })
	  this.div.appendChild(d);
	  this.drawnDivs[town.ID] = true;
	}
	for (let connection of town.connectedTowns) {
	  let town2 = this.game.worldMap.getByID(connection);
	  if (town.visited && (town2.visited || visibleTowns.includes(town2.ID))) {
	    drawLine(map_ctx, town.x, town.y, town2.x, town2.y, 'black', 3);
	  }
	}
	drawCircle(map_ctx, town.x, town.y, size, 2);
      }
    }
    for (let t of visibleTowns.map((r) => this.game.worldMap.getByID(r))) {
      map_ctx.fillStyle = 'white';
      map_ctx.fillText(t.name, t.x - 50, t.y + 40);
    }
  }
  
  update() {
    this.game.manageRequest(
      'Toggle Map Display',
      () => this.toggleMapDisplayFunc(),
      {once: true}
    );
  }
  
  toggleMapDisplayFunc() {
    if (this.div.style.display !== 'none') {
      this.div.style.display = 'none';
      return;
    }
    this.draw();
    this.div.style.display = 'block';
  }
}

export default WorldMapDisplay;
