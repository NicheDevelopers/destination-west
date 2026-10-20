import {
  DEFAULT_TOWN_HEIGHT as dTH,
  DEFAULT_TOWN_WIDTH as dTW,
  TILE_SIZE as tS,
  type DirectionValue,
} from "./global/consts.js";
import {
  Direction,
  DIRECTIONS,
  roundToTile,
  pointToTileCoord,
  type Point,
} from "./utilities/utilities.js";
import { randIntInRange } from "./utilities/random.js";
import { ctx } from "./core/Browser.js";
import type Game from "./game/Game.js";
import type Tile from "./game/Tile.js";

type PathNode = {
  gridPos: Point;
  walkable: boolean;
  f: number;
  g: number;
  h: number;
  parent: PathNode | null;
  optimalDirection: Direction;
};

type Neighbor = {
  node: PathNode;
  direction: DirectionValue;
};

type Offset = { dx: number; dy: number; direction: DirectionValue };

const CARDINAL_OFFSETS: readonly Offset[] = [
  { dx: -1, dy: 0, direction: DIRECTIONS.left },
  { dx: 1, dy: 0, direction: DIRECTIONS.right },
  { dx: 0, dy: 1, direction: DIRECTIONS.down },
  { dx: 0, dy: -1, direction: DIRECTIONS.up },
];

const DIAGONAL_OFFSETS: readonly Offset[] = [
  { dx: -1, dy: 1, direction: DIRECTIONS.downLeft },
  { dx: 1, dy: 1, direction: DIRECTIONS.downRight },
  { dx: -1, dy: -1, direction: DIRECTIONS.upLeft },
  { dx: 1, dy: -1, direction: DIRECTIONS.upRight },
];

const MAX_END_TILE_ATTEMPTS = 10;

const DEBUG_COLORS = {
  reachableEnd: "#00ff0055",
  unreachableEnd: "#ff000055",
  walkedTrace: "#ffffff55",
  remainingTrace: "#ffff00cc",
} as const;

export type PathfindingStrategy = "aStar" | "greedy";

interface PathfinderEntity {
  getCenterPoint(): Point;
}

class Pathfinder {
  game: Game;
  entity: PathfinderEntity;
  townArray: Tile[][];
  diagonalMovement: boolean;
  strategy: PathfindingStrategy;
  pathArray: PathNode[][];
  start: PathNode | null;
  end: PathNode | null;
  path: PathNode[] | null;
  trace: PathNode[];

  /**
   * Pathfinder for moving Entities
   * @param diagonalMovement - true if Entity is able to move diagonally, otherwise false
   * @param strategy - algorithm used by genNewPath()
   */
  constructor(
    game: Game,
    entity: PathfinderEntity,
    diagonalMovement: boolean = false,
    strategy: PathfindingStrategy = "greedy",
  ) {
    this.game = game;
    this.entity = entity;
    this.townArray = this.game.currentTown.array;
    this.diagonalMovement = diagonalMovement;
    this.strategy = strategy;
    this.pathArray = [];
    this.updatePathArray();
    this.start = null;
    this.end = null;
    this.path = null;
    this.trace = [];
  }

  /**
   * Get next information for movement.
   * @returns next node on path, with the Direction from current position to it
   */
  getNextMove(): PathNode | null {
    return this.path?.shift() ?? null;
  }

  genNewPath(): void {
    this.path = null;
    this.trace = [];
    this.updatePathArray();
    this.changeStartTile();

    // if it is not possible to reach new endTile - search for new reachable one
    for (let attempt = 0; attempt < MAX_END_TILE_ATTEMPTS; attempt++) {
      this.changeEndTile();
      if (this.end?.walkable) break;
    }
    if (!this.end?.walkable) return;

    this.path = this.strategy === "greedy" ? this.greedySearch() : this.search();
    if (this.path && this.start) this.trace = [this.start, ...this.path];
  }

  drawDebugInfo(cameraX: number, cameraY: number, context: CanvasRenderingContext2D = ctx): void {
    if (this.end) {
      context.fillStyle = this.path ? DEBUG_COLORS.reachableEnd : DEBUG_COLORS.unreachableEnd;
      context.fillRect(
        this.end.gridPos.x * tS - cameraX,
        this.end.gridPos.y * tS - cameraY,
        tS,
        tS,
      );
    }
    if (this.trace.length < 2) return;

    // getNextMove() already took the node the entity is heading to out of `path`
    const remaining = this.path?.length ?? 0;
    const target = Math.max(0, this.trace.length - remaining - 1);
    const toScreen = ({ gridPos }: PathNode): Point => ({
      x: gridPos.x * tS + tS / 2 - cameraX,
      y: gridPos.y * tS + tS / 2 - cameraY,
    });

    context.save();
    context.lineWidth = 3;
    context.lineJoin = "round";
    // the walked part ends on the node the entity is heading from, so the two parts connect
    this.strokeTrace(context, this.trace.slice(0, target).map(toScreen), DEBUG_COLORS.walkedTrace);
    this.strokeTrace(
      context,
      this.trace.slice(Math.max(0, target - 1)).map(toScreen),
      DEBUG_COLORS.remainingTrace,
    );
    context.restore();
  }

  private strokeTrace(context: CanvasRenderingContext2D, points: Point[], color: string): void {
    if (points.length < 2) return;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const { x, y } of points.slice(1)) context.lineTo(x, y);
    context.stroke();
  }

  changeStartTile(): void {
    const { x, y } = pointToTileCoord(this.entity.getCenterPoint());
    this.start = this.pathArray[x]?.[y] ?? null;
  }

  changeEndTile(x: number = randIntInRange(0, dTW) * tS, y: number = randIntInRange(0, dTH) * tS) {
    x = roundToTile(x);
    y = roundToTile(y);
    const node = this.pathArray[x]?.[y];
    if (!node) {
      throw new Error(
        `Attempt to create endTile on (${x}, ${y}) for pathfinder\n` +
          `given range x: <${0}, ${this.pathArray.length}); y: <${0}, ${this.pathArray[0]?.length ?? 0})`,
      );
    }
    this.end = node;
  }

  /**
   * Check in location which tiles have Entities with hitboxes.
   * Such tiles are unable to be walked through.
   * Tiles with no hitbox-Entity on it can be passed and will be considered in path creation process.
   */
  updatePathArray(): void {
    this.pathArray = this.townArray.map((column) =>
      column.map((tile) => ({
        gridPos: tile.gridPos,
        walkable: tile.entities.length === 0,
        f: 0,
        g: 0,
        h: 0,
        parent: null,
        optimalDirection: new Direction(DIRECTIONS.none),
      })),
    );
  }

  /**
   * Generate information about neighbors for given node.
   * @returns array of objects holding information about next possible movement
   */
  neighbors(node: PathNode): Neighbor[] {
    const offsets = this.diagonalMovement
      ? [...CARDINAL_OFFSETS, ...DIAGONAL_OFFSETS]
      : CARDINAL_OFFSETS;
    const { x, y } = node.gridPos;
    const neighbors: Neighbor[] = [];
    for (const { dx, dy, direction } of offsets) {
      const neighbor = this.pathArray[x + dx]?.[y + dy];
      if (neighbor) neighbors.push({ node: neighbor, direction });
    }
    return neighbors;
  }

  /**
   * Heuristic function for A* algorithm
   * @returns smallest distance between two points (non-diagonal movement)
   */
  heuristic(start: Point, end: Point): number {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  }

  /**
   * A* algorithm trying to find path from startTile to endTile
   * @returns shortest path (without the start node), or null if endTile is unreachable
   */
  search(): PathNode[] | null {
    const { start, end } = this;
    if (!start || !end) return null;

    const openList = new Set<PathNode>([start]);
    const closedList = new Set<PathNode>();
    while (openList.size > 0) {
      let currentNode = start;
      let lowestF = Infinity;
      for (const node of openList) {
        if (node.f < lowestF) {
          lowestF = node.f;
          currentNode = node;
        }
      }
      // hit endTile
      if (currentNode === end) {
        return this.reconstructPath(currentNode);
      }
      // not hit endTile
      openList.delete(currentNode);
      closedList.add(currentNode);

      for (const move of this.neighbors(currentNode)) {
        const neighbor = move.node;
        if (closedList.has(neighbor) || !neighbor.walkable) {
          continue;
        }
        const gScore = currentNode.g + 1;
        let gScoreIsBest = false;

        if (!openList.has(neighbor)) {
          gScoreIsBest = true;
          neighbor.h = this.heuristic(neighbor.gridPos, end.gridPos);
          openList.add(neighbor);
        } else if (gScore < neighbor.g) {
          gScoreIsBest = true;
        }

        if (gScoreIsBest) {
          neighbor.parent = currentNode;
          neighbor.optimalDirection = new Direction(move.direction);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
        }
      }
    }
    // no result found
    return null;
  }

  /**
   * Greedy depth-first search: always step to the unvisited neighbor closest to endTile,
   * backtrack on dead ends. Much cheaper than A* (no open list to scan), but the found
   * path is not guaranteed to be the shortest one.
   * @returns found path (without the start node), or null if endTile is unreachable
   */
  greedySearch(): PathNode[] | null {
    const { start, end } = this;
    if (!start || !end) return null;

    const visited = new Set<PathNode>([start]);
    const stack: PathNode[] = [start];
    while (stack.length > 0) {
      const currentNode = stack[stack.length - 1];
      // hit endTile - the stack holds the path
      if (currentNode === end) {
        return stack.slice(1);
      }

      let bestMove: Neighbor | null = null;
      let bestH = Infinity;
      for (const move of this.neighbors(currentNode)) {
        if (visited.has(move.node) || !move.node.walkable) continue;
        const h = this.heuristic(move.node.gridPos, end.gridPos);
        if (h < bestH) {
          bestH = h;
          bestMove = move;
        }
      }

      // dead end - go back
      if (!bestMove) {
        stack.pop();
        continue;
      }
      bestMove.node.optimalDirection = new Direction(bestMove.direction);
      visited.add(bestMove.node);
      stack.push(bestMove.node);
    }
    // no result found
    return null;
  }

  private reconstructPath(endNode: PathNode): PathNode[] {
    const path: PathNode[] = [];
    let curr = endNode;
    while (curr.parent) {
      path.push(curr);
      curr = curr.parent;
    }
    return path.reverse();
  }
}

export default Pathfinder;
