/**
   A class similar to the built-in Set object,
   created for storing objects and comparing
   them based on properties instead of references.
*/
export class ObjectSet<T> {
  elements: T[];

  constructor(initialObjectsArray: T[] | undefined = undefined) {
    this.elements = [];
    if (initialObjectsArray === undefined) return;
    for (const obj of initialObjectsArray) {
      this.add(obj);
    }
  }
  /**
     Adds the provided objects to the set. Objects equal
     (according to the areObjectsEqual function) to any
     already present in the ObjectSet, are not added.
  */
  add(...objs: T[]) {
    for (const obj of objs) {
      if (!this.has(obj)) this.elements.push(obj);
    }
  }
  /**
     Deletes an object from the ObjectSet, comparing
     the argument with stored objects according to
     the areObjectsEqual function.
     Returns true if an object was deleted and false
     if no matching objects were found.
  */
  delete(obj: T) {
    let index = 0;
    for (const e of this.elements) {
      if (this.areObjectsEqual(obj, e)) {
        this.elements.splice(index, 1);
        return true;
      }
      index++;
    }
    return false;
  }
  /**
     Returns true if the ObjectSet contains an equal
     (according to the areObjectsEqual function) object
     to the one provided as the argument
  */
  has(obj: T) {
    for (const e of this.elements) {
      if (this.areObjectsEqual(obj, e)) return true;
    }
    return false;
  }
  /**
     areObjectEqual uses a property comparison which
     strictly compares values of own properties and always
     returns false if one of the objects has an own property
     which the other does not.
  */
  areObjectsEqual(obj1: T, obj2: T) {
    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 == null || obj2 == null)
      return false;
    const a = obj1 as Record<string, unknown>;
    const b = obj2 as Record<string, unknown>;
    for (const prop of Object.getOwnPropertyNames(a)) {
      if (a[prop] !== b[prop]) return false;
    }
    for (const prop of Object.getOwnPropertyNames(b)) {
      if (!Object.hasOwn(a, prop)) return false;
    }
    return true;
  }
  /**
     Returns an array of the objects stored in the ObjectSet
  */
  entries(): T[] {
    return this.elements;
  }
  clear(): void {
    this.elements.length = 0;
  }
}
