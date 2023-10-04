/*
  file: src/nameGenerators.js
  purpose: Define functions for creating randomized names for NPCs and Towns
  author: Oskar Kiliańczyk <https://gitlab.com/oskkil>
  
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

import { roll } from "../global/utilities.js";
import { maleNames, femaleNames, nicknames, surnames } from "./npcNames.js";
import { arr1, arr2 } from "./townNames.js";
import { percentageOfTwoNameTown } from "../global/consts.js";

//function returning npcname
function genNpcName(sex, important) {
  //character can be a male or a female, depend on gender get different name | true - male / false - female

  // selecting part of arrays by drawing indexes
  let part1;
  if (sex) part1 = maleNames.randomElement();
  else part1 = femaleNames.randomElement();
  let part2 = nicknames.randomElement();
  let part3 = surnames.randomElement();

  //character can be important in gameplay, only important characters have nicknames | true - important / false - not important

  // creating full npcname from scraps
  let npcname;
  if (important) npcname = part1 + " " + "'" + part2 + "'" + " " + part3;
  else npcname = part1 + " " + part3;

  //return
  return npcname;
}

//function returning townname
function genTownName() {
  // selecting part of arrays by drawing indexes
  let part1 = arr1.randomElement();
  let part2 = arr2.randomElement();

  // if part1 is like: "Devil's" or "Bull's" get capital letter in part2
  if (part1[part1.length - 2] == "'") part2 = part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter

  // chance of getting capital letter in part2 depending on given percentageOfTwoNameTown 
  if (roll(percentageOfTwoNameTown)) part2 = part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter
  // else nothing will change

  // creating full townname from scraps
  let townname = "";
  // case1 - if part2 begin with capital letter - add space
  if (part2[0] >= 'A' && part2[0] <= 'Z') townname = part1 + " " + part2;
  //otherwise - if part2 begin with lower letter - without space
  else townname = part1 + part2;

  //return
  return townname;
}

export { genNpcName, genTownName };
