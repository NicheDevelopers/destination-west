import Npc from "@/game/Entity/Npc";
import type Item from "@/game/Item/Item";
import { createItem, type Recipe } from "./items";

type QuestCondition = () => boolean;

export class Quest {
  npcs: Npc[];
  items: Item[];
  successCondition: QuestCondition;
  failCondition: QuestCondition;
  availabilityCondition: QuestCondition | null;

  constructor(
    npcs: Quest["npcs"],
    items: Quest["items"],
    conditions: {
      success: Quest["successCondition"];
      failure: Quest["failCondition"];
      availability: Quest["availabilityCondition"];
    },
  ) {
    this.npcs = npcs;
    this.items = items;
    this.successCondition = conditions.success;
    this.failCondition = conditions.failure;
    this.availabilityCondition = conditions.availability;
  }
}

export const ItemDistribution = {
  Even: 1,
  Stacked: 2,
  Random: 3,
} as const;
type ItemDistribution = (typeof ItemDistribution)[keyof typeof ItemDistribution];

export const FindQuestType = {
  FindOnTheGround: 1,
  FindInNpcInventories: 2,
  FindInContainers: 3,
} as const;
type FindQuestType = (typeof FindQuestType)[keyof typeof FindQuestType];

export class ItemEntry {
  recipe: Recipe;
  quantity: number;

  constructor(recipe: ItemEntry["recipe"], quantity: ItemEntry["quantity"]) {
    this.recipe = recipe;
    this.quantity = quantity;
  }
}

export class FindQuestConfig {
  type: FindQuestType;
  entries: ItemEntry[];
  distribution: ItemDistribution;

  constructor(
    type: FindQuestConfig["type"],
    entries: FindQuestConfig["entries"],
    distribution: FindQuestConfig["distribution"],
  ) {
    this.type = type;
    this.entries = entries;
    this.distribution = distribution;
  }
}

export class FindQuestBuilder {
  questGiver: Npc;
  config: FindQuestConfig;
  availabilityCondition: QuestCondition | null;

  constructor(
    questGiver: FindQuestBuilder["questGiver"],
    config: FindQuestBuilder["config"],
    availabilityCondition: FindQuestBuilder["availabilityCondition"],
  ) {
    this.questGiver = questGiver;
    this.config = config;
    this.availabilityCondition = availabilityCondition;
  }
  validate(): boolean {
    if (!(this.questGiver instanceof Npc) || !(this.config instanceof FindQuestConfig)) {
      throw new Error("Attempt to create a quest with invalid argument types");
    }
    return true;
  }

  private generateItems(): Item[] {
    const items: Item[] = [];
    for (const entry of this.config.entries) {
      for (let i = 0; i < entry.quantity; i++) {
        items.push(createItem(entry.recipe));
      }
    }
    return items;
  }

  // add handling distributions
  build(): Quest {
    const successCondition = () => {
      // check that the quest giver has required items
      // possibly more conditions
      for (const entry of this.config.entries) {
        if (this.questGiver.equipment.countOf(entry.recipe) < entry.quantity) return false;
      }
      return true;
    };

    const failureCondition = () => {
      return this.questGiver.hp <= 0;
    };

    const items = this.generateItems();

    return new Quest([this.questGiver], items, {
      success: successCondition,
      failure: failureCondition,
      availability: this.availabilityCondition,
    });
  }
}
