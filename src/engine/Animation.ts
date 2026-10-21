import time from "./time";

/**
   A goal value, a function returning it, or null for no goal.
*/
type AnimationGoal = number | (() => number) | null;

/**
   Class for performing operations independent of the game loop speed
*/
export default class Animation<K extends string = string> {
  private readonly owner: Record<K, number>;
  private readonly key: K;

  /**
     Describes the direction of the change (set on
     animation speed changes).
     Values:
      0 - unset
     -1 - property was recently decreased
     +1 - property was recently increased

     If speed is set to 0 this value is not changed.
  */
  private sign = 0;

  /**
     A float amount of change not yet made because
     of the quantum nature of the animation.
  */
  private changeStack = 0;

  private currentSpeed: number;

  /**
     Change that can be applied to the property in each
     animation tick has to be at least as big as the quantum
     and has to be a multiple of the quantum.
  */
  quantum = 1;

  private goalValue: AnimationGoal = null;
  private changeCallback: () => void = () => {};

  /**
     Create an animation of `owner[key]`
     @param speed - Speed of the animation in change units per second
  */
  constructor(owner: Record<K, number>, key: K, speed: number) {
    this.owner = owner;
    this.key = key;
    this.currentSpeed = speed;
  }

  private get value(): number {
    return this.owner[this.key];
  }

  private set value(newValue: number) {
    this.owner[this.key] = newValue;
  }

  clearChangeStack(): void {
    this.changeStack = 0;
  }

  set speed(newSpeed: number) {
    const newSign = Math.sign(newSpeed);
    if (newSign !== 0 && newSign !== this.sign) {
      this.sign = newSign;

      // changeStack needs to be cleared on direction change
      this.clearChangeStack();
    }

    this.currentSpeed = newSpeed;
  }

  /**
     Speed of the animation in change units per second.
  */
  get speed(): number {
    return this.currentSpeed;
  }

  /**
     Determines the final value of the animated property,
     achieving which stops the animation. Can be set to a
     direct value or to a function returning such value.
     Null means that there is no goal (the animation will never stop).
  */
  set goal(newGoal: AnimationGoal) {
    this.goalValue = newGoal;
  }

  get goal(): number | null {
    if (typeof this.goalValue === "function") return this.goalValue();
    return this.goalValue;
  }

  /**
     Check whether the property value goal has been reached.
     Always false if no goal has been set.
   */
  private goalReached(): boolean {
    const goal = this.goal;
    if (goal === null) return false;
    return (this.speed >= 0 && this.value >= goal) || (this.speed <= 0 && this.value <= goal);
  }

  /**
     Get the difference between the goal value
     and the current property value
   */
  leftToGoal(): number {
    const goal = this.goal;
    if (goal === null) return 0;
    return goal - this.value;
  }

  /**
     Sets a callback function that will be run
     when the animation applies changes to the animated
     property.
  */
  setChangeCallback(cb: () => void): void {
    this.changeCallback = cb;
  }

  /**
     Calculates how much change would be applied to the animated property
     in this tick, has no side effects
   */
  getChangeInThisTick(speed: number = this.speed): number {
    const change = (speed * time.delta) / 1000;
    const changesInThisTick = Math.floor((this.changeStack + change) / this.quantum);
    return changesInThisTick * this.quantum;
  }

  /**
     Calculates how much change should be applied to the animated property
     in this tick, updating its changeStack
   */
  private tick(): number {
    this.changeStack += (this.speed * time.delta) / 1000;
    const changesInThisTick = Math.floor(this.changeStack / this.quantum);
    this.changeStack -= changesInThisTick * this.quantum;
    return changesInThisTick * this.quantum;
  }

  /**
     Update the animated property's state.
     @returns {Boolean} true if the animation's goal isn't set or has
     not been reached, false if the goal has been reached
   */
  next(): boolean {
    if (this.goalReached()) return false;

    const changeNow = this.tick();
    this.value += changeNow;

    if (changeNow !== 0) this.changeCallback();

    if (this.goalReached()) {
      // Make value equal the goal value exactly
      this.finish();
      return false;
    }
    return true;
  }

  finish(): void {
    const goal = this.goal;
    if (goal === null) return;
    this.value = goal;
  }
}

export class MultiAnimation {
  animations: Animation[];
  private endAfter: number;
  private endTime: number = 0;

  /**
     Create an animation of multiple properties at once
     @param options - an object with additional settings
     @option endAfter {Number} - 0 by default, if a positive number is passed the speeds of all the animations will be automatically adjusted to reach the specified goal at the provided time
  */
  constructor(animations: Animation[], options: { endAfter?: number } = {}) {
    this.animations = animations;
    this.endAfter = options.endAfter ?? 0;

    if (this.endAfter) {
      this.endTime = time.now + this.endAfter * 1000;
    }
  }

  /**
     Update the animated properties.
     @returns {Boolean} true if for any properties the animation's goal isn't set or has not been reached, false otherwise
   */
  next(): boolean {
    if (this.endAfter) {
      this.adjustSpeeds((this.endTime - time.now) / 1000);
    }
    let anyRunning = false;
    for (const animation of this.animations) {
      if (animation.next()) anyRunning = true;
    }
    return anyRunning;
  }

  finish(): void {
    this.animations.forEach((anim) => anim.finish());
  }

  /**
     Adjust speeds of the animations to make them finish approximately at the same time
  */
  adjustSpeeds(timeToFinish: number): void {
    if (Number.isNaN(timeToFinish)) {
      throw new Error(`Provided time value is not a valid number: ${timeToFinish}`);
    }
    if (timeToFinish <= 0) {
      this.finish();
      return;
    }

    for (const animation of this.animations) {
      // v = s/t
      if (animation.goal !== null) animation.speed = animation.leftToGoal() / timeToFinish;
    }
  }

  /**
     Set the goal of the multianimation
     @param {Array} goals - array of goal values for all the properties of the multianimation
  */
  set goal(goals: AnimationGoal[]) {
    if (goals.length !== this.animations.length) {
      throw new Error(
        `Setting the goal of the Multianimation with an array ` +
          `of incorrect size. Expected: ${this.animations.length}, ` +
          `got: ${goals.length}`,
      );
    }

    for (let i = 0; i < goals.length; ++i) {
      this.animations[i].goal = goals[i];
    }

    if (this.endAfter) {
      this.adjustSpeeds(this.endAfter);
    }
  }

  get goal(): (number | null)[] {
    return this.animations.map((anim) => anim.goal);
  }

  set quantums(quantums: number[]) {
    for (let i = 0; i < this.animations.length; ++i) {
      this.animations[i].quantum = quantums[i];
    }
  }

  get quantums(): number[] {
    return this.animations.map((anim) => anim.quantum);
  }
}
