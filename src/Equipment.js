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
import Item from "./Item/Item.js";
import DroppedItem from "./Item/DroppedItem.js";
import tileSize from "./global/tileSize.js";

class EquipmentRecord{
  constructor (item, quantity, isStack){
    this.item = item;
    this.quantity = quantity;
    this.isStack = isStack;
  }
  getWeight(){
    return this.item.weight * this.quantity;
  }
};

class Equipment{
  constructor (game, maxWeight){
    this.game = game;
    this.maxWeight = maxWeight;
    this.records = [];
    this.clear();
  }
  
  clear(){
    this.records.splice(0, this.records.length);
  }

  printEq() {
    console.log(this.items);
  }
  
  canFit(item){
    if (this.sumWeight()+item.weight>this.maxWeight){
      console.log("Cannot fit!");
      return false;
    }
    return true;
  }

  put(item){
    if (!this.canFit(item)) return false;
    
    if (!item.isStackable){
      let record = new EquipmentRecord(item, 1, false);
      this.records.push(record);
    }
    else {
      let record = this.recordForName(item.name);
      if (record != undefined) {
        record.quantity += 1;
      }
      else {
        let record = new EquipmentRecord(item, 1, true);
        this.records.push(record);
      }
    }
    return true;
  }

  sumWeight(){
    return this.records.reduce( (acc, currentRecord) => acc + currentRecord.getWeight(), 0 );
  }

  recordForName(itemName){
    return this.records.find((rec) => rec.item.name == itemName);
  }

  sortByWeight(heavy_on_top){
    if (heavy_on_top == true) this.records.sort((a, b) => b.getWeight() - a.getWeight());
    else this.records.sort((a, b) => a.getWeight() - b.getWeight());
  }

  dropFrom(record){
    let foundRecord = this.recordForName(record.item.name);
    if (!foundRecord.item.isStackable){
      this.records = this.records.filter( (rec) => rec.item.id != foundRecord.item.id );
    }
    else if (foundRecord.quantity == 1) {
      this.records = this.records.filter( (rec) => rec.item.name != foundRecord.item.name );
    }
    else {
      foundRecord.quantity -= 1;
    }
    this.game.currentTown.droppedItems.push(new DroppedItem(
      foundRecord.item,
      this.game.player.centerPoint.x - tileSize/2,
      this.game.player.centerPoint.y - tileSize/2
    ));
  }
};

export default Equipment;
