export const tileSize = 64;
export const defaultEquipmentSize = 100;
export const animationSpeed = 9;
export const spriteScale = 1;
export const defaultTownWidth = 42;
export const defaultTownHeight = 20;
export const equipmentSpriteSize = 7;
// Cooridinates of the sprite's center point (useful for rendering)
export const playerCenterPoint = { x: 48, y: 60 };
export const percentageOfTwoNameTown = 0.4;
export const transparencyAlphaTolerance = 5;
export function distances(left, right, up, down) {
  return { left: left, right: right, up: up, down: down };
}
/**
   relativeCenterPoint - an object with x and y properties,
   describing the position of a visual base center point of
   a sprite, relative to the top-left corner of the sprite.
*/
export const defaultRcp = { x: tileSize / 2, y: tileSize / 2 };
/**
   boundingDistance - an object with properties: left,
   right, up, down. It describes distances to the hitbox boundaries
   from the absolute position of the relativeCenterPoint.
*/
export const defaultBd = distances(
  tileSize / 2 - 1,
  tileSize / 2,
  tileSize / 2 - 1,
  tileSize / 2,
);
export const defaultHitboxHeight = 4;
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
export const autoBoundaryXLooseness = 0.2;
export const playerParameters = {
  defaultPlayerSpeed: 150,
  defaultDiagonalOffset: Math.sqrt(2) / 2,
  defaultSprintMultiplier: 1.5,
  defaultSneakMultiplier: 0.5,
  defaultSprintMode: "hold",
  defaultSneakMode: "hold",
  playerBd: {
    up: 2,
    left: 14,
    right: 14,
    down: 2,
  },
  playerRcp: { x: 48, y: 70 },
  defaultStartCash: 100,
};

export const npcParameters = {
  defaultNpcSpeed: 130,
  defaultNpcStartCash: 150,
};

export const cashMinMaxParameters = {
  minCash: 0,
  maxCash: 100,
};

export const mapParameters = {
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

export const townSizes = {
  small: 8,
  medium: 16,
  large: 20,
};

export const camStates = {
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

export const camSettings = {
  zoom: 1.5,
  zoomMin: 0.85,
  zoomMax: 50,
  zoomSafetyMultiplier: 1.05,
  zoomSpeed: 0.002,
  entityFocusZoom: 3.5,
  focusChangeTime: 1.0,
};

export const focusBackToPlayerTime = 0.5;

export const percentageOfGenericDecoration = {
  rural_percentage: 0.2,
  town_percentage: 0.05,
};

export const worldMapDisplay = {
  townNameOffsetX: -50,
  townNameOffsetY: 40,
  lowConnection: 3,
  mediumConnection: 5,
  highConnection: 10,
};

export const animatedSprite = {
  defaultIntervalTime: 110,
  defaultFramesPerInterval: 1,
  defaultAnimationSpeed: 8,
  defaultFrameCount: 1,
};

export const directions = {
  upLeft: 0,
  up: 1,
  upRight: 2,
  left: 3,
  none: 4,
  right: 5,
  downLeft: 6,
  down: 7,
  downRight: 8,
};

export const chuckALuckParameters = {
  diceSize: 64,
  diceGap: 16,
  bettingSpotSize: 128,
  horizontalGap: 63,
  verticalGap: 128,
  horizontalOffset: 63,
  verticalOffset: 64,
};

export const defaultNotificationTimeout = 2;

export const focusParameters = {
  minDist: 50.0,
  facingPenalty: 15,
};

export const dialogueParameters = {
  lettersPerSecond: 60,
};

export const defaultEntityHp = 100;

export const statThresholds = {
  anger: {
    min: 0,
    medium: 15,
    max: 30
  },
  respect: {
    min: 0,
    medium: 45,
    max: 100
  },
  trust: {
    min: 0,
    medium: 50,
    max: 80
  }
};