import time from "./time";
import "@/lib/utilities";

const ac = {
  speed: 300,
};

/**
   A goal value, a function returning it, or null for no goal.
*/
type AnimationGoal = number | (() => number) | null;

class AnimationProperty {
  owner: Record<string, unknown>;
  key: string;
  sign: number;
  changeStack: number;
  speed: number;
  quantum: number;
  isFunction: boolean;
  private goalValue: AnimationGoal = null;

  constructor(target: object, path: string, speed: number) {
    /**
       The object that holds the animated property. It's the target
       itself, or an object nested in it if the path has dots
       (for path "pos.x" the owner is target.pos).
    */
    this.owner = target as Record<string, unknown>;

    /**
       Key to the property in the owner object.
    */
    this.key = path;

    /**
       Describes the direction of the change (set on
       animation speed changes).
       Values:
        0 - unset
       -1 - property was recently decreased
       +1 - property was recently increased

       If speed is set to 0 this value is not changed.
    */
    this.sign = 0;

    /**
       A float amount of change not yet made because
       of the quantum nature of the animation.
    */
    this.changeStack = 0;

    /**
     Speed of the animation in change units per second.
    */
    this.speed = speed;

    /**
       Change that can be applied to the property in each
       animation tick has to be at least as big as the quantum
       and has to be a multiple of the quantum.
    */
    this.quantum = 1;

    /**
       Determines whether the property is a function and if
       it should be called instead of changing its numerical
       value.
    */
    this.isFunction = path.substring(0, 2) === "()";

    if (this.isFunction) this.key = path.substring(2);

    /**
       An array of keys leading to the property. For example if
       the animation is supposed to modify target.prop.x this array
       will be: ["prop", "x"].
    */
    let propertyPath = path.split(".");
    if (propertyPath.length > 1) {
      this.key = propertyPath.last!;
      for (const field of propertyPath.slice(0, -1)) {
        const nextOwner = this.owner[field];
        if (nextOwner === undefined) {
          throw new Error(
            `Field '${field}' of object '${this.owner.constructor.name}' is undefined`,
          );
        }
        this.owner = nextOwner as Record<string, unknown>;
      }
    }

    if (this.owner[this.key] === undefined)
      throw new Error(
        `Attempt to animate a nonexistent property '${this.key}' ` +
          `of object '${this.owner.constructor.name}' (target of the whole ` +
          `animation is '${target.constructor.name}')`,
      );
  }

  set value(newValue: number) {
    if (this.isFunction) throw new Error(`Function property value reassignment is not allowed!`);

    //console.log(`setting ${this.key} to ${newValue} (object ${this.owner} follows)`, this.owner);
    this.owner[this.key] = newValue;
  }

  get value(): number {
    const value = this.owner[this.key];
    if (typeof value !== "number") {
      throw new Error(`Animated property '${this.key}' is not a number`);
    }
    return value;
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
  goalReached(): boolean {
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
     If this property is a function, call it.
   */
  call(): void {
    const property = this.owner[this.key];
    if (typeof property === "function") property.call(this.owner);
  }
}

/**
   Class for performing operations independent of the game loop speed
*/
export default class Animation {
  property: AnimationProperty;
  private changeCallback: () => void = () => {};

  /**
     Create an animation
     @param {Object} target - The object to animate a property on
     @param {String} path - Path to the animated property, e.g. "pos.x", or "()fn" to call target.fn
     @param {Number} speed - Speed of the animation in change units per second
  */
  constructor(target: object, path: string, speed: number) {
    this.property = new AnimationProperty(target, path, speed);
  }

  clearChangeStack(): void {
    this.property.changeStack = 0;
  }

  set speed(newSpeed: number) {
    let newSign = Math.sign(newSpeed);
    if (newSign !== 0 && newSign !== this.property.sign) {
      this.property.sign = newSign;

      // changeStack needs to be cleared on direction change
      this.clearChangeStack();
    }

    this.property.speed = newSpeed;
  }

  /**
     Speed of the animation in change units per second.
  */
  get speed(): number {
    return this.property.speed;
  }

  set goal(newGoal: AnimationGoal) {
    this.property.goal = newGoal;
  }
  get goal(): number | null {
    return this.property.goal;
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
  getChangeInThisTick(speed: number = this.property.speed, logStackChange = false): number {
    const p = this.property;
    let change = (speed * time.delta) / 1000;
    let changesInThisTick = Math.floor((p.changeStack + change) / p.quantum);

    change -= changesInThisTick * p.quantum;

    if (logStackChange) console.log(p.changeStack, change);

    return changesInThisTick * p.quantum;
  }

  /**
     Calculates how much change should be applied to the animated property
     in this tick, updating its changeStack
   */
  tick(): number {
    const p = this.property;
    p.changeStack += (p.speed * time.delta) / 1000;
    let changesInThisTick = Math.floor(p.changeStack / p.quantum);
    p.changeStack -= changesInThisTick * p.quantum;
    return changesInThisTick * p.quantum;
  }

  /**
     Update the animated property's state.
     @returns {Boolean} true if the animation's goal isn't set or has
     not been reached, false if the goal has been reached
   */
  next(): boolean {
    if (this.property.goalReached()) return false;

    let changeNow = this.tick();

    if (this.property.isFunction) {
      for (let i = 0; i < changeNow; ++i) {
        this.property.call();
      }
      return true;
    }

    this.property.value += changeNow;

    if (changeNow !== 0) this.changeCallback();

    if (this.property.goalReached()) {
      // Make value equal the goal value exactly
      this.finish();
      return false;
    }
    return true;
  }

  finish(): void {
    const goal = this.property.goal;
    if (goal === null) return;
    this.property.value = goal;
  }
}

export class MultiAnimation {
  animations: Animation[];
  private endAfter: number;
  private endTime: number = 0;

  /**
  Create an animation
     @param {Object} target - The object to animate properties on
     @param {Array} paths - Paths to the animated properties
     @param {Array} speeds - Speeds of the animations in change units per second
     @param {Object} options - an object with additional settings
     @option propertyGoals {Array} - an array of property goals to be set. Can be accessed and modified using the 'goal' getter or setter.
     @option endAfter {Number} - 0 by default, if a positive number is passed the speeds of all the animations will be automatically adjusted to reach the specified goal at the provided time
  */
  constructor(
    target: object,
    paths: string[],
    speeds: number[] = [],
    options: { endAfter?: number } = {},
  ) {
    this.animations = [];

    for (let i = 0; i < paths.length; ++i) {
      const animation = new Animation(target, paths[i], speeds[i] ?? ac.speed);
      if (animation.property.isFunction)
        throw new Error(`Function properties not yet allowed in MultiAnimations`);
      this.animations.push(animation);
    }

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
    return this.animations.map((anim) => anim.next()).some((result) => result);
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
      if (animation.goal !== null) animation.speed = animation.property.leftToGoal() / timeToFinish;
    }
    //console.log('to do: ', this.getGoalStates());
    //console.log('speeds adjusted to: ', this.animations.map((a) => a.speed));
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
    return this.animations.map((anim) => anim.property.goal);
  }

  getGoalStates(): number[] {
    return this.animations.map((anim) => anim.property.leftToGoal());
  }

  set quantums(quantums: number[]) {
    for (let i = 0; i < this.animations.length; ++i) {
      this.animations[i].property.quantum = quantums[i];
    }
  }

  get quantums(): number[] {
    return this.animations.map((anim) => anim.property.quantum);
  }

  setQuantum(propertyIndex: number, quantum: number): void {
    this.animations[propertyIndex].property.quantum = quantum;
  }
}
