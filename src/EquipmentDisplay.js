let dropped = false;
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
      this.divEq.style.width = `${tilesSize*equipment.width}px`;
      this.divEq.style.height = `${tilesSize*equipment.height}px`;
        this.divEq.style.display = "grid";
        this.divEq.style.gridTemplateColumns = "repeat(7, 32px)"; 
        this.itemsDivs = [];

        for (let i=0; i<equipment.height; i++){
            if (!this.itemsDivs[i]) this.itemsDivs[i]=[];
            for (let j=0; j<equipment.width; j++){
                this.itemsDivs[i][j]=false;
            }
        }
        for (let i=0; i<equipment.width*equipment.height; i++){
            let itemDiv = document.createElement("div");
            if (i==0){
                itemDiv.classList.add("fill");
                itemDiv.setAttribute('draggable', true);
            } 
            else{
                itemDiv.classList.add("empty");
                //itemDiv.setAttribute('draggable', false);
            } 
            itemDiv.classList.add("item-box");
            //itemDiv.style.width = `${tilesSize}px`;
            //itemDiv.style.height = `${tilesSize}px`;
            this.divEq.appendChild(itemDiv);
            this.itemsDivs[i/equipment.height | 0][i%equipment.width | 0] = i;
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
        this.eventListener();
    }

    update(){
        this.game.manageRequest(
          'Toggle Equipment Display',
          () => this.toggleDisplay(),
          {once: true}
        );
    }

    eventListener(){
      const fill = document.querySelector('.fill');
      //dropped = false;
        const boxes = document.querySelectorAll('.item-box');
      fill.addEventListener('dragstart', (e) => this.dragStart(e));
      fill.addEventListener('dragend', (e) => this.dragEnd(e));
        for (const box of boxes){
          box.addEventListener('dragover', (e) => this.dragOver(e));
          box.addEventListener('dragenter', (e) => this.dragEnter(e));
          box.addEventListener('dragleave', (e) => this.dragLeave(e));
          box.addEventListener('drop', (e) => this.dragDrop(e));
        }
    }

  dragStart(event){
    console.log("start");
    event.target.className = 'empty item-box';
    //setTimeout(() => this.className = 'invisible', 0);
  }
    
  dragEnd(event){
    console.log("end");
      setTimeout(() => {
        if (dropped) {
          event.target.className = 'empty item-box';
          event.target.setAttribute('draggable', false);
          event.target.removeEventListener('dragstart', (e) => this.dragStart(e));
          event.target.removeEventListener('dragstart', (e) => this.dragEnd(e));
          return;
        }
	      this.className = 'fill item-box';
      }, 0);
  }

    dragOver(event){
        event.preventDefault();
        console.log("over");
    }

    dragEnter(event){
      event.preventDefault();
      event.target.classList.add('hovered');
      console.log("enter");
    }

    dragLeave(event){
      event.target.className = 'empty item-box';
      console.log("leave");
    }

    dragDrop(event){
      event.target.className = 'fill item-box';
      event.target.setAttribute('draggable', true);
      event.target.addEventListener('dragstart', (e) => this.dragStart(e));
      event.target.addEventListener('dragend', (e) => this.dragEnd(e));
      dropped = true;      
      console.log("drop");
    }
};

export default EquipmentDisplay;
