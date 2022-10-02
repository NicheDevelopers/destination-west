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

let newDiv = (w, h) => {
  let r = document.createElement('div')
  r.setAttribute('style', `width: ${w}px; height: ${h}px`);
  return r;
}

let div = newDiv(650, 400);
div.classList.add('window');
div.classList.add('window-background');
div.style.display = 'flex';
let previewDiv = newDiv(300,400);
previewDiv.style.background = 'white';
let preview = document.createElement('canvas');
preview.width = '300';
preview.height = '400';
let previewCtx = preview.getContext('2d');
previewDiv.appendChild(preview);
div.appendChild(previewDiv);

let setDiv = newDiv(100, 400);
setDiv.style.borderRight = '1px solid black';
setDiv.style.borderLeft = '1px solid black';
setDiv.style.display = 'grid';
setDiv.style.alignContent = 'center';
setDiv.style.justifyContent = 'center';

let coloringDiv = newDiv(250, 400);

let img = document.createElement('img');
img.src = 'img/clothes.png';
img.style.display = 'block';
img.style.border = '2px solid black';

setDiv.appendChild(img);

div.appendChild(setDiv);
div.appendChild(coloringDiv);


document.querySelector('#game-container').appendChild(div);
/**
 * Create an interface for designing colored sprites
 */
class Designer {
  constructor(){
    
  }
}

export default Designer;
