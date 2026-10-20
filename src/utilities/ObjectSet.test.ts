import { describe, expect, it } from "vite-plus/test";
import { ObjectSet } from "./ObjectSet.js";

describe("ObjectSet", () => {
  describe("constructor", () => {
    it("starts empty without arguments", () => {
      expect(new ObjectSet().entries()).toEqual([]);
    });

    it("deduplicates the initial array by properties", () => {
      const set = new ObjectSet([
        { x: 1, y: 2 },
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
      expect(set.entries()).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
    });
  });

  describe("add", () => {
    it("skips objects equal to ones already present", () => {
      const set = new ObjectSet<{ x: number; y: number }>();
      set.add({ x: 1, y: 2 });
      set.add({ x: 1, y: 2 });
      expect(set.entries()).toHaveLength(1);
    });

    it("accepts multiple objects and deduplicates among them", () => {
      const set = new ObjectSet<{ id: number }>();
      set.add({ id: 1 }, { id: 2 }, { id: 1 });
      expect(set.entries()).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("keeps the first of equal objects", () => {
      const first = { id: 1 };
      const set = new ObjectSet([first]);
      set.add({ id: 1 });
      expect(set.entries()[0]).toBe(first);
    });
  });

  describe("has", () => {
    it("compares by properties, not references", () => {
      const set = new ObjectSet([{ x: 1, y: 2 }]);
      expect(set.has({ x: 1, y: 2 })).toBe(true);
      expect(set.has({ x: 2, y: 1 })).toBe(false);
    });
  });

  describe("delete", () => {
    it("removes an equal object and returns true", () => {
      const set = new ObjectSet([{ id: 1 }, { id: 2 }]);
      expect(set.delete({ id: 1 })).toBe(true);
      expect(set.entries()).toEqual([{ id: 2 }]);
    });

    it("returns false when nothing matches", () => {
      const set = new ObjectSet([{ id: 1 }]);
      expect(set.delete({ id: 2 })).toBe(false);
      expect(set.entries()).toHaveLength(1);
    });
  });

  describe("areObjectsEqual", () => {
    const set = new ObjectSet<object>();

    it("is true for objects with the same own properties and values", () => {
      expect(set.areObjectsEqual({ a: 1, b: "x" }, { b: "x", a: 1 })).toBe(true);
    });

    it("is false when values differ", () => {
      expect(set.areObjectsEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("is false when either object has an extra property", () => {
      expect(set.areObjectsEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(set.areObjectsEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it("compares nested objects by reference", () => {
      const inner = { z: 1 };
      expect(set.areObjectsEqual({ inner }, { inner })).toBe(true);
      expect(set.areObjectsEqual({ inner }, { inner: { z: 1 } })).toBe(false);
    });

    it("is false for null", () => {
      expect(set.areObjectsEqual(null as unknown as object, {})).toBe(false);
      expect(set.areObjectsEqual({}, null as unknown as object)).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all elements", () => {
      const set = new ObjectSet([{ id: 1 }, { id: 2 }]);
      set.clear();
      expect(set.entries()).toEqual([]);
      expect(set.has({ id: 1 })).toBe(false);
    });
  });
});
