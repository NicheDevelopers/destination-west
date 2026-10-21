import type { RecipeWeapon } from "@/game/items";
import Item from "./Item";

class Weapon extends Item {
  declare recipe: RecipeWeapon;
  weaponType: string;
  damage: number;
  critChance: number;
  critMultiplier: number;
  durabilityLossPerUse: number;

  constructor(recipe: RecipeWeapon) {
    super(recipe);
    this.weaponType = recipe.weaponType;
    this.damage = recipe.damage;
    this.critChance = recipe.critChance;
    this.critMultiplier = recipe.critMultiplier;
    this.durabilityLossPerUse = recipe.durabilityLossPerUse;
  }

  static override validateSpecialFields(recipe: RecipeWeapon): void {
    const props: (keyof RecipeWeapon)[] = [
      "weaponType",
      "damage",
      "critChance",
      "critMultiplier",
      "durabilityLossPerUse",
    ];
    const throwValidationError: (prop: keyof RecipeWeapon) => void = (prop) => {
      throw new Error(
        `Weapon recipe must have a '${prop}' property.\n` +
          `Recipe received: ${JSON.stringify(recipe)}`,
      );
    };
    for (const prop of props) {
      if (!recipe[prop]) throwValidationError(prop);
    }
  }

  reduceDurability(times: number): void {
    if (this.durabilityLossPerUse * times > this.durability) {
      // TODO: Handle weapon breakage (e.g., remove from inventory, notify player, make weapon unusable)
      throw new Error(
        `Weapon ${this.name} durability cannot be reduced by ${this.durabilityLossPerUse * times} ` +
          `because it only has ${this.durability} durability left.`,
      );
    }
    this.durability -= this.durabilityLossPerUse * times;
  }

  /**
   * Method for deep copy of Item object. Generates new Sprite.
   */
  override deepCopy(): Weapon {
    const copy = new Weapon(this.recipe);
    copy.durability = this.durability;
    return copy;
  }
}

export default Weapon;
