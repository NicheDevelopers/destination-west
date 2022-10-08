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

import time from "./global/time.js";

function calculateChangeInThisTick(element){
  element.changeStack += (element.speed*time.delta) / 1000;
  let changesInThisTick = (element.changeStack/element.quantum) | 0;
  element.changeStack -= changesInThisTick;      
  return changesInThisTick;
}

/**
 * Class for performing operations independent of the game loop speed
 */
class Animation{
  /**
   * Create an animation
   @param {Object} host - The object to animate
   @param {string, Array} value - A string or an array of strings describing animations
   @param {number, Array} speed - Speed or an array of speeds of the animation in changes per second
   @param {number} quantums - A number or array of numbers specifying the smallest portion the value can change by
  */
  constructor(host, values, speeds, options={}){
    this.host = host;
    values = [].concat(values??[]);
    if (!values.length) throw "Animation: No values specified";
    this.properties = [];
    this.methods = [];
    this.propertyMap = new Map(); // property name -> property object
    speeds = [].concat(speeds??[]);
    let quantums = [].concat(options.quantums??[]);
    
    values.forEach((v, i) => {
      let property = {
	changeStack: 0,
	speed: speeds[i] ?? 60,
	quantum: quantums[i] ?? 1,
      };
      if (v.substring(0,2) === '()'){
	property.name = v.substring(2);
	this.methods.push(property);
	//this.methodMap.set(property.name, property);
	return;
      }
      property.name = v;
      property.direction = true;
      
      if (property.speed < 0) {
	property.direction = false;
	property.speed *= -1;
      }
      
      this.properties.push(property);
      this.propertyMap.set(property.name, property);
    });
  }
  set speed(speed){
    let direction = true;
    if (speed < 0) {
      direction = false;
      speed *= -1;
    }
    this.properties.forEach((property) => {
      property.direction = direction;
      property.speed = speed;
    });
    this.methods.forEach((method) => {
      method.speed = speed;
    });
  }
  get speed(){
    if (this.properties.length > 1)
      throw 'Animation: Adjusting speeds for multianimations' +
      ' is not supported yet.';
    return this.properties[0].speed;
  }
  getChangeInThisTick(property, testSpeed){
    property = this.propertyMap.get(property);
    
    testSpeed = testSpeed ?? property.speed;

    let change = (testSpeed*time.delta) / 1000;
    return ((property.direction)? 1 : -1) *
      (((property.changeStack+change)/property.quantum) | 0);
  }
  
  next(){
    this.properties.forEach((property) => {
      if (property.speed === 0) return;
      let changesNow = calculateChangeInThisTick(property);
      this.host[property.name] +=
      ((property.direction)? 1 : -1) * changesNow;
    });
    this.methods.forEach((method) => {
      let changesNow = calculateChangeInThisTick(method);
      for (let i=0; i < changesNow; ++i){
	this.host[method.name].call(this.host);
      }
    });
  }
}
export default Animation;
