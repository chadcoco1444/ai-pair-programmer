import { describe, it, expect } from "vitest";
import { parseTestInput } from "@/server/services/input-parser";

describe("parseTestInput", () => {
  // ─── Format 1: var = val ───────────────────────────────────────────────────

  it("parses single var=val with array", () => {
    expect(parseTestInput("nums = [2,7,11,15], target = 9")).toEqual([
      [2, 7, 11, 15],
      9,
    ]);
  });

  it("parses single var=val with 2D array (nested quotes)", () => {
    expect(
      parseTestInput('board = [["o","a"],["e","t"]], words = ["oath","eat"]')
    ).toEqual([[["o", "a"], ["e", "t"]], ["oath", "eat"]]);
  });

  it("parses single var=val — one variable only", () => {
    expect(parseTestInput("prices = [7,1,5,3,6,4]")).toEqual([
      [7, 1, 5, 3, 6, 4],
    ]);
  });

  it("parses var=val with null values inside array", () => {
    expect(parseTestInput("root = [5,1,4,null,null,3,6]")).toEqual([
      [5, 1, 4, null, null, 3, 6],
    ]);
  });

  it("parses var=val with string value", () => {
    expect(parseTestInput('s = "hello", t = "world"')).toEqual([
      "hello",
      "world",
    ]);
  });

  it("parses var=val with boolean", () => {
    expect(parseTestInput("flag = true, count = 3")).toEqual([true, 3]);
  });

  it("parses var=val with negative number", () => {
    expect(parseTestInput("n = -5, k = 2")).toEqual([-5, 2]);
  });

  it("parses var=val multiline (newline-joined)", () => {
    expect(parseTestInput("nums = [1,2,3]\ntarget = 6")).toEqual([
      [1, 2, 3],
      6,
    ]);
  });

  // ─── Format 2: space-separated ────────────────────────────────────────────

  it("parses space-separated array and number", () => {
    expect(parseTestInput("[1,2,5] 11")).toEqual([[1, 2, 5], 11]);
  });

  it("parses space-separated two numbers", () => {
    expect(parseTestInput("3 7")).toEqual([3, 7]);
  });

  it("parses space-separated 1 2", () => {
    expect(parseTestInput("1 2")).toEqual([1, 2]);
  });

  it("parses space-separated string and array", () => {
    expect(parseTestInput('"leetcode" ["leet","code"]')).toEqual([
      "leetcode",
      ["leet", "code"],
    ]);
  });

  it("parses space-separated two arrays", () => {
    expect(parseTestInput("[1,2,3] [4,5,6]")).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  // ─── Format 3: comma-separated ────────────────────────────────────────────

  it("parses comma-separated two strings", () => {
    expect(parseTestInput('"anagram", "nagaram"')).toEqual([
      "anagram",
      "nagaram",
    ]);
  });

  it("parses comma-separated two uppercase strings", () => {
    expect(parseTestInput('"ADOBECODEBANC", "ABC"')).toEqual([
      "ADOBECODEBANC",
      "ABC",
    ]);
  });

  it("parses comma-separated string and number", () => {
    expect(parseTestInput('"ABAB", 2')).toEqual(["ABAB", 2]);
  });

  // ─── Format 4: single value ────────────────────────────────────────────────

  it("parses single array value", () => {
    expect(parseTestInput("[1,2,3,1]")).toEqual([[1, 2, 3, 1]]);
  });

  it("parses single number", () => {
    expect(parseTestInput("2")).toEqual([2]);
  });

  it("parses single quoted string", () => {
    expect(parseTestInput('"()"')).toEqual(["()"]);
  });

  it("parses single large number", () => {
    expect(parseTestInput("43261596")).toEqual([43261596]);
  });

  it("parses single boolean true", () => {
    expect(parseTestInput("true")).toEqual([true]);
  });

  it("parses single null", () => {
    expect(parseTestInput("null")).toEqual([null]);
  });

  // ─── Format 5: null/true/false inside arrays ──────────────────────────────

  it("parses array with null values", () => {
    expect(parseTestInput("[5,1,4,null,null,3,6]")).toEqual([
      [5, 1, 4, null, null, 3, 6],
    ]);
  });

  it("parses Python-style None in var=val", () => {
    expect(parseTestInput("root = [1,None,2]")).toEqual([[1, null, 2]]);
  });

  it("parses Python-style True/False in var=val", () => {
    expect(parseTestInput("a = True, b = False")).toEqual([true, false]);
  });

  // ─── Edge cases ────────────────────────────────────────────────────────────

  it("returns empty array for empty string", () => {
    expect(parseTestInput("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(parseTestInput("   ")).toEqual([]);
  });

  it("parses nested 2D array single value", () => {
    expect(parseTestInput("[[1,2],[3,4]]")).toEqual([[[1, 2], [3, 4]]]);
  });

  it("does not split on = inside an array (var=val with complex rhs)", () => {
    // The value after = is a nested array; commas inside it must not be split
    expect(parseTestInput("grid = [[1,0],[0,1]], n = 2")).toEqual([
      [
        [1, 0],
        [0, 1],
      ],
      2,
    ]);
  });

  it("handles extra spaces around = in var=val", () => {
    expect(parseTestInput("x  =  42")).toEqual([42]);
  });
});
