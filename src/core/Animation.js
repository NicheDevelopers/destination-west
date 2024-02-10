/*
  file: src/Animation.js
  purpose: Define the Animation class for managing animated sprites
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/

import time from "../global/time.js";
import "../global/utilities.js";

const ac = {
  speed: 300
};

class AnimationProperty {
  constructor(host, propertyName, speed) {
    /**
       The object to animate the property on.
    */
    this.host = host;

    /**
       The name of the property.
       Key to the property in the host object.
    */
    this.name = propertyName;

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
    this.isFunction = false;
    
    /**
       Determines the final value of the animated property,
       achieving which stops the animation. Can be set to a
       direct value or to a function returning such value.
       Null means any value is accepted, undefined means
       that there is no goal (the animation will never stop).
    */
    this.goal = undefined;
    
    this.isFunction = (propertyName.substring(0, 2) === '()');
    
    if (this.isFunction)
      this.name = propertyName.substring(2);

    /**
       An array of keys leading to the property. For example if
       the animation is supposed to modify host.prop.x this array
       will be: ["prop", "x"].
    */
    let propertyPath = propertyName.split('.');
    if (propertyPath.length > 1) {
      this.name = propertyPath.last;
      this.host = propertyPath.slice(0, propertyPath.length-1)
	.reduce((acc, val) => {
	  if (acc[val] === undefined) {
	    throw `Field '${val}' of object ` +
	      `'${acc.constructor.name}' is undefined`;
	  }
	  return acc[val];
	}, this.host);
    }

    if (this.value === undefined)
      throw `Attempt to animate a nonexistent property '${this.name}' ` +
      `of host '${this.host.constructor.name}' (host of the whole ` +
      `animation is '${host.constructor.name}')`;
  }

  set value(newValue) {
    if (this.isFunction)
      throw `Function property value reassignment is not allowed!`;

    //console.log(`setting ${this.name} to ${newValue} (object ${this.host} follows)`, this.host);
    this.host[this.name] = newValue;
  }
  
  get value() {
    return this.host[this.name];
  }

  set goal(newGoal) {
    this._goal = newGoal;
  }

  get goal() {
    if (typeof this._goal === "function")
      return this._goal();
    return this._goal;
  }
  
  /**
     Check whether the property value goal has been reached
     for a specified host. Returns a boolean and null if no
     goal has been set.
   */
  goalReached() {
    if (this.goal === undefined) return null;
    if (this.goal === null) return true;
    return (this.speed >= 0 && this.value >= this.goal) ||
      (this.speed <= 0 && this.value <= this.goal);
  }

  /**
     Get the difference between the goal value
     and the current property value
   */
  leftToGoal() {
    return this.goal-this.value;
  }

  /**
     If this property is a funciton, call it.
     Return null otherwise.
   */
  call() {
    if (this.isFunction === false) return null;
    
    this.value.call(this.host);
  }
}

/**
   Class for performing operations independent of the game loop speed
*/
export default class Animation {
  /**
     Create an animation
     @param {Object} host - The object to animate a property on
     @param {String} propertyName - Name of the animated property
     @param {Number} speed - Speed of the animation in change units per second
  */
  constructor(host, propertyName, speed) {
    this.host = host;    
    this.property = new AnimationProperty(host, propertyName, speed);
    this._changeCallback = null;
  }

  clearChangeStack() {
    this.property.changeStack = 0;
  }
  
  set speed(newSpeed) {
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
  get speed() {
    return this.property.speed;
  }

  set goal(newGoal) {
    this.property.goal = newGoal;
  }
  get goal() {
    return this.property.goal;
  }

  /**
     Sets a callback function that will be run
     when the animation applies changes to the animated
     property.
  */
  setChangeCallback(cb) {
    this._changeCallback = cb;
  }

  /**
     Calculates how much change would be applied to the animated property
     in this tick, has no side effects
   */
  getChangeInThisTick(testSpeed) {
    let speed = testSpeed ?? this.property.speed;

    let change = (speed * time.delta) / 1000;

    return Math.floor(
      (this.property.changeStack + change) / this.property.quantum);
  }

  /**
     Calculates how much change should be applied to the animated property
     in this tick, updating its changeStack
   */
  tick() {
    const p = this.property;
    p.changeStack += (p.speed * time.delta) / 1000;
    let changesInThisTick = ~~(p.changeStack / p.quantum);
    p.changeStack -= changesInThisTick * p.quantum;
    return changesInThisTick * p.quantum;
  }

  /**
     Update the animated property's state.
     @returns {Boolean} true if the animation's goal isn't set or has
     not been reached, false if the goal has been reached
   */
  next() {
    if (this.property.goalReached())
      return false;
    
    let changeNow = this.tick();

    if (this.property.isFunction) {
      for (let i = 0; i < changeNow; ++i) {
	this.property.call();
      }
      return true;
    }

    this.property.value += changeNow;

    if (this._changeCallback && changeNow !== 0)
      this._changeCallback();
    
    if (this.property.goalReached()){
      // Make value equal the goal value exactly
      this.property.value = this.property.goal;
      return false;
    }
    return true;
  }

  finish() {
    this.property.value = this.property.goal;
  }
}

/**
   An animation of multiple properties
*/
export class MultiAnimation {
  /**
  Create an animation
     @param {Object} host - The object to animate properties on
     @param {Array} propertyNames - Names of the animated properties
     @param {Array} speeds - Speeds of the animations in change units per second
     @param {Object} options - an object with additional settings
     @option propertyGoals {Array} - an array of property goals to be set. Can be accessed and modified using the 'goal' getter or setter.
     @option endAfter {null | Number} - null by default, if number passed the speeds of all the animations will be automatically adjusted to reach the specified goal at the provided time
  */
  constructor(host, propertyNames, speeds=[], options={}) {
    this.host = host;
    this.animations = [];
    
    for (let i=0; i<propertyNames.length; ++i) {
      this.animations.push(
	new Animation(this.host, propertyNames[i], speeds[i] ?? ac.speed));
      if (this.animations.last.isFunction)
	throw `Function properties not yet allowed in MultiAnimations`;
    }

    this.options = {
      endAfter: options.endAfter ?? null
    };

    if (this.options.endAfter) {
      this.options._endTime = time.now + this.options.endAfter*1000;
    }
  }

  /**
     Update the animated properties.
     @returns {Boolean} true if for any properties the animation's goal isn't set or has not been reached, false otherwise
   */
  next() {
    if (this.options.endAfter) {
      this.adjustSpeeds((this.options._endTime-time.now)/1000);
    }
    return this.animations.map((anim) => anim.next())
      .some((result) => result);
  }

  finish() {
    this.animations.forEach((anim) => anim.finish());
  }
  
  /**
     Adjust speeds of the animations to make them finish approximately at the same time
  */
  adjustSpeeds(timeToFinish) {
    let time = Number(timeToFinish);
    if (Number.isNaN(time)) {
      throw `Provided time value is not a valid number: ${timeToFinish}`;
    }
    if (timeToFinish <= 0) {
      this.finish();
      return;
    }
    console.log(timeToFinish);
    for (const animation of this.animations) {
      // v = s/t
      if (animation.goal !== null)
	animation.speed = animation.property.leftToGoal() / timeToFinish;
    }
    //console.log('to do: ', this.getGoalStates());
    //console.log('speeds adjusted to: ', this.animations.map((a) => a.speed));
  }
  
  /**
     Set the goal of the multianimation
     @param {Array} goals - array of goal values for all the properties of the multianimation
  */
  set goal(goals) {
    if (goals?.length !== this.animations.length) {
      throw `Setting the goal of the Multianimation with an array ` +
	`of incorrect size. Expected: ${this.animations.length}, ` +
	`got: ${goals?.length}`;
    }
    
    for (let i=0; i<goals.length; ++i) {
      this.animations[i].goal = goals[i];
    }
    
    if (this.options.endAfter) {
      this.adjustSpeeds(this.options.endAfter);
    }
  }

  get goal() {
    return this.animations.map((anim) => anim.property.goal);
  }

  getGoalStates() {
    return this.animations.map((anim) => anim.property.leftToGoal());
  }

  set quantums(quantums) {
    for (let i=0; i<this.animations.length; ++i) {
      this.animations[i].property.quantum = quantums[i];
    }
  }

  get quantums() {
    return this.animations.map((anim) => anim.property.quantum);
  }
  
  setQuantum(propertyIndex, quantum) {
    this.animations[propertyIndex].property.quantum = quantum;
  }
}
