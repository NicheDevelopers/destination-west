export const tileSize = 64;
export const defaultEquipmentSize = 100;
export const animationSpeed = 9;
export const defaultPlayerSpeed = 150;
export const defaultNpcSpeed = 130;
export const defaultDiagonalOffset = Math.sqrt(2)/2;
export const defaultSprintMultiplier = 1.5;
export const defaultSneakMultiplier = 0.01;
export const defaultSprintMode = 'hold';
export const defaultSneakMode = 'hold';
export const spriteScale = 1;
export const defaultTownWidth = 42;
export const defaultTownHeight = 20;
export const equipmentSpriteSize = 7;
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
    For a slight difference between this two values time required to generate WorldMap will singificantly increase.
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

