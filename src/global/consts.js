export const tileSize = 64;
export const defaultEquipmentSize = 100;
export const animationSpeed = 9;
export const defaultNpcSpeed = 130;
export const spriteScale = 1;
export const defaultTownWidth = 42;
export const defaultTownHeight = 20;
export const equipmentSpriteSize = 7;
// Cooridinates of the sprite's center point (useful for rendering)
export const playerCenterPoint = { x: 48, y: 60 };
export const percentageOfTwoNameTown = 0.4;
export const transparencyAlphaTolerance = 5;

export const playerParameters = {
  defaultPlayerSpeed : 150,
  defaultDiagonalOffset : Math.sqrt(2)/2,
  defaultSprintMultiplier : 1.5,
  defaultSneakMultiplier : 0.5,
  defaultSprintMode : 'hold',
  defaultSneakMode : 'hold',
  playerBd: {
    up: 2,
    left: 14,
    right: 14,
    down: 2
  },
  playerRcp: { x: 48, y: 70 }
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
  minDistanceForConnection: 300
  
};

export const townSizes = {
  small: 8,
  medium: 16,
  large: 20
};

export const camSettings = {
  zoom: 1.5,
  zoomMin: 0.85,
  zoomMax: 50,
  zoomSafetyMultiplier: 1.05,
  zoomSpeed: 0.002
};

export const keyboardVisualizerPosition = {
  width: 100,
  height: 20,
  offsetX: 0,
  offsetY: 0,
  buttonWidth: 50,
  buttonHeight: 40,
  buttonLeft : {
    offsetX: 50,
    offsetY: 100,
  },
  buttonRight : {
    offsetX: 160,
    offsetY: 100,
  },
  buttonUp : {
    offsetX: 105,
    offsetY: 55,
  },
  buttonDown : {
    offsetX: 105,
    offsetY: 100,
  }
};

export const percentageOfGenericDecoration = {
  rural_percentage : 0.2,
  town_percentage : 0.05
};

export const worldMapDisplay = {
  townNameOffsetX : -50,
  townNameOffsetY : 40,
  lowConnection : 3,
  mediumConnection : 5,
  highConnection : 10
};

export const animatedSprite = {
  defaultIntervalTime : 110,
  defaultFramesPerInterval : 1,
  defaultAnimationSpeed : 8,
  defaultFrameCount : 1
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
