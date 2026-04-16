/**
 * Generate I/O wrapper code that reads stdin, calls the user's solution,
 * and prints the result. This bridges LeetCode-style class/function code
 * with the executor's stdin/stdout model.
 */

export function wrapPythonCode(userCode: string): string {
  return `${userCode}

# === Auto-generated I/O wrapper ===
import sys, json, ast

def _parse_arg(s):
    s = s.strip()
    if not s:
        return None
    try:
        return ast.literal_eval(s)
    except:
        return s

def _format_result(r):
    if isinstance(r, bool):
        return str(r).lower()
    if isinstance(r, list):
        return json.dumps(r)
    if r is None:
        return "null"
    return str(r)

if __name__ == "__main__":
    _input = sys.stdin.read().strip()
    _lines = [l for l in _input.split("\\n") if l.strip()]
    _args = [_parse_arg(l) for l in _lines if _parse_arg(l) is not None]

    # Try class Solution first, then standalone function
    if "Solution" in dir():
        _sol = Solution()
        _methods = [m for m in dir(_sol) if not m.startswith("_") and callable(getattr(_sol, m))]
        if _methods:
            _result = getattr(_sol, _methods[0])(*_args)
            print(_format_result(_result))
    else:
        # Find first defined function
        import types
        _funcs = [v for k, v in globals().items() if isinstance(v, types.FunctionType) and not k.startswith("_")]
        if _funcs:
            _result = _funcs[-1](*_args)
            print(_format_result(_result))
`;
}

export function wrapJavaScriptCode(userCode: string): string {
  return `${userCode}

// === Auto-generated I/O wrapper ===
const _input = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
const _lines = _input.split("\\n").filter(l => l.trim());
const _args = _lines.map(l => {
  try { return JSON.parse(l.trim()); }
  catch { return l.trim(); }
});

function _formatResult(r) {
  if (typeof r === "boolean") return r ? "true" : "false";
  if (r === null || r === undefined) return "null";
  if (Array.isArray(r) || typeof r === "object") return JSON.stringify(r);
  return String(r);
}

// Try class-based solution
if (typeof Solution !== "undefined") {
  const _sol = new Solution();
  const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))
    .filter(m => m !== "constructor");
  if (_methods.length > 0) {
    console.log(_formatResult(_sol[_methods[0]](..._args)));
  }
} else {
  // Find last defined function (skip wrapper helpers)
  const _funcNames = Object.keys(global).filter(k =>
    typeof global[k] === "function" && !k.startsWith("_") && k !== "require"
  );
  // Try common names
  const _candidates = ["twoSum", "isValid", "maxProfit", "search", "merge",
    "findWords", "maxArea", "threeSum", "containsDuplicate", "maxSubArray",
    "maxProduct", "findMin", "productExceptSelf"];
  const _name = _candidates.find(n => typeof global[n] === "function")
    || _funcNames[_funcNames.length - 1];
  if (_name && typeof global[_name] === "function") {
    console.log(_formatResult(global[_name](..._args)));
  }
}
`;
}
