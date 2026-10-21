import { DEFAULT_EQUIPMENT_SIZE, CASH_MIN_MAX_PARAMETERS as cashParam } from "@/game/consts";
import { randIntInRange } from "@/lib/random";
import Equipment from "./Equipment";

export function InventoryTrait(
  startCash,
  equipmentSize = DEFAULT_EQUIPMENT_SIZE,
  itemRecipeList = [],
) {
  startCash = startCash ?? randIntInRange(cashParam.minCash, cashParam.maxCash);
  return {
    _name_: "InventoryTrait",
    equipment: new Equipment(equipmentSize, startCash, itemRecipeList),
    dropItem: function (record) {
      if (!this.game) console.error("InventoryTrait in a class without a Game field.");
      let item = this.equipment.drop(record);
      this.game.currentTown.dropItem(item, this.getCenterPoint());
      this.game.currentTown.updateFocus(this.game.player);
    },
  };
}
