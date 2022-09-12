//function returning random int from 0 to max-1
function randomInt(max)
{
    return Math.floor(Math.random()*max);
}


//function returning townname
function generate_townname()
{
    // arrays holding parts of string to generate full name of the Town
    const tab1=["Copper", "Wide", "Lead", "Torn", "Abandon", "Desert", "Fair", "Whisper", "Dead", "False", "Lost", "Evil", "Red", "Farm", "Windy", "Skull", "Old", "Sand", "Forsaken", "Wrath", "Grave", "Low", "Wild"];
    const tab2=["city", "wood", "stone", "field", "peaks", "river", "point", "howl", "hill", "roost", "cliff", "george", "cross", "edge", "canyon", "tooth", "town", "alley" ,"post", "dune", "mountain", "gate", "lake", "scar", "rock"];


    // selecting part of arrays by drawing indexes
    let part1 = tab1[randomInt(tab1.length)];
    let part2 = tab2[randomInt(tab2.length)];


    // add percentage of getting capital letter in part2
    let p_capitalletter_in_townname = 0.4;
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
