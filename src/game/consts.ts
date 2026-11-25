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
  minLocations: 15,
  maxLocations: 20,
  displayWidth: 1800,
  displayHeight: 900,
  paddingX: 50,
  paddingY: 50,
  minMiddleLayers: 4,
  maxMiddleLayers: 5,
  townAreaInLayer: 0.5,
  extraRoadChance: 0.5,
  maxExtraRoadLength: 450,
  maxSameLayerRoadLength: 250,
  minRoadDistanceFromTown: 40,
  minRoadsForMediumTown: 4,
  minRoadsForLargeTown: 5,
  maxLargeTowns: 3,
  minDistanceBetweenLocations: 150,
};

export const TOWN_SIZES = {
  small: 8,
  medium: 16,
  large: 20,
};

export const TOWNSFOLK_COUNT_BY_TOWN_SIZE: Record<keyof typeof TOWN_SIZES, number> = {
  small: 2,
  medium: 4,
  large: 6,
};

export const FOCUS_BACK_TO_PLAYER_TIME = 0.5;

export const PERCENTAGE_OF_GENERIC_DECORATION = {
  ruralPercentage: 0.2,
  townPercentage: 0.05,
};

export const PLANT_PATCHES = {
  tilesPerPatch: 45,
  blobsPerPatch: 4,
  minBlobRadius: 2,
  maxBlobRadius: 6,
  density: 1,
  maxNudge: 20,
};

export const WORLD_MAP_DISPLAY = {
  margin: 120,
  artPixel: 4,
  iconSize: 128,
  iconTopOffset: -80,
  hatTopOffset: -112,
  ringOffsetY: 40,
  ringRadiusX: 60,
  ringRadiusY: 16,
  townNameOffsetY: 88,
  townNameFont: '24px "Destination West", Georgia, serif',
  roadWobble: 8,
  compassInset: 104,
  unvisitedTownAlpha: 0.45,
};

export const CHUCK_A_LUCK_PARAMETERS = {
  diceSize: 64,
  diceGap: 16,
  bettingSpotSize: 128,
  horizontalGap: 64,
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
