import type Equipment from "@/game/Equipment/Equipment";
import type { EquipmentRecord } from "@/game/Equipment/Equipment";

// left equipment is for PlayerEquipment, right is for another
class Transfer {
  readonly playerEquipment: Equipment;
  transferEquipment: Equipment;
  readonly trading: boolean;

  /**
   * Transfer created for moving items from one to another equipment
   * @param playerEquipment equipment one (in most / all cases player one)
   * @param transferEquipment equipment two
   * @param trading true if owner should pay for item (during process of trade), otherwise false
   */
  constructor(playerEquipment: Equipment, transferEquipment: Equipment, trading: boolean) {
    this.playerEquipment = playerEquipment;
    this.transferEquipment = transferEquipment;
    this.trading = trading;
  }

  /**
   * Method which transfers given record from one equipment to another
   * @param record record with stored item which is trying to be transfer
   * @param equipmentFrom inventory from which you want to transfer
   * @param equipmentTo inventory to which you want to transfer
   */
  transferItem(record: EquipmentRecord, equipmentFrom: Equipment, equipmentTo: Equipment): void {
    if ((!this.trading || equipmentTo.canBuy(record.item)) && equipmentTo.canFit(record.item))
      equipmentTo.put(equipmentFrom.transfer(record, this.trading), this.trading);
  }

  /**
   * Method for changing second equipment
   * @param changedEquipment other inventory
   */
  changeTransferEquipment(changedEquipment: Equipment): void {
    this.transferEquipment = changedEquipment;
  }
}

export default Transfer;
