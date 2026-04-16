/**
 * Generate I/O wrapper code that reads stdin, calls the user's solution,
 * and prints the result.
 */

export function wrapPythonCode(userCode: string): string {
  return `# === Auto-imported common modules ===
import collections, heapq, itertools, functools, math, bisect, string
from collections import defaultdict, Counter, deque, OrderedDict
from typing import List, Optional, Tuple, Dict, Set
from functools import lru_cache

${userCode}

# === Auto-generated I/O wrapper ===
import sys, json, ast

def _parse_input(raw):
    raw = raw.strip()
    if not raw:
        return []
    # Try to parse as Python expression directly (handles lists, tuples, etc.)
    # Input lines can be: one value per line, or "var = val" per line,
    # or a single line with "var1 = val1, var2 = val2"
    lines = raw.split('\\n')
    # If single line with multiple "var = val", split by top-level commas
    if len(lines) == 1 and '=' in lines[0]:
        raw_line = lines[0].strip()
        # Use bracket-aware splitting
        parts = _split_top_level(raw_line)
        return [_parse_value(p) for p in parts]
    # Multi-line: each line is either "var = val" or just a value
    args = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        args.append(_parse_value(line))
    return args

def _split_top_level(s):
    """Split 'var1 = val1, var2 = val2' by top-level commas between assignments."""
    parts = []
    depth = 0
    current = ''
    in_str = False
    str_char = None
    i = 0
    while i < len(s):
        c = s[i]
        if in_str:
            current += c
            if c == str_char and (i == 0 or s[i-1] != chr(92)):
                in_str = False
        elif c in ('"', "'"):
            in_str = True
            str_char = c
            current += c
        elif c in ('(', '[', '{'):
            depth += 1
            current += c
        elif c in (')', ']', '}'):
            depth -= 1
            current += c
        elif c == ',' and depth == 0:
            # Check if next non-space is a variable name followed by =
            rest = s[i+1:].lstrip()
            import re as _re
            if _re.match(r'^[a-zA-Z_]\\w*\\s*=(?!=)', rest):
                parts.append(current.strip())
                current = ''
                i += 1
                continue
            else:
                current += c
        else:
            current += c
        i += 1
    if current.strip():
        parts.append(current.strip())
    return parts

def _parse_value(s):
    """Parse 'var = value' or just 'value'."""
    s = s.strip()
    # Strip "varname = " prefix if present
    import re as _re
    m = _re.match(r'^[a-zA-Z_]\\w*\\s*=\\s*', s)
    if m:
        s = s[m.end():]
    try:
        return ast.literal_eval(s)
    except:
        # Return as string
        return s

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
    _raw = sys.stdin.read()
    _args = _parse_input(_raw)

    _result = None
    _found = False

    # Try class Solution first
    if "Solution" in dir():
        _sol = Solution()
        _methods = [k for k, v in type(_sol).__dict__.items()
                    if not k.startswith("_") and callable(v)]
        if _methods:
            _result = getattr(_sol, _methods[0])(*_args)
            _found = True

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

function _parseInput(raw) {
  if (!raw) return [];
  const lines = raw.split("\\n");
  if (lines.length === 1 && lines[0].includes("=")) {
    // Single line with "var1 = val1, var2 = val2"
    return _splitTopLevel(lines[0]).map(_parseValue);
  }
  return lines.filter(l => l.trim()).map(l => _parseValue(l.trim()));
}

function _splitTopLevel(s) {
  const parts = [];
  let depth = 0, current = "", inStr = false, strChar = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      current += c;
      if (c === strChar && s[i-1] !== "\\\\") inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true; strChar = c; current += c;
    } else if ("([{".includes(c)) { depth++; current += c; }
    else if (")]}".includes(c)) { depth--; current += c; }
    else if (c === "," && depth === 0) {
      const rest = s.slice(i+1).trimStart();
      if (/^[a-zA-Z_]\\w*\\s*=(?!=)/.test(rest)) {
        parts.push(current.trim());
        current = "";
        continue;
      } else { current += c; }
    } else { current += c; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function _parseValue(s) {
  s = s.trim().replace(/^[a-zA-Z_]\\w*\\s*=\\s*/, "");
  try { return JSON.parse(s); }
  catch { return s; }
}

function _formatResult(r) {
  if (typeof r === "boolean") return r ? "true" : "false";
  if (r === null || r === undefined) return "null";
  if (Array.isArray(r) || typeof r === "object") return JSON.stringify(r);
  return String(r);
}

const _args = _parseInput(_rawInput);
let _found = false;

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
    k !== "require" && k !== "_parseInput" && k !== "_splitTopLevel" &&
    k !== "_parseValue" && k !== "_formatResult"
  );
  if (_funcNames.length > 0) {
    console.log(_formatResult(global[_funcNames[_funcNames.length - 1]](..._args)));
  }
}
`;
}
