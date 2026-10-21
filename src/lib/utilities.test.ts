import { describe, expect, it } from "vite-plus/test";
import "./utilities";

describe("Array.prototype extensions", () => {
  describe("first / last / lastIndex", () => {
    it("return the boundary elements and index", () => {
      const arr = [1, 2, 3];
      expect(arr.first).toBe(1);
      expect(arr.last).toBe(3);
      expect(arr.lastIndex).toBe(2);
    });

    it("handle empty arrays", () => {
      const arr: number[] = [];
      expect(arr.first).toBeUndefined();
      expect(arr.last).toBeUndefined();
      expect(arr.lastIndex).toBe(-1);
    });
  });

  describe("none", () => {
    it("is true only when no element matches", () => {
      expect([1, 3, 5].none((x) => x % 2 === 0)).toBe(true);
      expect([1, 2, 5].none((x) => x % 2 === 0)).toBe(false);
      expect([].none(() => true)).toBe(true);
    });
  });

  describe("lastNthElement", () => {
    it("counts from the end", () => {
      const arr = ["a", "b", "c"];
      expect(arr.lastNthElement(0)).toBe("c");
      expect(arr.lastNthElement(2)).toBe("a");
    });

    it("throws when out of range", () => {
      expect(() => ["a"].lastNthElement(1)).toThrow();
      expect(() => ["a"].lastNthElement(-1)).toThrow();
    });
  });

  describe("popFirst", () => {
    it("removes only the first matching element in place", () => {
      const arr = [1, 2, 3, 2];
      arr.popFirst(2);
      expect(arr).toEqual([1, 3, 2]);
    });

    it("leaves the array unchanged when the value is absent", () => {
      const arr = [1, 2, 3];
      arr.popFirst(4);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe("clear", () => {
    it("empties the array in place", () => {
      const arr = [1, 2, 3];
      const ref = arr;
      arr.clear();
      expect(ref).toHaveLength(0);
    });
  });

  describe("max / min", () => {
    it("use numeric comparison by default", () => {
      const arr = [3, 10, 0, -4, 7];
      expect(arr.max()).toBe(10);
      expect(arr.min()).toBe(-4);
    });

    it("accept a custom comparator", () => {
      const words = ["ccc", "a", "bb"];
      const byLength = (a: string, b: string) => a.length - b.length;
      expect(words.max(byLength)).toBe("ccc");
      expect(words.min(byLength)).toBe("a");
    });

    it("return undefined for empty arrays", () => {
      expect([].max()).toBeUndefined();
      expect([].min()).toBeUndefined();
    });
  });

  describe("maxBy / minBy", () => {
    const items = [
      { name: "a", weight: 5 },
      { name: "b", weight: 12 },
      { name: "c", weight: 1 },
    ];

    it("pick the element with the extreme property value", () => {
      expect(items.maxBy("weight")?.name).toBe("b");
      expect(items.minBy("weight")?.name).toBe("c");
    });
  });

  describe("equals", () => {
    it("compares elements strictly and in order", () => {
      expect([1, 2, 3].equals([1, 2, 3])).toBe(true);
      expect([1, 2, 3].equals([3, 2, 1])).toBe(false);
      expect([1, 2].equals([1, 2, 3])).toBe(false);
      expect([{}].equals([{}])).toBe(false);
    });
  });
});
