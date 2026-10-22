import { seedRoll } from "@/lib/random";
import { maleNames, femaleNames, nicknames, surnames } from "./npcNames";
import { townNamePrefixes, townNameSuffixes } from "./townNames";
import { PERCENTAGE_OF_TWO_NAME_TOWN } from "@/game/consts";

function drawPart(parts: string[]): string {
  const part = parts.srandomElement();
  if (part === undefined) throw new Error("Attempt to draw a name part from an empty list");
  return part;
}

/**
 * Create name for NPCs
 * @param sex true if male, otherwise false
 * @param important true if NPC will be important, if so NPC will get nickname, otherwise none
 * @returns created name
 */
function genNpcName(sex: boolean, important: boolean): string {
  // selecting part of arrays by drawing indexes
  let firstName;
  if (sex) firstName = drawPart(maleNames);
  else firstName = drawPart(femaleNames);
  let nickname = drawPart(nicknames);
  let surname = drawPart(surnames);

  let npcName;
  if (important) npcName = firstName + " " + "'" + nickname + "'" + " " + surname;
  else npcName = firstName + " " + surname;
  return npcName;
}

function genTownName(): string {
  let prefix = drawPart(townNamePrefixes);
  let suffix = drawPart(townNameSuffixes);

  // if prefix is like: "Devil's" or "Bull's" get capital letter in suffix
  if (prefix[prefix.length - 2] == "'") suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1); //getting capital letter

  // chance of getting capital letter in suffix depending on given PERCENTAGE_OF_TWO_NAME_TOWN
  if (seedRoll(PERCENTAGE_OF_TWO_NAME_TOWN))
    suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1); //getting capital letter
  // else nothing will change

  let townName = "";
  // case1 - if suffix begin with capital letter - add space
  if (suffix[0] >= "A" && suffix[0] <= "Z") townName = prefix + " " + suffix;
  //otherwise - if suffix begin with lower letter - without space
  else townName = prefix + suffix;
  return townName;
}

export { genNpcName, genTownName };
