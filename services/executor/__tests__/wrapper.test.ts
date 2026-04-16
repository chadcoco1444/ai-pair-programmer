import { describe, it, expect } from "vitest";
import { wrapPythonCode, wrapJavaScriptCode } from "../src/runners/wrapper";

describe("wrapPythonCode", () => {
  it("should append wrapper to class Solution code", () => {
    const code = `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping.values():
                stack.append(char)
            elif char in mapping.keys():
                if not stack or mapping[char] != stack.pop():
                    return False
        return not stack`;

    const wrapped = wrapPythonCode(code);

    // Original code preserved
    expect(wrapped).toContain("class Solution:");
    expect(wrapped).toContain("def isValid");

    // Wrapper added
    expect(wrapped).toContain("if __name__");
    expect(wrapped).toContain("_sol = Solution()");
    expect(wrapped).toContain("_format_result");
  });

  it("should append wrapper to standalone function code", () => {
    const code = `def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        if target - num in lookup:
            return [lookup[target - num], i]
        lookup[num] = i`;

    const wrapped = wrapPythonCode(code);
    expect(wrapped).toContain("def two_sum");
    expect(wrapped).toContain("types.FunctionType");
  });

  it("REGRESSION: empty output because no I/O wrapper was added", () => {
    const code = `class Solution:
    def isValid(self, s: str) -> bool:
        return True`;

    const wrapped = wrapPythonCode(code);

    // Must have wrapper that calls the solution and prints
    expect(wrapped).toContain('print(_format_result');
    // Must parse stdin
    expect(wrapped).toContain('sys.stdin.read()');
    // Must handle bool → "true"/"false"
    expect(wrapped).toContain('str(r).lower()');
  });

  it("should format bool as lowercase true/false", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("isinstance(r, bool)");
    expect(wrapped).toContain("str(r).lower()");
  });

  it("should format list as JSON", () => {
    const wrapped = wrapPythonCode("pass");
    expect(wrapped).toContain("json.dumps(r)");
  });
});

describe("wrapJavaScriptCode", () => {
  it("should append wrapper to class-based code", () => {
    const code = `var isValid = function(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const c of s) {
        if ('({['.includes(c)) stack.push(c);
        else if (stack.pop() !== map[c]) return false;
    }
    return stack.length === 0;
};`;

    const wrapped = wrapJavaScriptCode(code);
    expect(wrapped).toContain("var isValid");
    expect(wrapped).toContain("_formatResult");
    expect(wrapped).toContain("readFileSync");
  });

  it("REGRESSION: empty output without I/O wrapper", () => {
    const wrapped = wrapJavaScriptCode("function twoSum(nums, target) { return [0,1]; }");
    expect(wrapped).toContain("console.log(_formatResult");
    expect(wrapped).toContain("JSON.parse");
  });
});
