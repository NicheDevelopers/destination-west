import type { Point } from "@/lib/utilities";

export const TILE_SIZE = 64;
// World pixels per art pixel: art is drawn on a 32 px tile grid, the world uses 64 px tiles
export const PIXEL_SCALE = 2;
export const SPRITE_SCALE = 1;
type Distances = { left: number; right: number; up: number; down: number };
export function distances(left: number, right: number, up: number, down: number): Distances {
  return { left: left, right: right, up: up, down: down };
}
/**
   relativeCenterPoint - an object with x and y properties,
   describing the position of a visual base center point of
   a sprite, relative to the top-left corner of the sprite.
*/
export const DEFAULT_RCP: Point = { x: TILE_SIZE / 2, y: TILE_SIZE / 2 };
/**
   boundingDistance - an object with properties: left,
   right, up, down. It describes distances to the hitbox boundaries
   from the absolute position of the relativeCenterPoint.
*/
export const DEFAULT_BD: Distances = distances(
  TILE_SIZE / 2 - 1,
  TILE_SIZE / 2,
  TILE_SIZE / 2 - 1,
  TILE_SIZE / 2,
);
export const DEFAULT_HITBOX_HEIGHT = 4;
/**
   horizontal sprite-detected boundary looseness;
   Describes how much smaller in the x axis should
   a sprite-detected hitbox be.

   For example: 0.2 means that 20% of the original
   detected width will not be used for the hitbox
   (the remaining 80% will be its width).

   Introduced to make hitboxes less strict and
   more intuitive to the player.
*/
export const AUTO_BOUNDARY_X_LOOSENESS = 0.2;
export type InputMode = "hold" | "toggle";

export const MOVEMENT_PARAMETERS = {
  defaultSpeed: 80,
  defaultDiagonalOffset: Math.sqrt(2) / 2,
  defaultSprintMultiplier: 2,
  defaultSneakMultiplier: 0.5,
  // How long the player stays out of breath after sprinting
  outOfBreathSeconds: 4,
  defaultSprintMode: "hold" as InputMode,
  defaultSneakMode: "hold" as InputMode,
};

export const CAM_STATES = {
  /**
     FOCUSED state
     The camera is locked onto a target
  */
  FOCUSED: 0,
  /**
     ANIMATING state
     The camera is currently animating its position
     to reach the focused entity
  */
  ANIMATING: 1,
};

export const CAM_SETTINGS = {
  zoom: 1.5,
  zoomMin: 0.85,
  zoomMax: 50,
  zoomSafetyMultiplier: 1.05,
  zoomSpeed: 0.002,
  entityFocusZoom: 3.5,
  focusChangeTime: 1.0,
};

export const DIRECTIONS = {
  upLeft: 0,
  up: 1,
  upRight: 2,
  left: 3,
  none: 4,
  right: 5,
  downLeft: 6,
  down: 7,
  downRight: 8,
} as const;

export type DirectionValue = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

export const DEFAULT_NOTIFICATION_TIMEOUT = 2;

export const DEFAULT_ENTITY_HP = 100;
