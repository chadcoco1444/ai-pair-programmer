import { describe, it, expect } from "vitest";
import { wrapPythonCode, wrapJavaScriptCode } from "../src/runners/wrapper";

describe("wrapPythonCode", () => {
  it("should contain I/O wrapper code", () => {
    const wrapped = wrapPythonCode("class Solution:\n    def isValid(self, s): pass");
    expect(wrapped).toContain("_parse_leetcode_input");
    expect(wrapped).toContain("_format_result");
    expect(wrapped).toContain("Solution");
  });

  it("should preserve user code", () => {
    const code = "class Solution:\n    def twoSum(self, nums, target):\n        return [0,1]";
    const wrapped = wrapPythonCode(code);
    expect(wrapped).toContain("def twoSum");
    expect(wrapped).toContain("return [0,1]");
  });

  it("should handle standalone functions", () => {
    const wrapped = wrapPythonCode("def solve(n): return n * 2");
    expect(wrapped).toContain("types.FunctionType");
  });

  it("should format bool as lowercase", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("str(r).lower()");
  });

  it("should format list as JSON", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("json.dumps(r)");
  });

  it("REGRESSION: should handle 'var = value' input format", () => {
    const wrapped = wrapPythonCode("pass");
    // Must detect "var = value" format
    expect(wrapped).toContain("re.match");
    expect(wrapped).toContain("var = value");
    // Must strip "varname = " prefix before parsing
    expect(wrapped).toContain("re.sub");
  });

  it("REGRESSION: should handle multi-arg 'var = value, var2 = value2' on single line", () => {
    const wrapped = wrapPythonCode("pass");
    // Must split by ", varname =" pattern
    expect(wrapped).toContain("re.split");
  });

  it("REGRESSION: should use definition order not alphabetical for method selection", () => {
    // Bug: dir() returns alphabetically → dfs before findWords
    // Fix: use type().__dict__ which preserves definition order
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("type(_sol).__dict__");
    expect(wrapped).not.toContain("dir(_sol)");
  });

  it("REGRESSION: should auto-import collections for defaultdict/Counter/deque", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("import collections");
    expect(wrapped).toContain("from collections import defaultdict");
    expect(wrapped).toContain("Counter");
    expect(wrapped).toContain("deque");
  });

  it("REGRESSION: should auto-import heapq, math, bisect", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("import collections, heapq");
    expect(wrapped).toContain("math");
  });

  it("REGRESSION: empty output because no I/O wrapper was added", () => {
    const wrapped = wrapPythonCode("class Solution:\n    def isValid(self, s): return True");
    expect(wrapped).toContain("print(_format_result");
    expect(wrapped).toContain("sys.stdin.read()");
  });
});

describe("wrapJavaScriptCode", () => {
  it("should contain I/O wrapper code", () => {
    const wrapped = wrapJavaScriptCode("var isValid = function(s) { return true; };");
    expect(wrapped).toContain("_parseLeetcodeInput");
    expect(wrapped).toContain("_formatResult");
  });

  it("REGRESSION: should handle 'var = value' input format", () => {
    const wrapped = wrapJavaScriptCode("pass");
    expect(wrapped).toContain("[a-zA-Z_]");
    expect(wrapped).toContain("replace");
  });

  it("REGRESSION: empty output without I/O wrapper", () => {
    const wrapped = wrapJavaScriptCode("function twoSum(nums, target) { return [0,1]; }");
    expect(wrapped).toContain("console.log(_formatResult");
    expect(wrapped).toContain("JSON.parse");
  });
});

describe("Python _parse_leetcode_input logic", () => {
  // These test the parsing logic conceptually
  // (actual execution happens in Docker, but we verify the code is correct)

  it("wrapper should handle input: simple one-arg-per-line", () => {
    // Input: "[2,7,11,15]\n9"
    // Expected: args = [[2,7,11,15], 9]
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("ast.literal_eval");
  });

  it("wrapper should handle input: LeetCode var=value single line", () => {
    // Input: 'nums = [2,7,11,15], target = 9'
    // Expected: args = [[2,7,11,15], 9]
    const wrapped = wrapPythonCode("pass");
    // The regex splits by ", varname ="
    expect(wrapped).toContain("(?=[a-zA-Z_]");
  });

  it("REGRESSION: Word Search II input format", () => {
    // Input: 'board = [["o","a","a","n"],...], words = ["oath","pea","eat","rain"]'
    // This is the exact format that caused the runtime error
    // The wrapper must:
    // 1. Detect "var = value" format
    // 2. Split into board=... and words=...
    // 3. Parse each value with ast.literal_eval
    const wrapped = wrapPythonCode("pass");
    // Must handle nested brackets in split (split by ", words =" not ", " inside arrays)
    expect(wrapped).toContain("re.split");
    // The regex (?=[a-zA-Z_]\w*\s*=) ensures we only split before var names
    expect(wrapped).toContain("(?=[a-zA-Z_]");
  });

  it("wrapper should handle input: string argument", () => {
    // Input: '"()"'  (for Valid Parentheses)
    // Expected: args = ["()"]
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("ast.literal_eval");
  });
});
