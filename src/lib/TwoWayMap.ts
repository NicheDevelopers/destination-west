/**
 * A data structure that stores pairs of keys and values.
 * All the keys within a TwoWayMap are unique, but more than
 * one key could lead to the same value. If that's the case, calling getKey()
 * will return the key that was added first.
 * @param array - An array of key-value pairs to initialize the TwoWayMap
 * @param ignoreDuplicates - Whether to ignore duplicate keys
 * and leave original values mapped to them during creation from the provided array.
 * The default behavior is to throw an error in such case.
 */
export class TwoWayMap<T, V> {
  private keyToValue: Map<T, V> = new Map<T, V>();
  private valueToKey: Map<V, T> = new Map<V, T>();

  constructor(array: [T, V][] = [], ignoreDuplicates: boolean = false) {
    array.forEach(([key, value]) => {
      this.set(key, value, ignoreDuplicates);
    });
  }
  set(key: T, value: V, ignoreDuplicates: boolean = false) {
    if (this.keyToValue.has(key)) {
      if (ignoreDuplicates) return;
      throw new Error(`Key '${String(key)}' is already present in the TwoWayMap`);
    }
    this.keyToValue.set(key, value);

    if (!this.valueToKey.has(value)) this.valueToKey.set(value, key);
  }

  getValue(key: T): V | undefined {
    return this.keyToValue.get(key);
  }

  getKey(value: V): T | undefined {
    return this.valueToKey.get(value);
  }

  hasValue(value: V): boolean {
    return this.valueToKey.has(value);
  }

  hasKey(key: T): boolean {
    return this.keyToValue.has(key);
  }

  deleteByKey(key: T): void {
    let value = this.getValue(key);
    if (value === undefined) return;
    this.keyToValue.delete(key);

    // valueToKey only points to the first key mapped to the value,
    // so it needs updating only if that was the deleted key
    if (this.valueToKey.get(value) === key) this.remapValue(value);
  }

  deleteByValue(value: V): void {
    let key = this.getKey(value);
    if (key === undefined) return;
    this.keyToValue.delete(key);
    this.remapValue(value);
  }

  /**
   * Points the valueToKey entry of the value to the first key still mapped to it,
   * or removes the entry if there are no such keys
   */
  private remapValue(value: V): void {
    this.valueToKey.delete(value);
    for (const [k, v] of this.keyToValue) {
      if (v === value) {
        this.valueToKey.set(v, k);
        return;
      }
    }
  }

  clear(): void {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }

  get size(): number {
    return this.keyToValue.size;
  }

  copy(): TwoWayMap<T, V> {
    return new TwoWayMap(Array.from(this.keyToValue.entries()));
  }

  map(mapFn: (entry: [T, V]) => [T, V], ignoreDuplicates: boolean = false): TwoWayMap<T, V> {
    return new TwoWayMap(Array.from(this.keyToValue.entries()).map(mapFn), ignoreDuplicates);
  }
}
