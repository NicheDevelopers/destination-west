import { TILE_SIZE } from "./consts";
import type { Point } from "@/lib/utilities";

export function roundToTile(value: number): number {
  return Math.floor(value / TILE_SIZE);
}

/**
   Return an {x, y} object which represents
   the coordinates of a tile that contains
   the point given as the arguemnt.
*/
export function pointToTileCoord({ x, y }: Point): Point {
  return {
    x: roundToTile(x),
    y: roundToTile(y),
  };
}
