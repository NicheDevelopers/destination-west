import type Item from "../Item/Item.js";
import DroppedItem from "../Item/DroppedItem.js";
import { createItem, type Recipe } from "../global/items.js";
import { generateID } from "../utilities/utilities.js";
import { notifier, Notification } from "../global/notifier.js";

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

  getWeight(): number {
    return this.item.weight * this.quantity;
  }
}

class Equipment {
  readonly maxWeight: number;
  cash: number;
  records: EquipmentRecord[] = [];

  constructor(maxWeight: number, startCash: number, itemObjList: EquipmentItemRecipe[] = []) {
    this.maxWeight = maxWeight;
    this.cash = startCash;
    if (itemObjList.length) this.fillRecords(itemObjList);
  }

  fillRecords(itemObjList: EquipmentItemRecipe[]): void {
    for (const itemObj of itemObjList) {
      for (let i = 0; i < itemObj.quantity; i++) {
        this.put(createItem(itemObj.recipe));
      }
    }
    this.sortByWeight();
  }

  clear(): void {
    this.records.length = 0;
  }

  printEq(): void {
    console.log(this.records);
  }

  canFit(item: Item): boolean {
    if (this.sumWeight() + item.weight > this.maxWeight) {
      notifier.send(
        new Notification(`Too much weight in inventory (+${item.name})`, item.spriteName),
      );
      return false;
    }
    return true;
  }

  canBuy(item: Item): boolean {
    if (this.cash < item.price) {
      notifier.send(new Notification(`Not enough cash to buy (${item.name})`, item.spriteName));
      return false;
    }
    return true;
  }

  put(item: Item, trading = false): boolean {
    if (!this.canFit(item)) return false;
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

  sumWeight(): number {
    return this.records.reduce((acc, currentRecord) => acc + currentRecord.getWeight(), 0);
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

  sortByWeight(heavyOnTop = true): void {
    if (heavyOnTop) this.records.sort((a, b) => b.getWeight() - a.getWeight());
    else this.records.sort((a, b) => a.getWeight() - b.getWeight());
  }

  private reduceQuantity(record: EquipmentRecord): void {
    if (!record.item.isStackable || record.quantity === 1)
      this.records = this.records.filter((rec) => rec.item.id !== record.item.id);
    else record.quantity -= 1;
  }

  drop(record: EquipmentRecord): DroppedItem {
    this.reduceQuantity(record);
    return new DroppedItem(record.item);
  }

  transfer(record: EquipmentRecord, trading = false): Item {
    this.reduceQuantity(record);
    if (trading) this.cash += record.item.price;
    return record.item.deepCopy();
  }
}

export default Equipment;
