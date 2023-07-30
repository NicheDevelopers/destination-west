import Equipment from "./Equipment.js";
import {defaultEquipmentSize} from "./global/consts.js";

export function InventoryTrait(equipmentSize=defaultEquipmentSize) {
  return {
    equipment: new Equipment(equipmentSize),
    dropItem: function (record) {
      let droppedItem = this.equipment.dropFrom(record);
      droppedItem.setPositionTo(
        (this.centerPoint) ? { x: this.centerPoint.x, y: this.centerPoint.y }
          : { x: this.x, y: this.y });
      if (!this.game) console.error('InventoryTrait in a class without a Game field.');
      this.game.currentTown.droppedItems.push(droppedItem);
      this.game.currentTown.updateFocus(this.game.player);
    }
  }
}

export function addTraits(obj, ...traits) {
  for (const trait of traits) {
    for (const prop in trait) {
      if (obj[prop] !== undefined)
	throw `adding trait would override property ${prop} ` +
	`of ${obj.constructor.name}`;
      obj[prop] = trait[prop];
    }
  }
}
