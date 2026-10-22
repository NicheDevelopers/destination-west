export const DEFAULT_EQUIPMENT_SIZE = 100;
export const DEFAULT_TOWN_WIDTH = 42;
export const DEFAULT_TOWN_HEIGHT = 20;
export const PERCENTAGE_OF_TWO_NAME_TOWN = 0.4;

export const PLAYER_PARAMETERS = {
  defaultPlayerSpeed: 80,
  playerBoundingDistance: {
    up: 2,
    left: 8,
    right: 8,
    down: 2,
  },
  playerRelativeCenterPoint: { x: 31, y: 61 },
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

export const FOCUS_BACK_TO_PLAYER_TIME = 0.5;

export const PERCENTAGE_OF_GENERIC_DECORATION = {
  ruralPercentage: 0.2,
  townPercentage: 0.05,
};

export const WORLD_MAP_DISPLAY = {
  townNameOffsetX: -50,
  townNameOffsetY: 40,
  lowConnection: 3,
  mediumConnection: 5,
  highConnection: 10,
};

export const CHUCK_A_LUCK_PARAMETERS = {
  diceSize: 64,
  diceGap: 16,
  bettingSpotSize: 128,
  horizontalGap: 63,
  verticalGap: 128,
  horizontalOffset: 63,
  verticalOffset: 64,
};

export const FOCUS_PARAMETERS = {
  minDist: 50.0,
  facingPenalty: 15,
};

export const DIALOGUE_PARAMETERS = {
  lettersPerSecond: 60,
};

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
