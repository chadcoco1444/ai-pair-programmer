/**
 * Generate I/O wrapper code that reads stdin, calls the user's solution,
 * and prints the result. This bridges LeetCode-style class/function code
 * with the executor's stdin/stdout model.
 *
 * Handles input formats:
 * 1. One argument per line:         "[2,7,11,15]\n9"
 * 2. LeetCode var assignment:       'nums = [2,7], target = 9'
 * 3. Mixed multi-line assignments:  'board = [[...]]\nwords = [...]'
 */

export function wrapPythonCode(userCode: string): string {
  return `# === Auto-imported common modules ===
import collections, heapq, itertools, functools, math, bisect, string
from collections import defaultdict, Counter, deque, OrderedDict
from typing import List, Optional, Tuple, Dict, Set
from functools import lru_cache

${userCode}

# === Auto-generated I/O wrapper ===
import sys, json, ast, re

def _parse_leetcode_input(raw):
    """Parse LeetCode-style input into a list of arguments."""
    raw = raw.strip()
    if not raw:
        return []

    # Check if input uses "var = value" format
    if re.match(r'^[a-zA-Z_]\\w*\\s*=', raw):
        # Join all lines, then split by top-level ", varname ="
        joined = " ".join(raw.split("\\n"))
        # Split by ", varname =" pattern (look for ", word =")
        parts = re.split(r',\\s*(?=[a-zA-Z_]\\w*\\s*=)', joined)
        args = []
        for part in parts:
            # Remove "varname = " prefix
            val = re.sub(r'^[a-zA-Z_]\\w*\\s*=\\s*', '', part.strip())
            try:
                args.append(ast.literal_eval(val))
            except:
                # Try as raw string (strip quotes if present)
                val = val.strip()
                if (val.startswith('"') and val.endswith('"')) or \\
                   (val.startswith("'") and val.endswith("'")):
                    args.append(val[1:-1])
                else:
                    args.append(val)
        return args
    else:
        # One argument per line
        lines = [l.strip() for l in raw.split("\\n") if l.strip()]
        args = []
        for line in lines:
            try:
                args.append(ast.literal_eval(line))
            except:
                args.append(line)
        return args

def _format_result(r):
    if isinstance(r, bool):
        return str(r).lower()
    if isinstance(r, list):
        return json.dumps(r)
    if isinstance(r, str):
        return r
    if r is None:
        return "null"
    return str(r)

if __name__ == "__main__":
    _raw_input = sys.stdin.read()
    _args = _parse_leetcode_input(_raw_input)

    _result = None
    _found = False

    # Try class Solution first
    if "Solution" in dir():
        _sol = Solution()
        # Use __dict__ to preserve definition order (not alphabetical like dir())
        # Pick the first public method defined in the class
        _methods = [k for k, v in type(_sol).__dict__.items()
                    if not k.startswith("_") and callable(v)]
        if _methods:
            _result = getattr(_sol, _methods[0])(*_args)
            _found = True

    # Then try standalone functions
    if not _found:
        import types
        _funcs = [(k, v) for k, v in list(globals().items())
                  if isinstance(v, types.FunctionType) and not k.startswith("_")]
        if _funcs:
            _result = _funcs[-1][1](*_args)
            _found = True

    if _found:
        print(_format_result(_result))
`;
}

export function wrapJavaScriptCode(userCode: string): string {
  return `${userCode}

// === Auto-generated I/O wrapper ===
const _rawInput = require("fs").readFileSync("/dev/stdin", "utf-8").trim();

function _parseLeetcodeInput(raw) {
  if (!raw) return [];
  // Check for "var = value" format
  if (/^[a-zA-Z_]\\w*\\s*=/.test(raw)) {
    const joined = raw.split("\\n").join(" ");
    const parts = joined.split(/,\\s*(?=[a-zA-Z_]\\w*\\s*=)/);
    return parts.map(p => {
      const val = p.replace(/^[a-zA-Z_]\\w*\\s*=\\s*/, "").trim();
      try { return JSON.parse(val); }
      catch { return val; }
    });
  } else {
    return raw.split("\\n").filter(l => l.trim()).map(l => {
      try { return JSON.parse(l.trim()); }
      catch { return l.trim(); }
    });
  }
}

function _formatResult(r) {
  if (typeof r === "boolean") return r ? "true" : "false";
  if (r === null || r === undefined) return "null";
  if (Array.isArray(r) || typeof r === "object") return JSON.stringify(r);
  return String(r);
}

const _args = _parseLeetcodeInput(_rawInput);
let _found = false;

// Try class-based solution
if (typeof Solution !== "undefined") {
  const _sol = new Solution();
  const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))
    .filter(m => m !== "constructor");
  if (_methods.length > 0) {
    console.log(_formatResult(_sol[_methods[0]](..._args)));
    _found = true;
  }
}

if (!_found) {
  const _funcNames = Object.keys(global).filter(k =>
    typeof global[k] === "function" && !k.startsWith("_") &&
    k !== "require" && k !== "_parseLeetcodeInput" && k !== "_formatResult"
  );
  if (_funcNames.length > 0) {
    const _name = _funcNames[_funcNames.length - 1];
    console.log(_formatResult(global[_name](..._args)));
  }
}
`;
}
