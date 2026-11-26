import Sprite from "@/engine/Sprite/Sprite";
import type { Recipe } from "@/game/items";
import { generateID } from "@/lib/utilities";

class Item {
  readonly id: number;
  recipe: Recipe;
  name: string;
  spriteName: string;
  sprite: Sprite;
  durability: number;
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
    this.price = recipe.price;
    this.priceRetention = recipe.priceRetention;
    this.isStackable = recipe.isStackable;
  }

  getResellPrice(): number {
    return this.price * this.priceRetention;
  }

  /**
   * Validate item recipe for this particular item type.
   */
  static validateRecipe(recipe: Recipe): void {
    this.validateSpecialFields(recipe);
  }

  /**
   * Validate whether the recipe has all the necessary fields to create this specific type of item.
   * Method meant to be overridden by subclasses.
   */
  static validateSpecialFields(_recipe: Recipe): void {}

  /**
   * Method for deep copy of Item object. Generates new Sprite.
   */
  deepCopy(): Item {
    const copy = new Item(this.recipe);
    copy.durability = this.durability;
    return copy;
  }
}
export default Item;
