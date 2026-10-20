import { seedRoll } from "@/utilities/random.js";
import { maleNames, femaleNames, nicknames, surnames } from "./npcNames.js";
import { arr1, arr2 } from "./townNames.js";
import { PERCENTAGE_OF_TWO_NAME_TOWN } from "@/global/consts.js";

/**
 * Create name for NPCs
 * @param {boolean} sex true if male, otherwise false
 * @param {boolean} important true if NPC will be important, if so NPC will get nickname, otherwise none
 * @returns {string} created name
 */
function genNpcName(sex, important) {
  // selecting part of arrays by drawing indexes
  let part1;
  if (sex) part1 = maleNames.srandomElement();
  else part1 = femaleNames.srandomElement();
  let part2 = nicknames.srandomElement();
  let part3 = surnames.srandomElement();

  let npcname;
  if (important) npcname = part1 + " " + "'" + part2 + "'" + " " + part3;
  else npcname = part1 + " " + part3;
  return npcname;
}

function genTownName() {
  let part1 = arr1.srandomElement();
  let part2 = arr2.srandomElement();

  // if part1 is like: "Devil's" or "Bull's" get capital letter in part2
  if (part1[part1.length - 2] == "'") part2 = part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter

  // chance of getting capital letter in part2 depending on given PERCENTAGE_OF_TWO_NAME_TOWN
  if (seedRoll(PERCENTAGE_OF_TWO_NAME_TOWN)) part2 = part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter
  // else nothing will change

  let townname = "";
  // case1 - if part2 begin with capital letter - add space
  if (part2[0] >= "A" && part2[0] <= "Z") townname = part1 + " " + part2;
  //otherwise - if part2 begin with lower letter - without space
  else townname = part1 + part2;
  return townname;
}

export { genNpcName, genTownName };
