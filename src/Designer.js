/*
  file: src/Designer.js
  purpose: create an interface for designing colored sprites
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

import ColoredSprite from "./Sprite/ColoredSprite.js";

import {createDiv, createCanvas} from "./global/utilities.js";

/**
 * Create an interface for designing colored sprites
 */
class Designer {
  constructor(){
    let div = createDiv(
      650, 400, ['window', 'window-background'],
      {display: 'flex', zIndex: '4'});
    
    let previewDiv = createDiv(
      300,400, ['window', 'window-background'],
      {border: 'none', display: 'flex', background: 'white'});

    let preview;
    ({canvas: preview, context: this.previewCtx} = createCanvas(32));
    preview.style.transform = 'scale(8)';

    previewDiv.appendChild(preview);
    div.appendChild(previewDiv);
    
    let setDiv = createDiv(
      100, 400, [],
      {borderRight: '1px solid black',
       borderLeft: '1px solid black',
       display: 'grid',
       alignItems: 'center',
       justifyItems: 'center'});
    
    let coloringDiv = createDiv(250, 400);
    
    let newSetter = (src) => {
      let img = document.createElement('img');
      img.classList.add('designer');
      img.classList.add('button');
      img.src = 'img/' + src + '.png';
      img.style.display = 'block';
      img.style.border = '2px solid black';
      return img;
    }
    
    setDiv.appendChild(newSetter('head'));
    setDiv.appendChild(newSetter('torso'));
    setDiv.appendChild(newSetter('legs'));
    
    let input = document.createElement('input');
    input.type = 'color';
    coloringDiv.appendChild(input);
    
    div.appendChild(setDiv);
    div.appendChild(coloringDiv);
    
    document.querySelector('#game-container').appendChild(div);
    
    input.addEventListener('change', () => {
      this.clothes.pants.setColor(input.value);
    });

    this.clothes = {pants: new ColoredSprite('pants')};
  }
  update(){
    this.clothes.pants.draw(0, 0, this.previewCtx);
  }
}

export default Designer;
