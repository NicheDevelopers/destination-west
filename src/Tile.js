/*
  file: src/Tile.js
  purpose: define the Tile class, the base of the game world structure
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

import Sprite from "./Sprite/Sprite.js";
/**
 * Class for creating tiles - the base of the game world structure
 */
class Tile{
  constructor(typeName, x=0, y=0){
    this.typeName = typeName;
    if(typeName.substring(0, 9) === 'building-')
      this.background = new Sprite('sand');
    this.sprite = new Sprite(typeName);
    this.x = x;
    this.y = y;
    this.walkable = true;
    this.items = [];
  }
  draw(x,y){
    this.background?.draw(x,y);
    this.sprite.draw(x, y);
  }
}

export default Tile;
