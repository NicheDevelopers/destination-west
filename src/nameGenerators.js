import {randIntInRange} from "./global/utilities.js";

//function returning npcname
function genNpcName(sex, important)
{
    // arrays holding name and surname to generate full name of the NPC
    //name
    const tab1male=["Joseph", "Leon", "Alvin", "Harry", "Sam", "Dave", "Jeff", "Guy", "Elmer", "Thomas", "Jim", "Patrick", "Otis", "Martin", "Christopher", "Victor", "Stephen", "Arnold", "Nathan", "Jake", "Perry", "Adam", "Arthur", "Grover", "Lee", "Steve", "Phillip", "Paul", "Emil", "Jasper", "Cornelius", "Robert", "Blake", "Oliver", "Levi"];
    const tab1female=["Catherine", "Olive", "Adeline", "Isabelle", "Victoria", "Gertrude", "Marguerite", "Amanda", "Susie", "Effie", "Caroline", "Augusta", "Jessie", "Kate", "Dorothy", "Julia", "Leona", "Eliza", "Myrtle", "Rachel", "Dollie", "Clara", "Mary", "Iva", "Stella", "Edna", "Lula", "Anna", "Ruby", "Lucy", "Nina"];
    //nickname
    const tab2=["the Kid", "Demon Eyes", "Serpent", "Scarface", "the Bullet", "Brawn", "Killer", "Dusty", "the Predator", "Stab", "Long Shot", "Faih", "the Thinker", "Knife", "Ace High", "Mystery", "Immoral", "Money", "Raven", "Bloodlust", "Coyote", "Hunter", "Big Gun", "Bulldozer", "Deadbeat", "Sunrise", "Wild Hog", "Lone Wolf", "Crimson", "One Eye", "Gravedigger", "Quick Gun", "Dynamite", "Bullseye", "Pistol", "Lefty", "Trapper"];
    //surname
    const tab3=["White", "Whitney", "Wall", "Holman", "Russell", "Carlson", "Wolf", "Powell", "McLean", "Mack", "Lane", "Goff", "Glenn", "Bray", "Cameron", "Stanton", "Gilmore", "Mayer", "Goodman", "McNeil", "Ford", "Browning", "Coleman", "Burris", "Elliott", "Burnett", "Sherman", "Jacobs", "Blackwell", "Hays", "Carr", "Buckley", "Downs", "Houston", "Green", "Lloyd", "Marshall", "Walker", "Roy", "Herring", "Lang", "Spence", "Fletcher", "Haddock", "Hefner", "Pearsoll", "O'Kones", "O'Dane", "Coxwell"];


    //character can be a male or a female, depend on gender get different name | true - male / false - female

    // selecting part of arrays by drawing indexes
    let part1;
    if (sex) part1 = tab1male[randIntInRange(0,tab1male.length)];
    else part1 = tab1female[randIntInRange(0,tab1female.length)];
    let part2 = tab2[randIntInRange(0,tab2.length)];
    let part3 = tab3[randIntInRange(0,tab3.length)];


    //character can be important in gameplay, only important characters have nicknames | true - important / false - not important

    // creating full npcname from scraps
    let npcname;
    if (important) npcname = part1 + " " + "'" + part2 + "'" + " " + part3;
    else npcname = part1 + " " + part3;

    //return
    return npcname;
}


//function returning townname
function genTownName()
{
    // arrays holding parts of string to generate full name of the Town
    const tab1=["Copper", "Wide", "Lead", "Torn", "Abandon", "Desert", "Fair", "Whisper", "Dead", "False", "Lost", "Evil", "Red", "Farm", "Windy", "Skull", "Old", "Sand", "Forsaken", "Wrath", "Grave", "Low", "Wild", "Golden"];
    const tab2=["city", "wood", "stone", "field", "peaks", "river", "point", "howl", "hill", "roost", "cliff", "george", "cross", "edge", "canyon", "tooth", "town", "alley" ,"post", "dune", "mountain", "gate", "lake", "scar", "rock"];


    // selecting part of arrays by drawing indexes
    let part1 = tab1[randIntInRange(0,tab1.length)];
    let part2 = tab2[randIntInRange(0,tab2.length)];


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

export {genNpcName, genTownName};
