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
