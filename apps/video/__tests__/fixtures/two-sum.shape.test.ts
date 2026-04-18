import { describe, it, expect } from "vitest";
import { twoSum } from "../../src/fixtures/two-sum";

describe("fixtures/two-sum", () => {
  it("has required problem fields", () => {
    expect(twoSum.slug).toBe("two-sum");
    expect(twoSum.title).toBeTypeOf("string");
    expect(twoSum.difficulty).toBe("EASY");
    expect(twoSum.description).toBeTypeOf("string");
    expect(twoSum.description.length).toBeGreaterThan(20);
  });

  it("has at least 2 non-hidden test cases shaped like DB rows", () => {
    expect(Array.isArray(twoSum.testCases)).toBe(true);
    expect(twoSum.testCases.length).toBeGreaterThanOrEqual(2);
    for (const tc of twoSum.testCases) {
      expect(tc.id).toBeTypeOf("string");
      expect(tc.input).toBeTypeOf("string");
      expect(tc.expected).toBeTypeOf("string");
    }
  });

  it("first test case is the classic [2,7,11,15] target=9 demo", () => {
    const first = twoSum.testCases[0];
    expect(first.input).toContain("[2,7,11,15]");
    expect(first.input).toContain("target");
    expect(first.expected).toContain("0");
    expect(first.expected).toContain("1");
  });
});
