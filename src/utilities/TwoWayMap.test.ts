import { describe, expect, it } from "vite-plus/test";
import { TwoWayMap } from "./TwoWayMap.js";

describe("TwoWayMap", () => {
  describe("constructor", () => {
    it("starts empty without arguments", () => {
      expect(new TwoWayMap().size).toBe(0);
    });

    it("is populated from key-value pairs", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      expect(map.size).toBe(2);
      expect(map.getValue("a")).toBe(1);
      expect(map.getKey(2)).toBe("b");
    });

    it("throws on duplicate keys by default", () => {
      expect(
        () =>
          new TwoWayMap([
            ["a", 1],
            ["a", 2],
          ]),
      ).toThrow("Key 'a' is already present in the TwoWayMap");
    });

    it("keeps the original value for duplicate keys with ignoreDuplicates", () => {
      const map = new TwoWayMap(
        [
          ["a", 1],
          ["a", 2],
        ],
        true,
      );
      expect(map.size).toBe(1);
      expect(map.getValue("a")).toBe(1);
      expect(map.hasValue(2)).toBe(false);
    });
  });

  describe("set / get / has", () => {
    it("maps both ways", () => {
      const map = new TwoWayMap<string, number>();
      map.set("a", 1);
      expect(map.getValue("a")).toBe(1);
      expect(map.getKey(1)).toBe("a");
      expect(map.hasKey("a")).toBe(true);
      expect(map.hasValue(1)).toBe(true);
    });

    it("returns undefined / false for missing entries", () => {
      const map = new TwoWayMap<string, number>();
      expect(map.getValue("a")).toBeUndefined();
      expect(map.getKey(1)).toBeUndefined();
      expect(map.hasKey("a")).toBe(false);
      expect(map.hasValue(1)).toBe(false);
    });

    it("throws when setting an existing key", () => {
      const map = new TwoWayMap([["a", 1]]);
      expect(() => map.set("a", 2)).toThrow();
      expect(map.getValue("a")).toBe(1);
    });

    it("ignores an existing key with ignoreDuplicates", () => {
      const map = new TwoWayMap([["a", 1]]);
      map.set("a", 2, true);
      expect(map.getValue("a")).toBe(1);
    });

    it("returns the first added key when several keys share a value", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 1],
      ]);
      expect(map.getValue("a")).toBe(1);
      expect(map.getValue("b")).toBe(1);
      expect(map.getKey(1)).toBe("a");
    });
  });

  describe("deleteByKey", () => {
    it("removes the entry in both directions", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      map.deleteByKey("a");
      expect(map.hasKey("a")).toBe(false);
      expect(map.hasValue(1)).toBe(false);
      expect(map.size).toBe(1);
    });

    it("does nothing for a missing key", () => {
      const map = new TwoWayMap([["a", 1]]);
      map.deleteByKey("b");
      expect(map.size).toBe(1);
    });

    it("keeps the value mapped to the first key when deleting a later key", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 1],
      ]);
      map.deleteByKey("b");
      expect(map.getValue("a")).toBe(1);
      expect(map.getKey(1)).toBe("a");
      expect(map.hasValue(1)).toBe(true);
    });

    it("remaps the value to the next key when deleting the first key", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
        ["c", 1],
      ]);
      map.deleteByKey("a");
      expect(map.getKey(1)).toBe("c");
      expect(map.hasValue(1)).toBe(true);
    });

    it("removes the value once its last key is deleted", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 1],
      ]);
      map.deleteByKey("a");
      map.deleteByKey("b");
      expect(map.hasValue(1)).toBe(false);
      expect(map.size).toBe(0);
    });
  });

  describe("deleteByValue", () => {
    it("removes the entry in both directions", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      map.deleteByValue(1);
      expect(map.hasKey("a")).toBe(false);
      expect(map.hasValue(1)).toBe(false);
      expect(map.size).toBe(1);
    });

    it("does nothing for a missing value", () => {
      const map = new TwoWayMap([["a", 1]]);
      map.deleteByValue(2);
      expect(map.size).toBe(1);
    });

    it("removes only the first key and remaps the value to the next one", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
        ["c", 1],
      ]);
      map.deleteByValue(1);
      expect(map.hasKey("a")).toBe(false);
      expect(map.hasKey("c")).toBe(true);
      expect(map.getKey(1)).toBe("c");
      expect(map.size).toBe(2);
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.hasKey("a")).toBe(false);
      expect(map.hasValue(2)).toBe(false);
    });
  });

  describe("copy", () => {
    it("creates an independent map with the same entries", () => {
      const map = new TwoWayMap([["a", 1]]);
      const copy = map.copy();
      copy.set("b", 2);
      map.deleteByKey("a");
      expect(copy.getValue("a")).toBe(1);
      expect(copy.size).toBe(2);
      expect(map.size).toBe(0);
    });
  });

  describe("map", () => {
    it("returns a new map with transformed entries", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      const mapped = map.map(([k, v]) => [k.toUpperCase(), v * 10]);
      expect(mapped.getValue("A")).toBe(10);
      expect(mapped.getKey(20)).toBe("B");
      expect(map.getValue("a")).toBe(1);
    });

    it("throws when the mapping produces duplicate keys", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      expect(() => map.map(([, v]) => ["x", v])).toThrow();
    });

    it("keeps the first entry for duplicate keys with ignoreDuplicates", () => {
      const map = new TwoWayMap([
        ["a", 1],
        ["b", 2],
      ]);
      const mapped = map.map(([, v]) => ["x", v], true);
      expect(mapped.size).toBe(1);
      expect(mapped.getValue("x")).toBe(1);
    });
  });
});
