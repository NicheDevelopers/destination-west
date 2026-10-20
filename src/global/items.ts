import Item from "../Item/Item.js";
import Consumable from "../Item/Consumable.js";
import Weapon from "../Item/Weapon.js";

/**
 * Create an item from an item recipe
 * @param {Recipe} recipe - an item recipe from the items enum
 * @returns {Item} - the newly created item
 */
export function createItem(recipe: Recipe): Item {
  //return new recipe.type(recipe);
  if (recipe.recipeType === "item") return new Item(recipe);
  if (recipe.recipeType === "weapon") return new Weapon(recipe);
  if (recipe.recipeType === "consumable") return new Consumable(recipe);
  throw new Error(`Unknown recipe type for: ${JSON.stringify(recipe)}`);
}

export type Recipe = RecipeItem | RecipeConsumable | RecipeWeapon;

export interface RecipeType {
  name: Item["name"];
  spriteName: Item["spriteName"];
  durability: Item["durability"];
  weight: Item["weight"];
  price: Item["price"];
  priceRetention: Item["priceRetention"];
  isStackable: Item["isStackable"];
}

export interface RecipeItem extends RecipeType {
  recipeType: "item";
}

export interface RecipeConsumable extends RecipeType {
  recipeType: "consumable";
  effects: Consumable["effects"];
}
export interface RecipeWeapon extends RecipeType {
  recipeType: "weapon";
  weaponType: Weapon["weaponType"];
  damage: Weapon["damage"];
  critChance: Weapon["critChance"];
  critMultiplier: Weapon["critMultiplier"];
  durabilityLossPerUse: Weapon["durabilityLossPerUse"];
}

export const items = {
  apple: {
    recipeType: "consumable",
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
    recipeType: "consumable",
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
    recipeType: "consumable",
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
    recipeType: "item",
    name: "Broken Bottle",
    spriteName: "broken-bottle",
    durability: 0,
    weight: 1,
    price: 0.5,
    priceRetention: 0,
    isStackable: false,
  },
  revolver1: {
    recipeType: "weapon",
    name: "Revolver",
    spriteName: "revolver-1",
    durability: 100,
    weight: 7,
    price: 200,
    priceRetention: 0,
    isStackable: false,
    weaponType: "revolver",
    damage: 3,
    critChance: 0.2,
    critMultiplier: 2.5,
    durabilityLossPerUse: 4,
  },
  revolver2: {
    recipeType: "weapon",
    name: "Revolver",
    spriteName: "revolver-2",
    durability: 100,
    weight: 5,
    price: 150,
    priceRetention: 0,
    isStackable: false,
    weaponType: "revolver",
    damage: 5,
    critChance: 0.1,
    critMultiplier: 3,
    durabilityLossPerUse: 4,
  },
} satisfies Record<string, Recipe>;
