import Equipment from "./Equipment/Equipment.js";
import {
  defaultEquipmentSize,
  defaultRcp,
  defaultBd,
  cashMinMaxParameters as cashParam,
} from "./global/consts.js";
import {
  generateID,
  tileAt,
  pointToTileCoord,
  ObjectSet,
  Direction,
  randIntInRange,
} from "./global/utilities.js";
import Hitbox from "./game/HitboxClass.js";
import Movement from "./game/Movement.js";

let specialProps = new Set(["_name_", "_before_", "_after_"]);

export function addTraits(obj, ...traits) {
  if (!obj.traits) obj.traits = [];
  for (const trait of traits) {
    if (!trait._name_) {
      console.error(trait);
      throw new Error(`Attept to add a trait without _name_ property`);
    }
    if (trait._before_) {
      trait._before_.call(obj);
    }
    for (const prop in trait) {
      if (specialProps.has(prop)) continue;
      if (obj[prop] !== undefined)
        throw new Error(
          `Adding trait would override property ` +
          `${prop} of ${obj.constructor.name}`);
      obj[prop] = trait[prop];
    }
    if (trait._after_) {
      trait._after_.call(obj);
    }
  }
}

export function InventoryTrait(
  startCash,
  equipmentSize = defaultEquipmentSize,
  itemRecipeList = [],
) {
  startCash = startCash ?? randIntInRange(cashParam.minCash, cashParam.maxCash);
  return {
    _name_: "InventoryTrait",
    equipment: new Equipment(equipmentSize, startCash, itemRecipeList),
    dropItem: function (record) {
      let droppedItem = this.equipment.drop(record);
      droppedItem.setPositionTo({
        x: this.getCenterPoint().x,
        y: this.getCenterPoint().y,
      });
      if (!this.game)
        console.error("InventoryTrait in a class without a Game field.");
      this.game.currentTown.droppedItems.push(droppedItem);
      this.game.currentTown.updateFocus(this.game.player);
    },
  };
}

export function centerPointTrait(rcp = defaultRcp) {
  return {
    _name_: "centerPointTrait",
    relativeCenterPoint: rcp,
    getCenterPoint() {
      return {
        x: this.x + this.relativeCenterPoint.x,
        y: this.y + this.relativeCenterPoint.y,
      };
    },
    /**
       Move the entity to match its center point to the given coordinates
    */
    moveTo(x, y) {
      this.x = x - this.relativeCenterPoint.x;
      this.y = y - this.relativeCenterPoint.y;
    },
  };
}

export function HitboxTrait(
  self,
  locationArray,
  rcp = defaultRcp,
  bd = defaultBd,
) {
  return {
    _name_: "HitboxTrait",
    _before_() {
      addTraits(this, centerPointTrait(rcp));
    },
    locationArray: locationArray,
    boundingDistance: bd,
    hitbox: new Hitbox(self, bd),
    tileHashSet: new ObjectSet(),
    enterTile(tileX, tileY) {
      if (this.isAtTile(tileX, tileY))
        throw new Error(
          `attempt to add an entity (${self.constructor.name}) ` +
          `to the same tile twice (coords: (${tileX}, ${tileY}))`
        );
      if (!this.locationArray[tileX][tileY]) return; // omit tiles out of bounds
      this.tileHashSet.add({ x: tileX, y: tileY });
      this.locationArray[tileX][tileY].addEntity(this);
    },
    /**
       Remove this entity from entities list of the tile at given coordinates.
       If nodelete argument is falsy, also remove this tile from the entity's
       tileHashSet (this should always be done unless it is planned to clear
       the object set after leaving all tiles).
     */
    leaveTile(tileX, tileY, nodelete = false) {
      if (!this.isAtTile(tileX, tileY))
        throw new Error("Attempt to remove an entity from a tile it was not on");

      this.locationArray[tileX][tileY].removeEntity(this);

      if (!nodelete) this.tileHashSet.delete({ x: tileX, y: tileY });
    },
    leaveAllTiles() {
      for (const tileCoords of this.tileHashSet.entries()) {
        this.leaveTile(tileCoords.x, tileCoords.y, true);
      }
      this.tileHashSet.clear();
    },
    updateTilePresence() {
      this.leaveAllTiles();
      for (const tileCoord of this.getIntersectingTileCoordinates()) {
        this.enterTile(tileCoord.x, tileCoord.y);
      }
    },
    isAtTile(tileX, tileY) {
      return this.tileHashSet.has({ x: tileX, y: tileY });
    },
    _after_() {
      let tiles = this.hitbox.getIntersectingTileCoordinates();
      tiles.forEach((tile) => this.enterTile(tile.x, tile.y));
    },
    /**
     * Tests whether the entity would collide if it
     * moved this tick at speeds `speedX` and `speedY`.
     */
    willCollide(speedX, speedY) {
      return this.hitbox.willCollideWithTiles(
        this.movement.getChangeX(speedX),
        this.movement.getChangeY(speedY),
        this.game.currentTown.array,
      );
    },
    /**
       Move the entity in the direction specified by the speeds
       as many pixels as it is possible without collision. If
       it is possible to move the whole distance in this tick
       without any collisions, then this whole move is executed.

       At the beginning (even if no move is possible) this function
       clears the changeStack of the move Animation on the axis
       which given speed was 0. This is to ensure that movement
       caused by this function is in one axis only.

       On successful move both changeStacks are cleared (the snap
       puts the entity in a halt, so this fixes potential inaccuracies).

       This function was introduced to solve an issue with entities
       stopping a few (commonly 1) pixels before a colliding hitbox.
       This happens when moving the whole distance the Animation
       would move the entity in a particular tick would create
       a collision
       
       Example: Imagine playing on a very low framerate. In every tick
       the player moves by 10 pixels. If he approaches a building that is
       8 pixels away the move will not be executed. It will be stopped
       due to collision detection (a 10 pixel move is not possible).
       This function essentialy tries doing smaller moves and checks
       if they are possible. In this example it would result in an 8
       pixel move.
       
       @param {Number} speedX - The speed on the X-axis
       @param {Number} speedY - The speed on the Y-axis
    */
    moveTillCollision(speedX, speedY) {
      if (speedX * speedY !== 0)
        throw new Error (
          `moveTillCollision only supports one axis movement. ` +
          `One speed has to be 0. Speeds provided: X=${speedX}, Y=${speedY}.`
        );

      let dx = this.movement.getChangeX(speedX);
      let dy = this.movement.getChangeY(speedY);

      // change in this tick if no collisions were detected
      // (assumes one of dx and dy numbers is 0)
      let maxChange = Math.abs(dx + dy);

      let direction = new Direction().fromChangeInXAndY(dx, dy);

      let snappedPixelCount = this.hitbox.distanceTillTileCollision(
        direction,
        maxChange,
        this.game.currentTown.array,
      );

      if (snappedPixelCount === 0) return;

      // Snapped a non-zero distance
      if (Math.sign(dx)) {
        this.x += Math.sign(dx) * snappedPixelCount;
        this.movement.moveX.clearChangeStack();
      } else {
        this.y += Math.sign(dy) * snappedPixelCount;
        this.movement.moveY.clearChangeStack();
      }
    },
    /**
     * Check whether this hitbox intersects with a tile on provided coordinates
     * @param {Object {x: tileX, y: tileY}} tileCoords - Tile coordinates object
     */
    intersectsWithTileOn(tileCoords) {
      return this.hitbox
        .getBoundingBox()
        .intersects(this.game.currentTown.array[tileCoords.x][tileCoords.y]);
    },
    /**
     * Returns an array of intersecting tiles' coordinates
     */
    getIntersectingTileCoordinates() {
      return this.hitbox.getIntersectingTileCoordinates();
    },
  };
}

export function MovementTrait(self, speed, sprintMp, sneakMp, options) {
  return {
    _name_: "MovementTrait",
    movement: new Movement(self, speed, sprintMp, sneakMp, options),
  };
}

export function CollideTrait() { }
