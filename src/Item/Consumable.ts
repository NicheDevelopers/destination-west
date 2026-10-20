import Item from "./Item.js";
import { toPrettyJson as toJson } from "@/utilities/utilities.js";
import type { RecipeConsumable } from "@/global/items.js";

type EffectName = "health" | "accuracy";

class Consumable extends Item {
  declare recipe: RecipeConsumable;
  effects: Array<[EffectName, number]>;

  constructor(recipe: RecipeConsumable) {
    super(recipe);
    /**
     * Effects of the consumable
     * @example [['health', 10], ['accuracy', 15]]
     */
    this.effects = recipe.effects;
  }

  static validateSpecialFields(recipe: RecipeConsumable): void {
    if (!recipe.effects)
      throw new Error(
        `Consumable recipe must have an 'effects' property.\n` +
          `Recipe received: ${toJson(recipe)}`,
      );
    if (!Array.isArray(recipe.effects))
      throw new Error(
        `Consumable recipy must have an 'effects' property which ` +
          `is an array of objects.\n` +
          `Effects received: ${toJson(recipe.effects)}`,
      );
    for (const effect of recipe.effects) {
      if (!Array.isArray(effect))
        throw new Error(
          `Each effect in the consumable recipe must be an array ` +
            `with two elements: a string and a number.\n` +
            `Effect received: ${toJson(effect)}`,
        );
      if (effect.length !== 2)
        throw new Error(
          `Each effect in the consumable recipe must have exactly ` +
            `two elements: a string and a number.\n` +
            `Effect received: ${toJson(effect)}`,
        );
      if (typeof effect[0] !== "string" || typeof effect[1] !== "number")
        throw new Error(
          `Each effect in the consumable recipe must have a string ` +
            `as the first element and a number as the second element.\n` +
            `Effect received: ${toJson(effect)}`,
        );
      // TODO: validate effect names (when they are defined,
      // probably as a part of a combatant trait)
    }
  }

  /**
   * Method for deep copy of Item object. Generates new Sprite.
   */
  deepCopy(): Consumable {
    const copy = new Consumable(this.recipe);
    copy.durability = this.durability;
    return copy;
  }
}

export default Consumable;
