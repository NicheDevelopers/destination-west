import Equipment from "./Equipment.js";
import {defaultEquipmentSize} from "./global/consts.js";

export function ContainerTrait() {
  return {
    equipment: new Equipment(defaultEquipmentSize),
    dropItem: function (record) {
      let droppedItem = this.equipment.dropFrom(record);
      droppedItem.setPositionTo(
        (this.centerPoint) ? { x: this.centerPoint.x, y: this.centerPoint.y }
          : { x: this.x, y: this.y });
      if (!this.game) console.error('ContainerTrait in a class without a Game field.');
      this.game.currentTown.droppedItems.push(droppedItem);
      this.game.currentTown.updateFocus(this.game.player);
    }
  }
}
