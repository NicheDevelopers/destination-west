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

function compareSecondColumn(a, b){
    if (a[1] === b[1]){
        return 0;
    }
    else{
        return (a[1] > b[1]) ? -1 : 1;
    }
}

class Equipment{
    constructor (width, height){
        this.width = width;
        this.height = height;
        this.items = [];
        this.clear();
    }
    
    clear(){
        for (let i=0; i<this.height; i++){
            if (!this.items[i]) this.items[i]=[];
            for (let j=0; j<this.width; j++){
                this.items[i][j]=false;
            }
        }
    }
    
    printEq(){
        console.log(this.items);
    }
    
    canFit(item){
        let flag = true;
        for (let i=0; i<this.height; i++){
            for (let j=0; j<this.width; j++){
                flag = true;
                // if something is on this tiles it can't be fit in this place 
                for (let x=i; x<i+item.height; x++){
                    for (let y=j; y<j+item.width; y++){
                        if (x>=this.height || y>=this.width) {
                            flag = false;
                            break;
                        }
                        if (this.items[x][y] != false) flag = false;
                    }
                }
                // if it fits, return true and its posistion
                if (flag) return [true,i,j];
            }
        }
        // if there are no space for item, return false, don't do anything
        return [false];
    }
    
    put(item){
        let fit = this.canFit(item);
        if (fit[0]){
            for (let x=fit[1]; x<fit[1]+item.height; x++){
                for (let y=fit[2]; y<fit[2]+item.width; y++){
                    this.items[x][y]=item;
                }
            }
            return;
        }
        console.log("NO FIT!");
        return false;
    }
    
    sortEqBySpace(){
        let tmparr = [];
        let arr = [];
        let tmpitem = new item;
        for (let i=0; i<this.height; i++){
            for (let j=0; j<this.width; j++){
                if (this.items[i][j] != false){
                    tmpitem = this.items[i][j];
                    tmparr.push([this.items[i][j], tmpitem.width*tmpitem.height]);
                    arr.push(this.items[i][j]);
                    for (let x=i; x<i+tmpitem.height; x++){
                        for (let y=j; y<j+tmpitem.width; y++){
                            this.items[x][y] = false;
                        }
                    }
                }
            }
        }
        tmparr.sort(compareSecondColumn);
        let flag = true;
        for (let i=0; i<tmparr.length; i++){
            if (this.put(tmparr[i][0]) == false){
                console.log("I can't sort it.");
                flag = false;
                break;
            }
        }
        // if equipment cannot be sort go back to state before sorting try
        if (!flag){
            this.clear();
            for (let i=0; i<arr.length; i++){
                this.put(arr[i]);
            }
        }
        // if flag is true, it means that equipment is already sorted
    }
    
};

export default Equipment;
