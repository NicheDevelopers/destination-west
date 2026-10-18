import Item from "../Item/Item.js";
import Consumable from "../Item/Consumable.js";
import Weapon from "../Item/Weapon.js";

/**
 * Create an item from an item recipe
 * @param {Object} recipe - an item recipe from the items enum
 * @returns {Item} - the newly created item
 */
export function createItem(recipe) {
  //return new recipe.type(recipe);
  if (recipe.recipeType === Item) {
    return new Item(recipe);
  }
  if (recipe.recipeType === Weapon) return new Weapon(recipe);

  return new Consumable(recipe);
}

export const items = {
  apple: {
    recipeType: Consumable,
    name: "Apple",
    spriteName: "apple",
    durability: 0,
    weight: 5,
    price: 1,
    priceRetention: 0,
    isStackable: true,
    effects: [["health", 5]],
  },
  cigar: {
    recipeType: Consumable,
    name: "Cigar",
    spriteName: "cigar",
    durability: 0,
    weight: 1,
    price: 1,
    priceRetention: 0,
    isStackable: false,
    effects: [
      ["health", 10],
      ["accuracy", 15],
    ],
  },
  whisky: {
    recipeType: Consumable,
    name: "Whisky",
    spriteName: "whisky",
    durability: 0,
    weight: 3,
    price: 3,
    priceRetention: 0,
    isStackable: true,
    effects: [
      ["health", 10],
      ["accuracy", -5],
    ],
  },
  brokenBottle: {
    recipeType: Item,
    name: "Broken Bottle",
    spriteName: "broken-bottle",
    durability: 0,
    weight: 1,
    price: 0.5,
    priceRetention: 0,
    isStackable: false,
  },
  revolver1: {
    recipeType: Weapon,
    name: "Revolver",
    spriteName: "revolver-1",
    durability: 100,
    weight: 7,
    price: 200,
    priceRetention: 0,
    isStackable: false,
    type: "revolver",
    damage: 3,
    critChance: 0.2,
    critMultiplier: 2.5,
    durabilityLossPerUse: 4,
  },
  revolver2: {
    recipeType: Weapon,
    name: "Revolver",
    spriteName: "revolver-2",
    durability: 100,
    weight: 5,
    price: 150,
    priceRetention: 0,
    isStackable: false,
    type: "revolver",
    damage: 5,
    critChance: 0.1,
    critMultiplier: 3,
    durabilityLossPerUse: 4,
  },
};
