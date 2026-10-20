/* Directions are represented by numbers,
   according to the following diagram:
   
         N
      0  1  2
   W  3  4  5  E
      6  7  8
         S
      
*/

import { DIRECTIONS, type DirectionValue } from "@/global/consts.js";

class Direction {
  private value: DirectionValue;

  constructor(value: DirectionValue = DIRECTIONS.none) {
    this.value = value;
  }
  facesRight(): boolean {
    return this.value % 3 === 2;
  }
  facesUp(): boolean {
    return this.value < 3;
  }
  facesDown(): boolean {
    return this.value > 5;
  }
  facesLeft(): boolean {
    return this.value % 3 === 0;
  }
  isDiagonal(): boolean {
    return this.value % 2 === 0 && this.value !== 4;
  }
  setTo(dir: DirectionValue): void {
    this.value = dir;
  }
  fromChangeInXAndY(dx: number, dy: number): this {
    this.value = DIRECTIONS.none;
    if (dx > 0) this.moveRight();
    else if (dx < 0) this.moveLeft();

    if (dy > 0) this.moveDown();
    else if (dy < 0) this.moveUp();
    return this;
  }
  moveUp(): void {
    if (this.facesUp()) throw new Error("Direction: Invalid move up");
    this.shift(-3);
  }
  moveRight(): void {
    if (this.facesRight()) throw new Error("Direction: Invalid move right");
    this.shift(1);
  }
  moveDown(): void {
    if (this.facesDown()) throw new Error("Direction: Invalid move down");
    this.shift(3);
  }
  moveLeft(): void {
    if (this.facesLeft()) throw new Error("Direction: Invalid move left");
    this.shift(-1);
  }
  /**
   * Set the direction's internal value to DIRECTIONS.none
   */
  reset(): void {
    this.value = DIRECTIONS.none;
  }
  toString(): string {
    return Object.entries(DIRECTIONS).filter(([, v]) => v == this.value)[0][0];
  }
  is(dir: DirectionValue): boolean {
    return this.value === dir;
  }
  xAxisMultiplier(): number {
    return Number(this.facesRight()) - Number(this.facesLeft());
  }
  yAxisMultiplier(): number {
    return Number(this.facesDown()) - Number(this.facesUp());
  }
  private shift(by: number): void {
    this.value = (this.value + by) as DirectionValue;
  }
}

export default Direction;
