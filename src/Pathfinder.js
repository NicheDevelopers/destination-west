import Tile from "./game/Tile.js";
import { defaultTownHeight as dTH, defaultTownWidth as dTW, tileSize as tS } from "./global/consts.js";
import { Direction, ObjectSet, directions, randIntInRange, roundToTile } from "./global/utilities.js";

class PathTile extends Tile {
    /**
     * Create Tile with extra parameters hold for A* algorithm
     * @param {string} typeName 
     * @param {number} x x coordinate of tile 
     * @param {number} y y coordinate of tile
     * @param {*} options 
     */
    constructor (typeName, x, y, options = {}){
        super(typeName, x, y, options);
        this.movePossible = null;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.debug = '';
        this.parent = null;
        this.optimalDirection = new Direction(directions.none);
    }
    
    /**
     * Get coordinates of tile (top-left corner of tile)
     * @returns {Object} object with coordinates of top-left corner of tile
     */
    getCoords() {
        return { x: roundToTile(this.x), y: roundToTile(this.y) };
  }
};
class Pathfinder {
    /**
     * Pathfinder for moving Entities
     * @param {State} game 
     * @param {Entity} entity 
     * @param {Boolean} [diagonalMovement = false] - true if Entity is able to move diagonally, otherwise false
     */
    constructor(game, entity, diagonalMovement = false){
        this.game = game;
        this.entity = entity;
        this.town = this.game.currentTown;
        this.townArray = this.town.array;
        this.diagonalMovement = diagonalMovement;
        this.pathArray = new Array();
        this.updatePathArray();
        this.start = null;
        this.end = null;
        this.path = null;
    }

    /**
     * Get next information for movement.
     * @returns {Object} object with next PathTile on path and Direction from current position to it
     */
    getNextMove(){
      if (this.path?.length){
        return this.path.shift();
      }
      return null;
    }

    /**
     * Generate new path for Entity.
     */
  genNewPath() {
    this.path = null;
    this.changeStartTile();
    this.updatePathArray();
    this.changeEndTile();

    // if it is not possible to reach new endTile - search for new reachable one
    if (!this.end.movePossible){
        this.changeEndTile();
    } 
    this.path = this.search();
  }

  /**
   * Set start tile to tile where entity is standing
   */
    changeStartTile(){
      let {x, y} = this.entity.getCenterPoint();
      this.start = new PathTile("sand", x, y);
      x = roundToTile(x);
      y = roundToTile(y);
    }

    /**
     * Set end tile for Entity movement
     * @param {number} [x=randIntInRange(0, dTW)*tS] - x coordinate 
     * @param {number} [y=randIntInRange(0, dTH)*tS] - y coordinate 
     */
    changeEndTile(x = randIntInRange(0, dTW) * tS , y = randIntInRange(0, dTH) * tS){
        x = roundToTile(x);
        y = roundToTile(y);
        if (x < 0 || x >= dTW || y < 0 || y >= dTH){
            throw new Error(`Attempt to create endTile on (${x}, ${y}) for pathfinder\n` +
            `given range x: <${0}, ${dTW}); y: <${0}, ${dTH})`);
        }
        let tile = this.townArray[x][y];
        this.end = new PathTile(tile.typeName, tile.x, tile.y, tile.options);
    }

    /**
     * Check in location which tiles have Entities with hitboxes.
     * Such tiles are unable to be walked through.
     * Tiles with no hitbox-Entity on it can be passed and will be considered in path creation procces.
     */
    updatePathArray(){
        for (let i = 0; i<this.townArray.length; i++){
            this.pathArray[i] = new Array();
            for (let j = 0; j<this.townArray[i].length; j++){
                let pathTile = new PathTile(
                    this.townArray[i][j].typeName,
                    this.townArray[i][j].x,
                    this.townArray[i][j].y,
                    this.townArray[i][j].options
                );
                // none entities with hitboxes on tile -> can be passed
                if (this.townArray[i][j].entities.length === 0){
                    pathTile.movePossible = true; 
                }
                // some entities with hitboxes on tile -> cannot be passed
                else{
                    pathTile.movePossible = false;
                }
                this.pathArray[i][j] = pathTile;
            }
        }
    }

    /**
     * Generate informations of neighbors for given pathTile.
     * @param {Array[][]} pathArray hold information about tiles in location
     * @param {PathTile} pathTile pathTile for which we are checking neighbors
     * @param {Boolean} diagonalMovement true if Entity is able to move diagonally, otherwise false
     * @returns {Array[]} array of object holding information about next possible movement
     */
    neighbors(pathArray, pathTile, diagonalMovement){
        let neighbors = new Array();
        let x = roundToTile(pathTile.x)
        let y = roundToTile(pathTile.y);
        if (pathArray[x-1] && pathArray[x-1][y]){
            neighbors.push({
                neighbor: pathArray[x-1][y], 
                optimalDirection: new Direction(directions.left)
            });
        }
        if (pathArray[x+1] && pathArray[x+1][y]){
            neighbors.push({
                neighbor: pathArray[x+1][y], 
                optimalDirection: new Direction(directions.right)
            });
        }
        if (pathArray[x] && pathArray[x][y+1]){
            neighbors.push({
                neighbor: pathArray[x][y+1], 
                optimalDirection: new Direction(directions.down)
            });
        } 
        if (pathArray[x] && pathArray[x][y-1]){
            neighbors.push({
                neighbor: pathArray[x][y-1], 
                optimalDirection: new Direction(directions.up)
            });
        }
        if (diagonalMovement){
            if (pathArray[x-1] && pathArray[x-1][y+1]){
                neighbors.push({
                    neighbor: pathArray[x-1][y+1], 
                    optimalDirection: new Direction(directions.downLeft)
                });
            } 
            if (pathArray[x+1] && pathArray[x+1][y+1]){
                neighbors.push({
                    neighbor: pathArray[x+1][y+1], 
                    optimalDirection: new Direction(directions.downRight)
                });
            } 
            if (pathArray[x-1] && pathArray[x-1][y-1]){
                neighbors.push({
                    neighbor: pathArray[x-1][y-1], 
                    optimalDirection: new Direction(directions.upLeft)
                });
            } 
            if (pathArray[x+1] && pathArray[x+1][y-1]){
                neighbors.push({
                    neighbor: pathArray[x+1][y-1], 
                    optimalDirection: new Direction(directions.upRight)
                });
            } 
        }
        return neighbors;
    }

    /**
     * Heuristic function for A* algorithm
     * @param {number} x1 x coordinate of start point
     * @param {number} y1 y coordinate of start point
     * @param {number} x2 x coordinate of end point
     * @param {number} y2 y coordinate of end point
     * @returns {number} smallest distance between two points (non-diagonal movement)
     */
    heuristic(x1, y1, x2, y2){
        let d1 = Math.abs(x1-x2);
        let d2 = Math.abs(y1-y2);
        return d1+d2;
    }

    /**
     * A* algorithm trying to find path from startTile to endTile
     * @returns {Array[]} array of objects, path which was found
     */
    search(){
        let openList = new ObjectSet;
      let closedList = new ObjectSet;
      openList.add(this.start);
        while (openList.entries().length > 0){
            let lowInd = 0;
            for (let i = 0; i < openList.entries().length; i++){
                if (openList.entries()[i].f < openList.entries()[lowInd].f){
                    lowInd = i;
                }
            }
            let currentNode = openList.entries()[lowInd];
            // hit endTile
            if (currentNode.x === this.end.x && currentNode.y === this.end.y){
                let curr = currentNode;
                let dir = new Array();
                while (curr.parent) {
                    dir.push(curr);
                    curr = curr.parent;
                }
                return dir.reverse();
            }
            // not hit endTile
            openList.delete(currentNode);
            closedList.add(currentNode);
            let neighbors = this.neighbors(this.pathArray, currentNode, this.diagonalMovement);

            for (let move of neighbors){
              let neighbor = move.neighbor;
                if (closedList.has(neighbor) || neighbor.movePossible === false){
                    continue;
                }
                let gScore = currentNode.g + 1;
                let gScoreIsBest = false;

                if (!openList.has(neighbor)){
                    gScoreIsBest = true;
                    neighbor.h = this.heuristic(
                        roundToTile(neighbor.x), roundToTile(neighbor.y), 
                        roundToTile(this.end.x), roundToTile(this.end.y)
                    );
                    openList.add(neighbor);
                }
                else if (gScore < neighbor.g) {
                    gScoreIsBest = true;
                }
            
                if (gScoreIsBest){
                    neighbor.parent = currentNode;
                    neighbor.optimalDirection = move.optimalDirection;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.debug = `F: ${neighbor.f}, G: ${neighbor.g}, H: ${neighbor.h}`;
                }
            }
        }
        // no result found
        return null;
    }
};

export default Pathfinder;
