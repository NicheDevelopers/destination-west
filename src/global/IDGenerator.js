/*
  file: src/global/IDGenerator.js
  purpose: Define the IDGenerator class for generating unique IDs for in-game objects
  author: Michał Miłek <https://gitlab.com/mmilek>
  
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

class IDGenerator {
  constructor(){
    this.npcID = 0;
    this.itemID = 0;
  }
  npcID() {
    return this.npcID++;
  }
  itemID() {
    return this.itemID++;
  }
}

export default IDGenerator;
