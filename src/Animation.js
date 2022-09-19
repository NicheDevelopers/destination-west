/*
  file: src/time.js
  purpose: Define the time global object for managing time and frames
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

function calculateChangesInThisTick(element){
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
	this.methods.push(v.substring(2));
	return;
      }
      if (v[0] === '-'){
	property.name = v.substring(1);
	property.direction = false;
	this.properties.push(property);
	return;
      }
      property.name = v;
      property.direction = true;
      this.properties.push(property);
    });
  }
  next(){
    this.properties.forEach((property) => {
      let changesNow = calculateChangesInThisTick(property);
      this.host[property.name] +=
      ((property.direction)? 1 : -1) * changesNow;
    });
    this.methods.forEach((method) => {
      let changesNow = calculateChangesInThisTick(method);
      for (let i=0; i < changesNow; ++i){
	this.host[method.name].call(this.h);
      }
    });
  }
}
export default Animation;
