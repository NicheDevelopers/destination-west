import type { Point } from "@/utilities/utilities.js";

export const TILE_SIZE = 64;
// World pixels per art pixel: art is drawn on a 32 px tile grid, the world uses 64 px tiles
export const PIXEL_SCALE = 2;
export const DEFAULT_EQUIPMENT_SIZE = 100;
export const SPRITE_SCALE = 1;
export const DEFAULT_TOWN_WIDTH = 42;
export const DEFAULT_TOWN_HEIGHT = 20;
export const EQUIPMENT_SPRITE_SIZE = 7;
// Cooridinates of the sprite's center point (useful for rendering)
export const PLAYER_CENTER_POINT: Point = { x: 48, y: 60 };
export const PERCENTAGE_OF_TWO_NAME_TOWN = 0.4;
export const TRANSPARENCY_ALPHA_TOLERANCE = 5;
export type Distances = { left: number; right: number; up: number; down: number };
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

export const PLAYER_PARAMETERS = {
  defaultPlayerSpeed: 80,
  defaultDiagonalOffset: Math.sqrt(2) / 2,
  defaultSprintMultiplier: 2,
  defaultSneakMultiplier: 0.5,
  // How long the player stays out of breath after sprinting
  outOfBreathSeconds: 4,
  defaultSprintMode: "hold" as InputMode,
  defaultSneakMode: "hold" as InputMode,
  playerBd: {
    up: 2,
    left: 8,
    right: 8,
    down: 2,
  },
  playerRcp: { x: 31, y: 61 },
  defaultStartCash: 100,
};

export const NPC_PARAMETERS = {
  defaultNpcSpeed: 70,
  defaultNpcStartCash: 150,
};

export const CASH_MIN_MAX_PARAMETERS = {
  minCash: 0,
  maxCash: 100,
};

export const MAP_PARAMETERS = {
  minLocations: 20,
  maxLocations: 25,
  displayWidth: 1800,
  displayHeight: 900,
  paddingX: 50,
  paddingY: 50,
  /*
   minDistanceForConnection must be significantly greater than minDistanceBetweenLocations,
    WorldMap.js creating coords of locations first search for locations which distance
    to any other location is smaller than minDistanceBetweenLocations;
    Doing connections nearby locations is location which distance to any other location
    is smaller than minDistanceForConnection;
    Therefore, if location will be generated on coords which distance to any location is greater
    than minimum distance needed for connection there would generate multiple locations without connections
    DFS method will never return true, so on contructor of WorldMap will never end.
    For a slight difference between these two values time required to generate WorldMap will singificantly increase.
  */
  minDistanceBetweenLocations: 150,
  minDistanceForConnection: 300,
};

export const TOWN_SIZES = {
  small: 8,
  medium: 16,
  large: 20,
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

export const FOCUS_BACK_TO_PLAYER_TIME = 0.5;

export const PERCENTAGE_OF_GENERIC_DECORATION = {
  rural_percentage: 0.2,
  town_percentage: 0.05,
};

export const WORLD_MAP_DISPLAY = {
  townNameOffsetX: -50,
  townNameOffsetY: 40,
  lowConnection: 3,
  mediumConnection: 5,
  highConnection: 10,
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

export const CHUCK_A_LUCK_PARAMETERS = {
  diceSize: 64,
  diceGap: 16,
  bettingSpotSize: 128,
  horizontalGap: 63,
  verticalGap: 128,
  horizontalOffset: 63,
  verticalOffset: 64,
};

export const DEFAULT_NOTIFICATION_TIMEOUT = 2;

export const FOCUS_PARAMETERS = {
  minDist: 50.0,
  facingPenalty: 15,
};

export const DIALOGUE_PARAMETERS = {
  lettersPerSecond: 60,
};

export const DEFAULT_ENTITY_HP = 100;

export const TOWN_PALETTE = {
  // background: {r: 250, g: 200, b: 100},
  bank: { r: 255, g: 255, b: 0 },
  street: { r: 220, g: 160, b: 100 },
  saloon: { r: 200, g: 50, b: 50 },
  house: { r: 130, g: 130, b: 130 },
  sheriff: { r: 100, g: 110, b: 250 },
  gunStore: { r: 200, g: 120, b: 180 },
  generalStore: { r: 100, g: 200, b: 230 },
  signpost: { r: 120, g: 60, b: 40 },
  church: { r: 255, g: 255, b: 255 },
  stable: { r: 215, g: 120, b: 100 },
};

export const STAT_THRESHOLDS = {
  anger: {
    min: 0,
    medium: 15,
    max: 30,
  },
  respect: {
    min: 0,
    medium: 45,
    max: 100,
  },
  trust: {
    min: 0,
    medium: 50,
    max: 80,
  },
};
