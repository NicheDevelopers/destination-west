/*
  file: src/KeyboardVisualizer.js
  purpose: define the KeyboardVisualizer class; provide a way for
           visualizing keyboard inputs
  author: Artur Gulik <https://gitlab.com/ArturGulik>
  
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

function createButton(width, height, offsetX=0, offsetY=0){
  let o = document.createElement('div');
  o.style.width = `${width}px`;
  o.style.height = `${height}px`;
  o.style.position = 'absolute';
  o.style.border = '1px solid blue';
  o.style.borderRadius = '10%';
  o.style.background = 'lightblue';
  o.style.left = `${offsetX}px`;
  o.style.top = `${offsetY}px`;
  return o;
}

function createOption(option){
  let o = document.createElement('option');
  o.value = option;
  o.innerHTML = option;
  return o;
}

function createForm(width, height, offsetX=0, offsetY=0, name, options=[]){
  let f = document.createElement('form');
  f.style.margin = '5px';
  let l = document.createElement('label');
  l.style.color = 'white';
  l.innerHTML = name;

  let s = document.createElement('select');

  options.forEach((option) => {
    s.appendChild(createOption(option));
  });
  
  f.style.width = `${width}px`;
  f.style.height = `${height}px`;
  f.style.position = 'absolute';
  f.style.left = `${offsetX}px`;
  f.style.top = `${offsetY}px`;

  f.appendChild(l);
  f.appendChild(s);
  return {form: f, select: s};
}

/**
 * Add an input method for a button
 @param keyman - The keyboard manager object that manages the action bound to the button
 @param button - The button to add input methods to
 @param action - The action from keyman to execute on triggers
 @param triggerListenerType - The name of the event listener type to trigger the action
 @param cancelListenerType - The name of the event listener type to cancel the action
 */
function addInput(keyman, button, action, triggerListenerType, cancelListenerType){
  // If no cancelListenerType is provided,
  // triggerListenerType is used as a toggle function
  let trigger = () => {
    keyman.requests.set(action, true);
  };
  let cancel = () => {
    keyman.requests.delete(action);
  };

  if (!cancelListenerType) {
    trigger = () => {
      if (keyman.requests.has(action)){
	keyman.requests.delete(action);
	return;
      }
      keyman.requests.set(action,true);
    }
  }
  
  button.listeners.push({type: triggerListenerType, listener: trigger});
  button.element.addEventListener(triggerListenerType, trigger);
  
  if (!cancelListenerType) return;
  
  button.listeners.push({type: cancelListenerType, listener: cancel});
  button.element.addEventListener(cancelListenerType, cancel);
}

//function removeListener

/**
 * Provide a way for visualizing keyboard inputs
 */
class KeyboardVisualizer {
  constructor(app){
    this.app = app;
    this.keyman = app.keyman;
    let div = document.createElement('div');
    div.setAttribute('style', `width: 300px; height: 150px;
position: absolute; left: 0; bottom: 0;`);
    
    this.div = div;
    this.hide();
    this.inputModes = new Map([
      ['Hover', this.hoverMode],
      ['Toggle', this.toggleMode],
      ['None', () => {}]
    ]);
    
    let {form, select} = createForm(100, 20, 0, 0, 'Input mode',
			  Array.from(this.inputModes.keys()));
    form.onchange = () => {
      let mode = select.options[select.selectedIndex].value;
      this.clearMode();
      this.inputModes.get(mode).call(this);
    };
    
    this.div.appendChild(form);
    
    this.buttons = new Map([
      ['Move Left', {element: createButton(50, 40, 50, 100), listeners: []}],
      ['Move Up', {element: createButton(50, 40, 105, 55), listeners: []}],
      ['Move Right', {element: createButton(50, 40, 160, 100), listeners: []}],
      ['Move Down', {element: createButton(50, 40, 105, 100), listeners: []}]
    ]);
    
    this.buttons.forEach((button) => {
      this.div.appendChild(button.element);
    });
    
    document.body.appendChild(this.div);
    this.hoverMode();
  }
  update(){
    this.app.manageRequest('Toggle Keyboard Visualization', () => {
      if (!this.hidden) {
	this.hide();
	return;
      }
      this.show();
    }, {once: true});
    if (this.hidden) return;
    this.buttons.forEach((button, action) => {
      button.element.style.background = 'lightblue';
      if (this.keyman.isActionRequested(action))
	button.element.style.background = 'blue';
    });
  }
  show(){
    this.div.style.display = 'block';
    this.hidden = false;
  }
  hide(){
    this.div.style.display = 'none';
    this.hidden = true;
  }
  clearMode(){
    this.buttons.forEach((button) => {
      button.listeners.forEach((listener) => {
	button.element.removeEventListener(listener.type, listener.listener);
      });
      button.listeners = [];
    });
  }
  hoverMode(){
    this.buttons.forEach((button, action) => {
      addInput(this.keyman, button, action, 'mouseover', 'mouseout');
    });
  }
  toggleMode(){
    this.buttons.forEach((button, action) => {
      addInput(this.keyman, button, action, 'click');
    });
  }
}

export default KeyboardVisualizer;
