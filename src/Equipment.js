class item{
    constructor (width, height, id){
        this.width = width;
        this.height = height;
        this.id = id;
    }
};

class Equipment{
    constructor (width, height){
        this.width = width;
        this.height = height;
        this.items = [];
        this.clear();
    }
    
    clear(){
        for (let i=0; i<this.width; i++){
            if (!this.items[i]) this.items[i]=[];
            for (let j=0; j<this.height; j++){
                this.items[i][j]=false;
            }
        }
    }
    
    printEq(){
        console.log(this.items);
    }
    
    canFit(item){
        let flag = true;
        for (let i=0; i<this.width; i++){
            for (let j=0; j<this.height; j++){
                flag = true;
                // if something is on this tiles it can't be fit in this place 
                for (let x=i; x<i+item.width; x++){
                    for (let y=j; y<j+item.height; y++){
                        if (x>=this.width || y>=this.height) {
                            flag = false;
                            break;
                        }
                        //console.log(x,y);
                        if (this.items[x][y] != false) flag = false;
                    }
                }
                //if it fits, return true and its posistion
                if (flag) return [true,i,j];
            }
        }
        // if there are no space for item, return false, don't do anything
        return [false];
    }
    
    put(item){
        let fit = this.canFit(item);
        if (fit[0]){
            for (let x=fit[1]; x<fit[1]+item.width; x++){
                for (let y=fit[2]; y<fit[2]+item.height; y++){
                    this.items[x][y]=item.id;
                }
            }
            return;
        }
        console.log("NO FIT!");
    }
};

export default Equipment;
export {item};
