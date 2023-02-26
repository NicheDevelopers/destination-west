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

class Equipment{
  constructor (game, maxWeight){
    this.game = game;
    this.maxWeight = maxWeight;
    this.sumWeight = 0;
    this.items = [];
    this.clear();
  }
  
  clear(){
    this.items.splice(0, this.items.length);
  }

  printEq() {
    console.log(this.items);
  }
  
  canFit(item){
    if (this.sumWeight+item.weight>this.maxWeight){
      console.log("Cannot fit!");
      return false;
    }
    return true;
  }

  put(item){
    if (this.canFit(item)){
      this.sumWeight += item.weight;
      this.items.push(item);
    }
  }

  sortByWeight(){
    this.items.sort((a, b) => b.weight - a.weight);
  }

  drop(item){
    console.log("Dropping item: ", item);
    this.items = this.items.filter( (i) => i.id != item.id );
    this.game.currentTown.droppedItems.push(new DroppedItem(
      item,
      this.game.player.centerPoint.x,
      this.game.player.centerPoint.y
    ));
    console.log("Dropped items: ", this.game.currentTown.droppedItems);
    console.log("Eq: ", this.items);
  }
};

export default Equipment;
