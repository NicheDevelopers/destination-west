import type Item from "@/game/Item/Item";
import { createItem, type Recipe } from "@/game/items";
import { generateID } from "@/lib/utilities";
import { notifier, Notification } from "@/engine/notifier";

export interface EquipmentItemRecipe {
  recipe: Recipe;
  quantity: number;
}

export class EquipmentRecord {
  readonly id: number;
  readonly item: Item;
  quantity: number;

  constructor(item: Item, quantity: number) {
    this.id = generateID(EquipmentRecord);
    this.item = item;
    this.quantity = quantity;
  }
}

class Equipment {
  cash: number;
  records: EquipmentRecord[] = [];

  constructor(startCash: number) {
    this.cash = startCash;
  }

  fillRecords(itemObjList: EquipmentItemRecipe[]): void {
    for (const itemObj of itemObjList) {
      for (let i = 0; i < itemObj.quantity; i++) {
        this.put(createItem(itemObj.recipe));
      }
    }
  }

  clear(): void {
    this.records.length = 0;
  }

  printEq(): void {
    console.log(this.records);
  }

  canBuy(item: Item): boolean {
    if (this.cash < item.price) {
      notifier.send(new Notification(`Not enough cash to buy (${item.name})`, item.spriteName));
      return false;
    }
    return true;
  }

  put(item: Item, trading = false): boolean {
    if (trading && !this.canBuy(item)) return false;

    const record = this.recordForName(item.name);
    if (record && record.item.isStackable) {
      record.quantity++;
    } else {
      this.records.push(new EquipmentRecord(item, 1));
    }
    if (trading) this.cash -= item.price;
    return true;
  }

  recordForName(itemName: string): EquipmentRecord | undefined {
    return this.records.find((rec) => rec.item.name === itemName);
  }

  recordForID(recordID: number): EquipmentRecord | undefined {
    return this.records.find((rec) => rec.id === recordID);
  }

  countOf(item: Pick<Item, "spriteName" | "isStackable">): number {
    const found = this.records.filter((record) => record.item.spriteName === item.spriteName);
    if (item.isStackable) return found[0]?.quantity ?? 0;
    return found.length;
  }

  private reduceQuantity(record: EquipmentRecord): void {
    if (!record.item.isStackable || record.quantity === 1)
      this.records = this.records.filter((rec) => rec.item.id !== record.item.id);
    else record.quantity -= 1;
  }

  drop(record: EquipmentRecord): Item {
    this.reduceQuantity(record);
    return record.item;
  }

  transfer(record: EquipmentRecord, trading = false): Item {
    this.reduceQuantity(record);
    if (trading) this.cash += record.item.price;
    return record.item.deepCopy();
  }
}

export default Equipment;
