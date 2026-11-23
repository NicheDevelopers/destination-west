/**
 * Every path shape, keyed by which neighbouring tiles are path ("1") or not ("0"), in the order:
 * top, top-right, right, bottom-right, bottom, bottom-left, left, top-left.
 * A diagonal only counts when both tiles beside it are path too. Each shape is listed in one
 * rotation only, and the value is how many variants of it there are.
 * The order has to match the tiles in public/img/path.png.
 */
export const pathShapes = new Map<string, number>([
  ["00000000", 2],
  ["00000010", 2],
  ["00001010", 2],
  ["00001110", 2],
  ["00100010", 3],
  ["00101010", 2],
  ["00101110", 2],
  ["00111010", 2],
  ["00111110", 2],
  ["10101010", 2],
  ["10101011", 2],
  ["10101111", 2],
  ["10111011", 2],
  ["10111111", 2],
  ["11111111", 3],
]);

export function pathTileName(shape: string, variant: number): string {
  return `path-${shape}-${variant}`;
}
