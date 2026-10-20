import Sprite from "@/Sprite/Sprite.js";
import type { Recipe } from "@/global/items.js";
import { generateID } from "@/utilities/utilities.js";

class Item {
  readonly id: number;
  recipe: Recipe;
  name: string;
  spriteName: string;
  sprite: Sprite;
  durability: number;
  weight: number;
  price: number;
  priceRetention: number;
  isStackable: boolean;
  constructor(recipe: Recipe) {
    new.target.validateRecipe(recipe);
    this.recipe = recipe;
    this.id = generateID(Item);
    this.name = recipe.name;
    this.spriteName = recipe.spriteName;
    this.sprite = new Sprite(recipe.spriteName, { crop: true, nocache: true });
    this.durability = recipe.durability;
    this.weight = recipe.weight;
    this.price = recipe.price;
    this.priceRetention = recipe.priceRetention;
    this.isStackable = recipe.isStackable;
  }

  getResellPrice(): number {
    return this.price * this.priceRetention;
  }

  /**
   * Validate item recipe for this particular item type.
   * @param {Recipe} recipe - item recipe
   */
  static validateRecipe(recipe: Recipe): void {
    // if (!recipe.recipeType)
    //   throw new Error(
    //     `Item recipe must have a 'recipeType' property.\n` +
    //       `Recipe received: ${toPrettyJson(recipe)}`,
    //   );
    // if (recipe.recipeType.name !== this.name)
    //   throw new Error(
    //     `Attempt to create an item of type ${this.name} ` +
    //       `from a recipe indicating type ${recipe.recipeType.name}`,
    //   );
    this.validateSpecialFields(recipe);
  }

  /**
   * Validate whether the recipe has all the necessary fields to create this specific type of item.
   * Method meant to be overridden by subclasses.
   * @param {Recipe} recipe - item recipe
   */
  static validateSpecialFields(_recipe: Recipe): void {}

  /**
   * Method for deep copy of Item object. Generates new Sprite.
   * @returns {Item} deep copy Item
   */
  deepCopy(): Item {
    const copy = new Item(this.recipe);
    copy.durability = this.durability;
    return copy;
  }
}
export default Item;
