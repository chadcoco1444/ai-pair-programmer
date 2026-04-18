import { describe, it, expect } from "vitest";
import { maxDepth } from "../../src/fixtures/max-depth";

describe("fixtures/max-depth", () => {
  it("has required problem fields", () => {
    expect(maxDepth.slug).toBe("maximum-depth-of-binary-tree");
    expect(maxDepth.title).toBeTypeOf("string");
    expect(maxDepth.difficulty).toBe("EASY");
    expect(maxDepth.description).toBeTypeOf("string");
    expect(maxDepth.description.length).toBeGreaterThan(20);
  });

  it("has at least 2 test cases shaped like DB rows", () => {
    expect(Array.isArray(maxDepth.testCases)).toBe(true);
    expect(maxDepth.testCases.length).toBeGreaterThanOrEqual(2);
    for (const tc of maxDepth.testCases) {
      expect(tc.id).toBeTypeOf("string");
      expect(tc.input).toBeTypeOf("string");
      expect(tc.expected).toBeTypeOf("string");
    }
  });

  it("first test case is the classic level-order tree", () => {
    const first = maxDepth.testCases[0];
    expect(first.input).toContain("[3,9,20,null,null,15,7]");
    expect(first.input).toContain("root");
    expect(first.expected).toBe("3");
  });
});
