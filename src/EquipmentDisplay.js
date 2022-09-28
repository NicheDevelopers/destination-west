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
        this.divEq = document.createElement("div");
        this.divEq.classList.add("grid-background");
        this.divEq.style.width = `${tilesSize*equipment.width+1}px`;
        this.divEq.style.height = `${tilesSize*equipment.height+1}px`;
        this.div.appendChild(this.divEq);
        this.isDisplayed = false;
        if (!isPlayer){
            gameContainer.appendChild(this.div);
            return;
        }
        this.divPlayerPanel = document.createElement("div");
        this.divPlayerPanel.style.backgroundColor = "rgb(121,70,20)";
        // PlayerPanel width can be changed, for now it is 4 tiles
        this.divPlayerPanel.style.width = `${tilesSize*4+1}px`;
        this.divPlayerPanel.style.height = this.divEq.style.height;
        this.divPlayerPanel.style.border = "1px solid black";
        this.divPlayerPanel.style.boxSizing = "border-box";
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