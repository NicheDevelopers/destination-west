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

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
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
    this.register();
    this.mapCanvas = document.querySelector('#map-canvas');
    this.mapCanvas.style.display = 'none';
  }
  
  register() {
    this.game.registerAction('Toggle Map Display');
  }

  draw() {
    let map = this.game.worldMap;
    let map_ctx = this.mapCanvas.getContext('2d');
    map_ctx.fillStyle = 'white';
    //map_ctx.font = "15px Arial";

    for (let town of map.townArray) {
      let size;
      if (town.connectedTowns.length < 3) size = 4;
      else if (town.connectedTowns.length < 5) size = 10;
      else if (town.connectedTowns.length < 10) size = 12;
      
      drawCircle(map_ctx, town.x, town.y, size, 'black', 'black', 2);
      map_ctx.fillText(town.name, town.x+5, town.y-10);
      
      for (let connection of town.connectedTowns) {
	let town2 = this.game.worldMap.getID(connection);
	drawLine(map_ctx, town.x, town.y, town2.x, town2.y, 'black', 1);
      }
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
    this.mapCanvas = document.getElementById('map-canvas');
    if (this.mapCanvas.style.display !== 'none') {
      this.mapCanvas.style.display = 'none';
    } else {
      this.draw();
      this.mapCanvas.style.display = 'block';
    }
  }
}

export default WorldMapDisplay;
