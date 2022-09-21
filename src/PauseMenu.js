class PauseMenu {
  constructor(){
    this.pause_menu = document.getElementById("pause_menu");
  }
  togglePauseMenuFunc() {
    if (this.pause_menu.style.display !== 'none'){
      this.pause_menu = 'none';
    }
    else {
      this.pause_menu.style.display = 'block';
    }
  }
}

export default PauseMenu;
