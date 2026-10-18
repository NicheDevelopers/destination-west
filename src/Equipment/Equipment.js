/*
  file: src/Equipment.js
  purpose: Define the Equipment class
  author: Oskar Kiliańczyk <https://gitlab.com/oskkil>
  
  This file is part of 'Destination West'.
  
  'Destination West' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.

  'Destination West' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
  or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  'Destination West'. If not, see <https://www.gnu.org/licenses/>.
*/
import DroppedItem from "../Item/DroppedItem.js";
import { createItem } from "../global/items.js";
import { generateID } from "../global/utilities.js";
import { notifier, Notification } from "../global/notifier.js";

class EquipmentRecord {
  /**
   * Equipment records for storing stackable / non-stackable items
   * @param {Item} item given item
   * @param {number} quantity quantity of given item
   */
  constructor(item, quantity) {
    this.id = generateID(EquipmentRecord);
    this.item = item;
    this.quantity = quantity;
  }
  /**
   *
   * @returns {number} summary weight of all items given in record
   */
  getWeight() {
    return this.item.weight * this.quantity;
  }
}

class Equipment {
  /**
   * Equipment given in InventoryTrait() for transfering, trading or getting items
   * @param {number} maxWeight maximal weight of all items in equipment
   * @param {number} startCash cash given into equipment for start
   * @param {Object[]} [itemObjList = []] array of item objects from items
   */
  constructor(maxWeight, startCash, itemObjList = []) {
    this.maxWeight = maxWeight;
    this.cash = startCash;
    this.records = [];
    if (itemObjList.length) this.fillRecords(itemObjList);
  }

  /**
   * Method for filling equipment records for start with given itemObjList
   * @param {Object[]} itemObjList array of item objects
   * @example
   * this.fillRecords([
   *  {recipe: items.apple, quantity: 3},
   *  {recipe: items.whisky, quantity: 2}
   * ]);
   */
  fillRecords(itemObjList) {
    for (let itemObj of itemObjList) {
      for (let i = 0; i < itemObj.quantity; i++) {
        this.put(createItem(itemObj.recipe));
      }
    }
    this.sortByWeight();
  }

  clear() {
    // this.records.splice(0, this.records.length);
    this.records.clear();
  }

  /**
   * Test method for visualising content of equipment
   */
  printEq() {
    console.log(this.records);
  }

  /**
   * Check if item can fit in equipment.
   * Check if item weight added to inventory will set summary weight over maximum weight.
   * @param {Item} item item which is trying to be added into inventory
   * @returns {boolean} true if can fits, otherwise false
   */
  canFit(item) {
    if (this.sumWeight() + item.weight > this.maxWeight) {
      notifier.send(
        new Notification(`Too much weight in inventory (+${item.name})`, item.spriteName),
      );
      return false;
    }
    return true;
  }

  /**
   * Check if item can be bought during trading process
   * @param {Item} item item which is trying to be bought by owner of equipment
   * @returns {boolean} true if can buy, otherwise false
   */
  canBuy(item) {
    if (this.cash < item.price) {
      notifier.send(new Notification(`Not enough cash to buy (${item.name})`, item.spriteName));
      return false;
    }
    return true;
  }

  /**
   * Method which trying to put given item into inventory.
   * @param {Item} item item which is trying to be put into inventory
   * @param {boolean} [trading = false] - true if owner should pay for item (during process of trade), otherwise false
   * @returns {boolean} true if item successfully was added into inventory, otherwise false
   */
  put(item, trading = false) {
    if (!this.canFit(item)) return false;
    if (trading && !this.canBuy(item)) return false;

    let record = this.recordForName(item.name);
    if (record != undefined && record.item.isStackable) {
      record.quantity++;
    } else {
      let record = new EquipmentRecord(item, 1);
      this.records.push(record);
    }
    if (trading) this.cash -= item.price;
    return true;
  }

  /**
   * Summary of all weights of equipment records
   * @returns {number} summary weight of all items stored in equipment
   */
  sumWeight() {
    return this.records.reduce((acc, currentRecord) => acc + currentRecord.getWeight(), 0);
  }

  /**
   * Search for record in which Item is stored
   * @param {string} itemName name of item which you are searching for
   * @returns {EquipmentRecord} EquipmentRecord for given itemName
   */
  recordForName(itemName) {
    return this.records.find((rec) => rec.item.name == itemName);
  }

  /**
   * Search for record given ID
   * @param {number} recordID ID of EquipmentRecord you are searching for
   * @returns {EquipmentRecord} EquipmentRecord for given recordID
   */
  recordForID(recordID) {
    return this.records.find((rec) => rec.id == recordID);
  }

  /**
   * Check how many items with the same spriteName as the given items are in this inventory
   * @param {Item} Item instance. Equality is checked by item.spriteName
   * @returns {number} number of such items
   */
  countOf(item) {
    // If the item is stackable, this returns exactly one record.
    // else, it's a bunch of records
    const found = this.records.filter((record) => record.item.spriteName === item.spriteName);
    if (item.isStackable) {
      // stackable -> one record returned so check the quantity
      return found.first.quantity;
    }
    // non-stackable -> check how many records with quantity of 1
    return found.length;
  }

  /**
   * Method for sorting records depends of summary weight of record
   * @param {boolean} [heavy_on_top=true] true if sorting weight descending, otherwise false
   */
  sortByWeight(heavy_on_top = true) {
    if (heavy_on_top == true) this.records.sort((a, b) => b.getWeight() - a.getWeight());
    else this.records.sort((a, b) => a.getWeight() - b.getWeight());
  }

  /**
   * Help method for drop and transfer equipment method
   * @param {EquipmentRecord} record EquipmentRecord which is trying to be dropped or transfer
   */
  reduceQuantity(record) {
    if (!record.item.isStackable || record.quantity == 1)
      this.records = this.records.filter((rec) => rec.item.id != record.item.id);
    else record.quantity -= 1;
  }

  /**
   * Method for dropping items from inventory
   * @param {EquipmentRecord} record EquipmentRecord which is trying to be dropped from
   * @returns {DroppedItem} droppedItem
   */
  drop(record) {
    this.reduceQuantity(record);
    return new DroppedItem(record.item);
  }

  /**
   * Method for transfering items from inventory
   * @param {EquipmentRecord} record EquipmentRecord which is trying to be transfered from
   * @param {boolean} [trading = false] - true if owner should pay for item (during process of trade), otherwise false
   * @returns {Item}
   */
  transfer(record, trading = false) {
    this.reduceQuantity(record);
    if (trading) this.cash += record.item.price;
    return record.item.deepCopy();
  }
}

export default Equipment;
