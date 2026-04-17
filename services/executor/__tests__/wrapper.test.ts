import { describe, it, expect } from "vitest";
import { wrapPythonCode, wrapJavaScriptCode } from "../src/runners/wrapper";

describe("wrapPythonCode", () => {
  it("should contain I/O wrapper and auto-imports", () => {
    const wrapped = wrapPythonCode("class Solution:\n    def isValid(self, s): pass");
    expect(wrapped).toContain("import collections");
    expect(wrapped).toContain("from collections import defaultdict");
    expect(wrapped).toContain("_format_result");
    expect(wrapped).toContain("class Solution:");
  });

  it("should preserve user code", () => {
    const code = "class Solution:\n    def twoSum(self, nums, target):\n        return [0,1]";
    const wrapped = wrapPythonCode(code);
    expect(wrapped).toContain("def twoSum");
  });

  it("should use definition order for method selection (not alphabetical)", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("type(_sol).__dict__");
  });

  it("should format bool as lowercase, list as JSON", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("str(r).lower()");
    expect(wrapped).toContain("json.dumps(r)");
  });

  it("should read JSON from stdin (not free-form text)", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("json.loads(sys.stdin.read())");
    expect(wrapped).not.toContain("_parse_input");
    expect(wrapped).not.toContain("_split_top_level");
    expect(wrapped).not.toContain("_looks_like_assignment");
  });

  it("should contain TreeNode and ListNode classes", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("class TreeNode");
    expect(wrapped).toContain("class ListNode");
    expect(wrapped).toContain("_build_tree");
    expect(wrapped).toContain("_build_list");
  });

  it("REGRESSION: should auto-import collections for defaultdict/Counter/deque", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("import collections");
    expect(wrapped).toContain("from collections import defaultdict");
  });

  it("REGRESSION: empty output because no I/O wrapper was added", () => {
    const wrapped = wrapPythonCode("class Solution:\n    def isValid(self, s): return True");
    expect(wrapped).toContain("print(_format_result");
    expect(wrapped).toContain("sys.stdin.read()");
  });

  it("REGRESSION: should use definition order not alphabetical for method selection", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("type(_sol).__dict__");
    expect(wrapped).not.toContain("dir(_sol)");
  });
});

describe("wrapJavaScriptCode", () => {
  it("should contain I/O wrapper", () => {
    const wrapped = wrapJavaScriptCode("function solve() {}");
    expect(wrapped).toContain("_formatResult");
    expect(wrapped).toContain("JSON.parse");
  });

  it("should read JSON from stdin (not free-form text)", () => {
    const wrapped = wrapJavaScriptCode("pass");
    expect(wrapped).toContain("JSON.parse");
    expect(wrapped).not.toContain("_parseInput");
    expect(wrapped).not.toContain("_splitTopLevel");
  });

  it("REGRESSION: empty output without I/O wrapper", () => {
    const wrapped = wrapJavaScriptCode("function twoSum(nums, target) { return [0,1]; }");
    expect(wrapped).toContain("console.log(_formatResult");
  });
});
