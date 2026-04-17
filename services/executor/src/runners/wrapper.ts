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

# === Common data structures (TreeNode, ListNode) ===
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def _build_tree(values):
    """Build binary tree from level-order list like [3,9,20,None,None,15,7]"""
    if not values or values[0] is None:
        return None
    from collections import deque as _dq
    root = TreeNode(values[0])
    queue = _dq([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root

def _build_list(values):
    """Build linked list from array like [1,2,3,4,5]"""
    dummy = ListNode(0)
    curr = dummy
    for v in values:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def _list_to_array(head):
    """Convert linked list to array"""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

def _tree_to_array(root):
    """Convert binary tree to level-order array"""
    if not root:
        return []
    from collections import deque as _dq
    result = []
    queue = _dq([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

${userCode}

# === Auto-generated I/O wrapper ===
import sys, json, ast, inspect

def _parse_input(raw):
    raw = raw.strip()
    if not raw:
        return []
    # Try to parse as Python expression directly (handles lists, tuples, etc.)
    # Input lines can be: one value per line, or "var = val" per line,
    # or a single line with "var1 = val1, var2 = val2"
    lines = raw.splitlines()
    # If single line with multiple "var = val", split by top-level commas
    if len(lines) == 1 and _looks_like_assignment(lines[0].strip()):
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

def _looks_like_assignment(s):
    """Check if string starts with 'varname = ' (without regex to avoid escaping issues)."""
    j = 0
    # Skip identifier: [a-zA-Z_][a-zA-Z0-9_]*
    if j < len(s) and (s[j].isalpha() or s[j] == '_'):
        j += 1
        while j < len(s) and (s[j].isalnum() or s[j] == '_'):
            j += 1
    else:
        return False
    # Skip spaces
    while j < len(s) and s[j] == ' ':
        j += 1
    # Must have = but not ==
    if j < len(s) and s[j] == '=':
        if j + 1 < len(s) and s[j+1] == '=':
            return False
        return True
    return False

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
            if _looks_like_assignment(rest):
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
    if _looks_like_assignment(s):
        eq_pos = s.index('=')
        s = s[eq_pos+1:].strip()
    # Replace JSON null/true/false with Python equivalents
    s_py = s.replace('null', 'None').replace('true', 'True').replace('false', 'False')
    try:
        return ast.literal_eval(s_py)
    except:
        pass
    try:
        return ast.literal_eval(s)
    except:
        return s

def _convert_args(method, args):
    """Auto-convert args based on type hints (TreeNode, ListNode, etc.)."""
    hints = {}
    try:
        hints = inspect.get_annotations(method)
    except:
        pass

    params = list(inspect.signature(method).parameters.keys())
    # Skip 'self' for bound methods
    if params and params[0] == 'self':
        params = params[1:]

    converted = list(args)
    for i, param in enumerate(params):
        if i >= len(converted):
            break
        hint = hints.get(param, None)
        hint_str = str(hint) if hint else ''

        # Convert list → TreeNode if type hint says Optional[TreeNode] or TreeNode
        if ('TreeNode' in hint_str or 'treenode' in hint_str.lower()) and isinstance(converted[i], list):
            # Replace None strings with actual None
            vals = [None if v is None or v == 'null' else v for v in converted[i]]
            converted[i] = _build_tree(vals)

        # Convert list → ListNode if type hint says Optional[ListNode] or ListNode
        elif ('ListNode' in hint_str or 'listnode' in hint_str.lower()) and isinstance(converted[i], list):
            converted[i] = _build_list(converted[i])

    return converted

def _format_result(r):
    if isinstance(r, bool):
        return str(r).lower()
    if isinstance(r, list):
        return json.dumps(r)
    if isinstance(r, str):
        return r
    if r is None:
        return "null"
    # Convert TreeNode result to list
    if isinstance(r, TreeNode):
        return json.dumps(_tree_to_array(r))
    # Convert ListNode result to list
    if isinstance(r, ListNode):
        return json.dumps(_list_to_array(r))
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
            _method = getattr(_sol, _methods[0])
            _converted = _convert_args(_method, _args)
            _result = _method(*_converted)
            _found = True

    if not _found:
        import types as _types
        _funcs = [(k, v) for k, v in list(globals().items())
                  if isinstance(v, _types.FunctionType) and not k.startswith("_")]
        if _funcs:
            _func = _funcs[-1][1]
            _converted = _convert_args(_func, _args)
            _result = _func(*_converted)
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
