const tilesSize = 32;
class EquipmentDisplay{
    constructor(game, equipment, isPlayer){
        this.equipment = equipment;
        this.game = game;
        this.register();
        this.div = document.createElement("div");
        let gameContainer = document.querySelector("#game-container");
        this.div.id = "equipment";
        this.div.classList.add("display-2x");
        this.div.classList.add("grid-background");
        this.divEq = document.createElement("div");
        this.divEq.style.width = tilesSize*equipment.width;
        this.divEq.style.height = tilesSize*equipment.height;
        this.divEq.style.display = "grid";
        this.divEq.style.gridTemplateColumns = "repeat(7, 32px)"; 
        //this.itemsdivs = new Array(equipment.height);
        for (let i=0; i<equipment.width*equipment.height; i++){
            let itemdiv = document.createElement("div");
            itemdiv.classList.add("item-box");
            itemdiv.style.width = `${tilesSize}px`;
            itemdiv.style.height = `${tilesSize}px`;
            this.divEq.appendChild(itemdiv);
        }
        this.isDisplayed = false;
        if (!isPlayer){
            this.div.appendChild(this.divEq);
            gameContainer.appendChild(this.div);
            return;
        }
        this.divPlayerPanel = document.createElement("div");
        this.divPlayerPanel.style.backgroundColor = "rgb(121,70,20)";
        // PlayerPanel width can be changed, for now it is 4 tiles
        this.divPlayerPanel.style.width = `${tilesSize*4}px`;
        this.divPlayerPanel.style.height = `${tilesSize*equipment.height}px`;
        this.divPlayerPanel.style.border = "1px solid black";
        this.div.appendChild(this.divEq);
        this.div.appendChild(this.divPlayerPanel);
        gameContainer.appendChild(this.div);
    }

    register(){
        this.game.registerAction('Toggle Equipment Display');
    }

    toggleDisplay(){
        if (this.isDisplayed){
            this.div.style.display = "none";
            this.isDisplayed = false;
            return;
        } 
        this.div.style.display = "flex";
        this.isDisplayed = true;
    }

    update(){
        this.game.manageRequest(
          'Toggle Equipment Display',
          () => this.toggleDisplay(),
          {once: true}
        );
    }

};

export default EquipmentDisplay;