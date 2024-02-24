import Item from "../Item/Item.js";

/**
 * Function for Item creation
 * @param {Object} obj item object 
 * @returns {Item} Item created from object
 */
export function createItem(obj){
    if (obj) 
        return new Item(
            obj.name, 
            obj.spriteName, 
            obj.durability, 
            obj.weight, 
            obj.price, 
            obj.priceRetention, 
            obj.isStackable
        );
    else throw `There is no Item defined in items such as this one: ${obj},
        please consider looking into: './global/items.js' into const items for more.`;
}

export const items = {
    apple: {
        name: 'Apple',
        spriteName: 'apple',
        durability: 0,
        weight: 5,
        price: 1,
        priceRetention: 0,
        isStackable: true
    },
    cigar: {
        name: 'Cigar',
        spriteName: 'cigar',
        durability: 0,
        weight: 1,
        price: 1,
        priceRetention: 0,
        isStackable: false
    },
    whisky: {
        name: 'Whisky',
        spriteName: 'whisky',
        durability: 0,
        weight: 3,
        price: 3,
        priceRetention: 0,
        isStackable: true
    },
    brokenBottle: {
        name: 'Broken Bottle',
        spriteName: 'broken-bottle',
        durability: 0,
        weight: 1,
        price: 0.5,
        priceRetention: 0,
        isStackable: false
    },
    revolver1: {
        name: 'Revolver',
        spriteName: 'revolver-1',
        durability: 0,
        weight: 7,
        price: 200,
        priceRetention: 0,
        isStackable: false
    },
    revolver2: {
        name: 'Revolver',
        spriteName: 'revolver-2',
        durability: 0,
        weight: 5,
        price: 150,
        priceRetention: 0,
        isStackable: false
    }
};
