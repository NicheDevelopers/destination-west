// Types for the Array.prototype extensions defined in utilities.ts.

export {};
export type Comparator<T> = Parameters<Array<T>["sort"]>[0];

declare global {
  interface Array<T> {
    none(fn: (value: T, index: number, array: T[]) => unknown): boolean;
    readonly lastIndex: number;
    readonly first: T | undefined;
    readonly last: T | undefined;
    lastNthElement(n: number): T;
    popFirst(value: T): void;
    clear(): void;
    randomElement(): T | undefined;
    srandomElement(): T | undefined;
    max(fn?: Comparator<T>): T | undefined;
    min(fn?: Comparator<T>): T | undefined;
    maxBy(prop: keyof T): T | undefined;
    minBy(prop: keyof T): T | undefined;
    equals(otherArray: readonly unknown[]): boolean;
  }
  interface String {
    capitalized(): string;
    isNumber(): boolean;
    toNumber(): number;
  }
  interface Map<K, V> {
    keysArray(): K[];
    valuesArray(): V[];
  }
}
