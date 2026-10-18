// Types for the Array.prototype extensions defined in utilities.js.

export {};

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
    max(fn?: (a: T, b: T) => number): T | undefined;
    min(fn?: (a: T, b: T) => number): T | undefined;
    maxBy(prop: keyof T): T | undefined;
    minBy(prop: keyof T): T | undefined;
    equals(otherArray: readonly unknown[]): boolean;
  }
}
