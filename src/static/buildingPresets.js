let newBuilding = (x1, y1, x2, y2) =>
  ({xStart: x1, yStart: y1, xTiles: x2, yTiles: y2});
let newStreet = (x1, y1, width, height) =>
  ({start: {x: x1, y: y1}, width: width, height: height});

const preset1 = {
  buildings: [
    newBuilding(27, 1, 5, 3),
    newBuilding(21, 7, 4, 3),
    newBuilding(22, 1, 3, 3),
    newBuilding(27, 7, 3, 3),
    newBuilding(32, 2, 3, 2),
    newBuilding(27, 12, 3, 3),
    newBuilding(20, 12, 5, 3),
    newBuilding(18, 2, 4, 2),
    newBuilding(16, 7, 4, 3),
    newBuilding(15, 2, 3, 2)
  ],
  streets: [
    newStreet(0, 4, 42, 2),
    newStreet(25, 0, 2, 20),
    newStreet(27, 10, 4, 1),
    newStreet(27, 15, 4, 1),
    newStreet(19, 15, 6, 1),
    newStreet(15, 10, 10, 1)
  ]
};

export default preset1;
