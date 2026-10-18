import Npc from "./Entity/Npc.js";
import { createItem } from "./global/items.js";

export class Quest {
  constructor(npcs, items, { success, failure }) {
    this.npcs = npcs;
    this.items = items;
    this.successCondition = success;
    this.failCondition = failure;
  }
}

export const ItemDistribution = {
  Even: 1,
  Stacked: 2,
  Random: 3,
};
export const FindQuestType = {
  FindOnTheGround: 1,
  FindInNpcInventories: 2,
  FindInContainers: 3,
};
export class ItemEntry {
  constructor(itemObj, numOfItems) {
    this.itemObj = itemObj;
    this.numOfItems = numOfItems;
  }
}

export class FindQuestConfig {
  constructor(type, entries, distribution) {
    this.type = type;
    this.entries = entries;
    this.distribution = distribution;
  }
}

export class FindQuestBuilder {
  constructor(questGiver, config, availaibilityCondition, npcs) {
    this.questGiver = questGiver;
    this.npcs = npcs;
    this.config = config;
    this.availabilityCondition = availaibilityCondition;
  }
  validate() {
    let res = this.questGiver instanceof Npc && this.config instanceof FindQuestConfig;
    if (!res) {
      throw new Error("Attempt to create a quest with invalid argument types");
    }
    return true;
  }

  _generateItems() {
    return this.config.entries
      .map((e) => {
        return Array.from({ length: e.numOfItems }, () => createItem(e.itemObj));
      })
      .flat();
  }

  // add handling distributions
  build() {
    const successCondition = () => {
      const npcHasItems =
        // check that the quest giver has required items
        // possibly more conditions
        this.questGiver.equipment.countOf(this._item) == this.itemNumber;
      return npcHasItems;
    };

    const failureCondition = () => {
      return this.questGiver.hp <= 0;
    };

    const items = this._generateItems();

    return new Quest([this.questGiver], items, {
      success: successCondition,
      failure: failureCondition,
      availability: this.availabilityCondition,
    });
  }
}
