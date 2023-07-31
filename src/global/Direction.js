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
}

export class Direction {
  constructor(value) {
    this._value = value;
  }
  facesRight() { return this._value % 3 === 2 }
  facesUp() { return this._value < 3 }
  facesDown() { return this._value > 5 }
  facesLeft() { return this._value % 3 === 0 }
  isDiagonal() { return this._value % 2 === 0 && this._value !== 4 }
  set(dir) { this._value = dir}
  moveUp() {
    if (this.facesUp()) throw "Direction: Invalid move up";
    this._value -= 3;
  }
  moveRight() {
    if (this.facesRight()) throw "Direction: Invalid move right";
    this._value += 1
  }
  moveDown() {
    if (this.facesDown()) throw "Direction: Invalid move down";
    this._value += 3
  }
  moveLeft() {
    if (this.facesLeft()) throw "Direction: Invalid move left";
    this._value -= 1;
  }
  toString() {
    return Object.entries(directions).filter(([_, v]) => v == this._value)[0][0];
  }
  is(dir) {return this._value === dir}
}
