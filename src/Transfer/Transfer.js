/*
  file: src/Transfer.js
  purpose: Define the Transfer class
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
import Equipment from "../Equipment/Equipment.js";
import Item from "../Item/Item.js";

// left equipment is for PlayerEquipment, right is for another
class Transfer{
    /**
     * Transfer created for moving items from one to another equipment
     * @param {Equipment} playerEquipment equipment one (in most / all cases player one)
     * @param {Equipment} transferEquipment equipment two
     * @param {boolean} trading true if owner should pay for item (during process of trade), otherwise false 
     */
    constructor (playerEquipment, transferEquipment, trading){
        this.playerEquipment = playerEquipment;
        this.transferEquipment = transferEquipment;
        this.trading = trading;
    }

    /**
     * Method which transfers given record from one equipment to another
     * @param {EquipmentRecord} record record with stored item which is trying to be transfer
     * @param {Equipment} equipmentFrom inventory from which you want to transfer
     * @param {Equipment} equipmentTo inventory to which you want to transfer
     */
    transferItem(record, equipmentFrom, equipmentTo){
        if ((!this.trading || equipmentTo.canBuy(record.item)) && equipmentTo.canFit(record.item)) 
            equipmentTo.put(equipmentFrom.transfer(record, this.trading), this.trading);
    }

    /**
     * Method for changing second equipment
     * @param {Equipment} changedEquipment other inventory
     */
    changeTransferEquipment(changedEquipment){
        this.transferEquipment = changedEquipment;
    }
};

export default Transfer;
