import { describe, it, expect } from "vitest";
import { detectInputType } from "@/lib/input-visualizer/detect";

describe("detectInputType", () => {
  it("detects a plain integer array", () => {
    const r = detectInputType("[2,7,11,15]");
    expect(r.kind).toBe("array");
    if (r.kind === "array") expect(r.values).toEqual([2, 7, 11, 15]);
  });

  it("detects a 2D matrix of numbers", () => {
    const r = detectInputType("[[1,1,0],[0,1,0]]");
    expect(r.kind).toBe("matrix");
    if (r.kind === "matrix") expect(r.cells).toEqual([[1, 1, 0], [0, 1, 0]]);
  });

  it("detects a string", () => {
    const r = detectInputType('"abcabcbb"');
    expect(r.kind).toBe("string");
    if (r.kind === "string") expect(r.value).toBe("abcabcbb");
  });

  it("detects an array of strings", () => {
    const r = detectInputType('["eat","tea","ate"]');
    expect(r.kind).toBe("string-array");
    if (r.kind === "string-array") expect(r.values).toEqual(["eat", "tea", "ate"]);
  });

  it("detects tree from level-order with nulls (when assigned to root)", () => {
    const r = detectInputType("root = [3,9,20,null,null,15,7]");
    expect(r.kind).toBe("tree");
    if (r.kind === "tree") expect(r.levelOrder).toEqual([3, 9, 20, null, null, 15, 7]);
  });

  it("detects linked list when assigned to head", () => {
    const r = detectInputType("head = [1,2,3,4,5]");
    expect(r.kind).toBe("list");
    if (r.kind === "list") expect(r.values).toEqual([1, 2, 3, 4, 5]);
  });

  it("detects multi-arg with named parts", () => {
    const r = detectInputType("nums = [2,7,11,15], target = 9");
    expect(r.kind).toBe("multi-arg");
    if (r.kind === "multi-arg") {
      expect(r.parts).toHaveLength(2);
      expect(r.parts[0]).toEqual({ name: "nums", value: [2, 7, 11, 15] });
      expect(r.parts[1]).toEqual({ name: "target", value: 9 });
    }
  });

  it("detects graph adjacency list when assigned to adjList", () => {
    const r = detectInputType("adjList = [[2,4],[1,3],[2,4],[1,3]]");
    expect(r.kind).toBe("graph");
    if (r.kind === "graph") expect(r.adjList).toEqual([[2, 4], [1, 3], [2, 4], [1, 3]]);
  });

  it("returns unknown for malformed input", () => {
    expect(detectInputType("garbage{{")).toEqual({ kind: "unknown" });
  });

  it("returns unknown for empty string", () => {
    expect(detectInputType("")).toEqual({ kind: "unknown" });
  });
});
