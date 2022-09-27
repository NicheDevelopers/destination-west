import {randIntInRange} from "./global/utilities.js";
import {maleNames, femaleNames, nicknames, surnames} from "./static/npcNames.js";
import {arr1, arr2} from "./static/townNames.js";

//function returning npcname
function genNpcName(sex, important)
{
    //character can be a male or a female, depend on gender get different name | true - male / false - female

    // selecting part of arrays by drawing indexes
    let part1;
    if (sex) part1 = maleNames[randIntInRange(0,maleNames.length)];
    else part1 = femaleNames[randIntInRange(0,femaleNames.length)];
    let part2 = nicknames[randIntInRange(0,nicknames.length)];
    let part3 = surnames[randIntInRange(0,surnames.length)];


    //character can be important in gameplay, only important characters have nicknames | true - important / false - not important

    // creating full npcname from scraps
    let npcname;
    if (important) npcname = part1 + " " + "'" + part2 + "'" + " " + part3;
    else npcname = part1 + " " + part3;

    //return
    return npcname;
}


//function returning townname
function genTownName(p_capitalletter_in_townname)
{
    // selecting part of arrays by drawing indexes
    let part1 = arr1[randIntInRange(0,arr1.length)];
    let part2 = arr2[randIntInRange(0,arr2.length)];


    // if part1 is like: "Devil's" or "Bull's" get capital letter in part2
    if (part1[part1.length-2]=="'") part2=part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter

    
    // chance of getting capital letter in part2 depending on given p_capitalletter_in_townname
    if (Math.random() <= p_capitalletter_in_townname) part2=part2.charAt(0).toUpperCase() + part2.slice(1); //getting capital letter
    // else nothing will change


    // creating full townname from scraps
    let townname="";
    // case1 - if part2 begin with capital letter - add space
    if (part2[0] >='A' && part2[0] <= 'Z') townname = part1 + " " + part2;
    //otherwise - if part2 begin with lower letter - without space
    else townname = part1 + part2;

    //return
    return townname;
}

export {genNpcName, genTownName};
