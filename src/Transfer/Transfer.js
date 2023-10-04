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
import Item from "../Item/Item.js";

// left equipment is for PlayerEquipment, right is for another
class Transfer{
    constructor (playerEquipment, transferEquipment){
        this.playerEquipment = playerEquipment;
        this.transferEquipment = transferEquipment;
    }
    transferItem(record, equipmentFrom, equipmentTo){
      if (equipmentTo.canFit(record.item))
        equipmentTo.put(new Item(equipmentFrom.dropFrom(record).item));
    }
    changeTransferEquipment(changedEquipment){
        this.transferEquipment = changedEquipment;
    }
};

export default Transfer;
