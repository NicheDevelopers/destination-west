/*
  file: src/Hitbox.js
  purpose: define the Hitbox class; provide a simple interface
           for collision management
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
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
import { ctx } from "../core/Browser.js";
import { tileSize } from "../global/consts.js";
import { pointToTileCoord, ObjectSet } from "../global/utilities.js";
import { directions, Direction } from "../global/utilities.js";

function fillTileArea(tileCoords) {
  let startX = tileCoords.minBy("x").x;
  let endX = tileCoords.maxBy("x").x;
  let startY = tileCoords.minBy("y").y;
  let endY = tileCoords.maxBy("y").y;

  let areaCoords = [];
  for (let y=startY; y <= endY; ++y) {
    for (let x=startX; x <= endX; ++x) {
      areaCoords.push({x: x, y: y});
    }
  }
  return areaCoords;
}

/**
   A class describing rectangles in absolute coordinate values
   (relative to the whole game world / location)
*/
class Box {
  constructor(left, right, top, bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }
  intersects(box) {
    return (
      this.left <= box.right &&
      box.left <= this.right &&
      this.top <= box.bottom &&
      box.top <= this.bottom)
  }
  getCorners() {
    return [
      {x: this.left, y: this.top},
      {x: this.right, y: this.top},
      {x: this.left, y: this.bottom},
      {x: this.right, y: this.bottom}
    ];
  }
  /**
     Returns only corners in directions that may take part
     in collision
  */
  getImportantCorners(dx, dy) {
    let cornerMap = new Map([
      [directions.upLeft, {x: this.left, y: this.top}],
      [directions.upRight, {x: this.right, y: this.top}],
      [directions.downLeft, {x: this.left, y: this.bottom}],
      [directions.downRight, {x: this.right, y: this.bottom}]
    ]);
    let corners = new Set();
    let moveDir = new Direction().fromChangeInXAndY(dx, dy);
    
    if (moveDir.facesUp())
      corners.add(directions.upLeft).add(directions.upRight);
    if (moveDir.facesDown())
      corners.add(directions.downLeft).add(directions.downRight);
    if (moveDir.facesRight())
      corners.add(directions.upRight).add(directions.downRight);
    if (moveDir.facesLeft())
      corners.add(directions.upLeft).add(directions.downLeft);

    corners = Array.from(corners)
      .map(c => cornerMap.get(c));
    
    return corners;
  }
}

export default class Hitbox {
  constructor(entity, {up, left, right, down}) {
    this.entity = entity;
    this.visualizationFunction = () => {};
    this.up = up;
    this.left = left;
    this.right = right;
    this.down = down;
    this.width = this.left + 1 + this.right;
    this.height = this.up + 1 + this.down;
  }

  getBoundingBox(dx=0, dy=0) {
    let cp = this.entity.getCenterPoint();
    return new Box(cp.x + dx - this.left,
		   cp.x + dx + this.right,
		   cp.y + dy - this.up,
		   cp.y + dy + this.down);
  }

  getIntersectingTileCoordinates(dx=0, dy=0) {
    let tileCoordinates = new ObjectSet();
    this.getBoundingBox(dx, dy).getCorners().forEach((corner) => {
      tileCoordinates.add(pointToTileCoord(corner));
    });
    undefined;
    let coordArray = tileCoordinates.entries();
        
    if (this.width <= tileSize && this.height <= tileSize)
      return coordArray;

    // If this hitbox is larger than a tile, it is not enough to check
    // its corners. Every tile in between the tiles that intersect with
    // the hitbox's corners intersect with the hitbox's edges.
    
    //console.log('whole area: ', fillTileArea(coordArray).length);
    return fillTileArea(coordArray);
  }

  getPossiblyCollidingTileCoordinates(dx=0, dy=0) {
    let tileCoordinates = new ObjectSet();
    this.getBoundingBox(dx, dy).getImportantCorners(dx, dy)
      .forEach((corner) => {
	tileCoordinates.add(pointToTileCoord(corner));
      });
    return tileCoordinates.entries();
  }
  
  willCollideWithTiles(dx, dy, arr) {
    let tiles = this.getPossiblyCollidingTileCoordinates(dx, dy)
      .map(p => {
	if (p.x < 0 || p.x > arr.lastIndex
	  || p.y < 0 || p.y > arr[p.x].lastIndex)
	  return null;
	return arr[p.x][p.y];
      });
    if (tiles.includes(null)) {
      // tested movement would cause exceeding the tile array 
      return true;
    }
    for (const tile of tiles) {
      for (const e of tile.entities) {
	if (e.id === this.entity.id) continue;
	this.visualizationFunction(
	  (cx, cy) =>
	    e.hitbox.draw(cx,cy,ctx,{color: "#ff000066"})
	);
	if (this.willCollide(dx, dy, e.hitbox))
	  return true;
      }
    }
    return false;
  }
  
  willCollide(dx, dy, other) {
    if (other.entity.walkable) return false;
    if (this.getBoundingBox(dx, dy)
      .intersects(other.getBoundingBox())) {
      //console.log(other);
      return true;
    }
    return false;
  }
  
  collides(other) {
    if (other.entity.walkable) return false;
    this.visualizationFunction(
      (cx, cy) =>
	other.draw(cx,cy,ctx,{color: "transparent"})
    );
    return this.getBoundingBox().intersects(other.getBoundingBox());
  }

  visualizeCollisions(fun) {
    this.visualizationFunction = fun;
  }
  
  drawExpected(cameraX, cameraY, moveX, moveY, context=ctx) {
    this.draw(cameraX-moveX, cameraY-moveY, context,
	      {color: "blue"});
  }
  
  draw(cameraX, cameraY, context=ctx, options={}) {
    context.fillStyle = options.color ?? "red";
    let centerPoint = this.entity.getCenterPoint();

    context.fillRect(centerPoint.x-this.left-cameraX,
		     centerPoint.y-this.up-cameraY,
		     this.width, this.height);

    const corners = [[-this.left, 0], [this.right, 0], [0, -this.up],
		   [0, this.down]];
    
    context.fillStyle = 'black';
    for (const corner of corners) {
      context.fillRect(centerPoint.x+corner.first-cameraX,
		       centerPoint.y+corner.last-cameraY,
		       1, 1);
    }
  }
}
