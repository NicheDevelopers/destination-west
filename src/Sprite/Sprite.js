/*
  file: src/Sprite.js
  purpose: define the Sprite class for displaying sprites
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
import { ctx } from "../Core/Browser.js";
import { tileSize, spriteScale,
	 transparencyAlphaTolerance,
	 defaultHitboxHeight,
	 autoBoundaryXLooseness } from "../global/consts.js";
import { createCanvas, randIntInRange, forbidProperty } from "../global/utilities.js";
import imgInfo from "../static/imgInfo.js";

function transparent(alpha) {
  return (alpha<transparencyAlphaTolerance);
}

function toKey(name, rotation, outline) {
  return name+'/'+(rotation === undefined? 'n' : rotation)+'/'+(outline? 'y' : 'n');
}

const cachedSprites = new Map(); // String -> Image
const cacheCallbacks = new Map(); // String -> functions[]

/**
 * Create sprites to make display of images simple
 */
class Sprite {
  /**
   * Create a sprite
     @param {string} typeName - Name of the sprite graphic to be used
     @param {Object} [options] - Additional options
  */
  constructor(typeName, options = {}, isColored = false) {
    if (!imgInfo.has(typeName)) {
      	throw `type name is not recognized: ${typeName}`;
    }
    forbidProperty(this, "animation");
    
    this.typeName = typeName;

    this.scale = options.scale ?? spriteScale;
    this.scaleX = options.scaleX ?? this.scale;
    this.scaleY = options.scaleY ?? this.scale;

    this.sheetInfo = imgInfo.get(typeName);

    this.height = this.sheetInfo.spriteHeight ?? tileSize;
    this.width = this.sheetInfo.spriteWidth ?? tileSize;
    this.spriteSheetRow = this.sheetInfo.row ?? 0;
    this.spriteSheetCol = this.sheetInfo.col ?? 0;
    
    if (this.sheetInfo.random) {
      this.spriteSheetRow = randIntInRange(0, this.sheetInfo.height);
      this.spriteSheetCol = randIntInRange(0, this.sheetInfo.width);
    }

    this.callback = options.callback ?? (() => {});

    //if (options.debug) debugger;
    this.nocache = options.nocache;
    this.rotation = (options.crop)? 0 : options.rotation;
    this.outline = options.outline;
        
    if (isColored) return;

    if (this.sheetInfo.src === undefined)
      throw `Sprite: No image path provided for sprite: ${typeName}`;

    this.processingImage = (this.rotation !== undefined || this.outline !== undefined);
    
    const spriteKey = toKey(this.typeName, this.rotation, this.outline);

       
    if (!this.nocache && cachedSprites.has(spriteKey)) {
      this.img = cachedSprites.get(spriteKey);
      
      if (cachedSprites.get(spriteKey).complete) {
        // Image is already loaded
        if (this.processingImage) {
          this.spriteSheetCol = 0;
          this.spriteSheetRow = 0;
        }
        this.callback();
      }
      else {
        // We need to wait for the image to load
	cacheCallbacks.get(spriteKey).push(this.callback);
      }
      //console.log(`Cached: ${spriteKey}: ${this.img.src}`);
      return;
    }
    
    this.img = new Image();
    this.img.style.display = 'block';
    //console.log(`---caching: ${spriteKey}`);
    cachedSprites.set(spriteKey, this.img);
    cacheCallbacks.set(spriteKey, [this.callback]);
    
    if (!this.processingImage) {
      this.img.onload = () => {
	      cacheCallbacks.get(spriteKey).forEach((f) => f());
      }
      this.img.src = this.sheetInfo.src;
      return;
    }

    this.imageToProcess = new Image();

    this.imageToProcess.onload = () => {
      if (this.rotation !== undefined) {
	      this.rotate(this.rotation * Math.PI / 180,
		    () => {
		      if (this.outline) {
			      this.drawOutline(this.img, () => {
			        cacheCallbacks.get(spriteKey).forEach((f) => f());
			      });
		      }
		      else 
            cacheCallbacks.get(spriteKey).forEach((f) => f());
		    });
      }
      else if (this.outline) {
	      this.drawOutline(this.imageToProcess, () => {
	        cacheCallbacks.get(spriteKey).forEach((f) => f());
	      });
      }
    };
    this.imageToProcess.src = this.sheetInfo.src;
  }
  
  /**
     Analyzes the sprite to guess the best values for
     the relativeCenterPoint and the boundingDistance.

     This is done by looking for the sprite's visual
     bounds (i.e. finding the first/last rows/columns where
     non-transparent pixels are located).

     Supported options:
     getBaselineRcp - Boolean
     If truthy value is provided, the function returns
     a single object, the relativeCenterPoint of the sprite,
     with its y coordinate matching the baseline of the sprite.
  */
  getSpriteHitboxInfo(options = {}) {
    if (!this.img.complete) {
      throw `attempt to getSpriteHitboxInfo of an unloaded sprite: ${this.typeName}`;
    }
    let width = options.width ?? this.width;
    let height = options.height ?? this.height;
    const { context: offContext } =
      createCanvas(width, height);

    this.draw(0, 0, offContext);
    
    let image = offContext.getImageData(0, 0, this.width, this.height);

    /*
      startX and endX are respectively the smallest
      and the biggest X coordinates on which a non-transparent
      pixel can be found within the image
    */
    let startX, endX;
    for (let x=0;x<this.width; ++x) {
      for (let y=0;y<this.height; ++y) {
	let currentPixelTransparency = image.data[(x+y*this.width)*4+3];
	if (!transparent(currentPixelTransparency)) {
	  // Non-transparent pixel found
	  startX = x;
	  break;
	}
      }
      if (startX !== undefined) break;
    }
    
    for (let x=this.width-1;x>=0; --x) {
      for (let y=0;y<this.height; ++y) {
	let currentPixelTransparency = image.data[(x+y*this.width)*4+3];
	if (!transparent(currentPixelTransparency)) {
	  // Non-transparent pixel found
	  endX = x;
	  break;
	}
      }
      if (endX !== undefined) break;
    }
    
    /*
      endY is the biggest Y coordinate on which a non-transparent
      pixel can be found within the image.
      
      We do not look for startY because it does not have an important
      meaning when it comes to hitbox dimentions
    */
    let endY;
    for (let y=this.height-1;y>=0; --y) {
      for (let x=0;x<this.width; ++x) {
	let currentPixelTransparency = image.data[(x+y*this.width)*4+3];
	if (!transparent(currentPixelTransparency)) {
	  // Non-transparent pixel found
      	  endY = y;
	  break;
	}
      }
      if (endY !== undefined) break;
    }

    /**
       The central pixel of the non-transparent sprite area
    */
    let centerPixel = ~~((startX+endX)/2);
    
    if (options.getBaselineRcp) {
      return { x: centerPixel, y: endY };
    }
    
    let boundingDistanceHeight = ~~(defaultHitboxHeight/2);
    
    /**
       Detected relative center point of the sprite
    */
    let rcp = { x: centerPixel, y: endY-boundingDistanceHeight };
    
    let hitboxWidth = endX-startX+1;
    
    /**
       Amount of pixels subtracted from the hitbox's dimensions
       on the x-axis.
       See documentation for autoBoundaryXLooseness.
    */
    let looseness = ~~((autoBoundaryXLooseness*hitboxWidth)/2);
    
    return {
      relativeCenterPoint: rcp,
      boundingDistance: {
	up: boundingDistanceHeight,
	down: boundingDistanceHeight,
	left: rcp.x-startX-looseness,
	right: endX-rcp.x-looseness
      }
    };
  }
  
  rotate(angle, callback) {
    const { canvas: canvas, context: offCtx } = createCanvas(this.width, this.height);
    offCtx.translate(this.width/2, this.height/2);
    offCtx.rotate(angle);
    offCtx.translate(-this.width/2, -this.height/2);
        
    offCtx.drawImage(this.imageToProcess,
		     this.spriteSheetCol * this.width,
		     this.spriteSheetRow * this.height,
		     this.width, this.height, 0, 0,
		     this.width * this.scaleX, this.height * this.scaleY);

    this.spriteSheetCol = 0;
    this.spriteSheetRow = 0;
    
    this.img.onload = callback;
    this.img.src = canvas.toDataURL('image/png');
  }

  drawOutline(image, callback) {
    let borderCoordinates = [
      //{x: 0, y : -5},
      {x: -1, y:  0},
      {x:  1, y:  0},
      {x:  0, y: -1},
      {x:  0, y:  1}
    ];
    if (this.outline.corners) {
      borderCoordinates.concat([
        {x:  -1, y: -1},
        {x:  -1, y:  1},
        {x:   1, y: -1},
        {x:   1, y:  1}
      ]);
    }
    let color = {r: 255, g: 255, b: 255, a: 255};
    const { canvas: canvas, context: offCtx } = createCanvas(this.width, this.height);
    offCtx.drawImage(
      image,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width, this.height, 0, 0,
      this.width * this.scaleX, this.height * this.scaleY);

    this.spriteSheetCol = 0;
    this.spriteSheetRow = 0;
    
    let imgDataRef = offCtx.getImageData(0, 0, this.width, this.height);
    let imgData = offCtx.getImageData(0, 0, this.width, this.height);

    for (let y=1; y < this.height-1; ++y) {
      for (let x=1; x < this.width-1; ++x) {
	      let ix = x*4 + y*this.width*4; // index of the currently processed pixel
	      if (transparent(imgDataRef.data[ix + 3]))
	        continue;

	      borderCoordinates.forEach(({x: dx, y: dy}) => {
          let index = ix + dx*4 + dy*this.width*4;
          if (transparent(imgDataRef.data[index + 3])) {
            imgData.data[index] = color.r;
            imgData.data[index + 1] = color.g;
            imgData.data[index + 2] = color.b;
            imgData.data[index + 3] = color.a;
          }
	      });
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    
    this.img.onload = callback;
    this.img.src = canvas.toDataURL('image/png');
  }

  /**
  * Draw the sprite on the #game-canvas
  @param {number} x - Position x of the draw location
  @param {number} y - Position y of the draw location
  */
  draw(x, y, context = ctx, options = {}) {
    context.drawImage(
      this.img,
      this.spriteSheetCol * this.width,
      this.spriteSheetRow * this.height,
      this.width, this.height, x, y,
		      this.width * this.scaleX, this.height * this.scaleY);
    if (options.innerOutline) {
      context.fillStyle = "black";
      context.fillRect(x, y,
		       this.width * this.scaleX, 1);
    }
  }
}

export default Sprite;
