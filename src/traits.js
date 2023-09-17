import Equipment from "./Equipment.js";
import { defaultEquipmentSize, defaultRcp, defaultBd} from "./global/consts.js";
import { generateID, tileAt, pointToTileCoord, ObjectSet } from "./global/utilities.js";
import Hitbox from "./Hitbox.js";
import Movement from "./Movement.js";

let specialProps = new Set(["_name_", "_before_", "_after_"]);

export function addTraits(obj, ...traits) {
  if (!obj.traits) obj.traits = [];
  for (const trait of traits) {
    if (!trait._name_) {
      console.error(trait);
      throw `attept to add a trait without _name_ property`;
    }
    if (trait._before_) {
      trait._before_.call(obj);
    }
    for (const prop in trait) {
      if (specialProps.has(prop)) continue;
      if (obj[prop] !== undefined)
	throw `adding trait would override property ${prop} of ${obj.constructor.name}`;
      obj[prop] = trait[prop];
    }
    if (trait._after_) {
      trait._after_.call(obj);
    }
  }
}

export function InventoryTrait(equipmentSize=defaultEquipmentSize) {
  return {
    _name_: "InventoryTrait",
    equipment: new Equipment(equipmentSize),
    dropItem: function (record) {
      let droppedItem = this.equipment.dropFrom(record);
      droppedItem.setPositionTo(
        (this.centerPoint) ? { x: this.centerPoint.x, y: this.centerPoint.y }
          : { x: this.x, y: this.y });
      if (!this.game) console.error('InventoryTrait in a class without a Game field.');
      this.game.currentTown.droppedItems.push(droppedItem);
      this.game.currentTown.updateFocus(this.game.player);
    }
  };
}

export function centerPointTrait(rcp=defaultRcp) {
  return {
    _name_: "centerPointTrait",
    relativeCenterPoint: rcp,
    getCenterPoint() {
      return {x: this.x + this.relativeCenterPoint.x,
	      y: this.y + this.relativeCenterPoint.y};
    }
  };
}
   
export function HitboxTrait(self, locationArray, rcp=defaultRcp,
			    bd=defaultBd) {
  return {
    _name_: "HitboxTrait",
    _before_() {
      addTraits(this, centerPointTrait(rcp));
    },
    id: generateID("hitboxEntity"),
    locationArray: locationArray,
    boundingDistance: bd,
    hitbox: new Hitbox(self, bd),
    tileHashSet: new ObjectSet(),
    enterTile(tileX, tileY) {
      if (this.isAtTile(tileX, tileY))
	throw `attempt to add an entity (${self.constructor.name}) ` +
	`to the same tile twice (coords: (${tileX}, ${tileY}))`;
      if (!this.locationArray[tileX][tileY])
	return; // omit tiles out of bounds
      this.tileHashSet.add({x: tileX, y: tileY});
      this.locationArray[tileX][tileY].addEntity(this);
    },
    leaveTile(tileX, tileY) {
      if (!this.isAtTile(tileX, tileY))
	throw "attempt to remove an entity from a tile it was not on";
      
      this.tileHashSet.delete({x: tileX, y: tileY});
      this.locationArray[tileX][tileY].removeEntity(this);
    },
    isAtTile(tileX, tileY) {
      return this.tileHashSet.has({x: tileX, y: tileY});
    },
    _after_() {
      let tiles = this.hitbox.getIntersectingTileCoordinates();
      tiles.forEach(tile => this.enterTile(tile.x, tile.y));
    }
  };
}

export function MovementTrait(self, speed, sprintMp, sneakMp, options) {
  return {
    _name_: "MovementTrait",
    movement: new Movement(self, speed, sprintMp, sneakMp, options)
  };
}

export function CollideTrait() {
}
