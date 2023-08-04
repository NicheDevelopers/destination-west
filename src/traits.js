import Equipment from "./Equipment.js";
import { defaultEquipmentSize, defaultRcp, defaultBd } from "./global/consts.js";
import Hitbox from "./Hitbox.js";

export function addTraits(obj, ...traits) {
  for (const trait of traits) {
    for (const prop in trait) {
      if (obj[prop] !== undefined)
	throw `adding trait would override property ${prop} of ${obj.constructor.name}`;
      obj[prop] = trait[prop];
    }
  }
}

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


   
export function HitboxTrait(self, rcp=defaultRcp, bd=defaultBd) {
  return {
    boundingDistance: bd,
    relativeCenterPoint: rcp,
    hitbox: new Hitbox(self, bd),
    getCenterPoint() {
      return {x: this.x + this.relativeCenterPoint.x,
	      y: this.y + this.relativeCenterPoint.y};
    }
  }
}
