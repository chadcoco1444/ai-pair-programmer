/**
 * Generate I/O wrapper code that reads JSON stdin, calls the user's solution,
 * and prints the result.
 *
 * stdin is a JSON array pre-parsed by TypeScript, e.g. [[2,7,11,15], 9]
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
import sys, json, inspect

def _convert_args(method, args):
    """Auto-convert args based on type hints (TreeNode, ListNode, etc.)."""
    hints = {}
    try:
        hints = inspect.get_annotations(method)
    except Exception:
        pass

    params = list(inspect.signature(method).parameters.keys())
    if params and params[0] == 'self':
        params = params[1:]

    converted = list(args)
    for i, param in enumerate(params):
        if i >= len(converted):
            break
        hint = hints.get(param, None)
        hint_str = str(hint) if hint else ''

        if ('TreeNode' in hint_str or 'treenode' in hint_str.lower()) and isinstance(converted[i], list):
            vals = [None if v is None or v == 'null' else v for v in converted[i]]
            converted[i] = _build_tree(vals)
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
    if isinstance(r, TreeNode):
        return json.dumps(_tree_to_array(r))
    if isinstance(r, ListNode):
        return json.dumps(_list_to_array(r))
    return str(r)

if __name__ == "__main__":
    _args = json.loads(sys.stdin.read())

    if "Solution" in dir():
        _sol = Solution()
        _methods = [k for k, v in type(_sol).__dict__.items()
                    if not k.startswith("_") and callable(v)]
        if _methods:
            _method = getattr(_sol, _methods[0])
            _converted = _convert_args(_method, _args)
            print(_format_result(_method(*_converted)))
`;
}

export function wrapJavaScriptCode(userCode: string): string {
  return `${userCode}

// === Auto-generated I/O wrapper ===
const _stdin = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
const _args = JSON.parse(_stdin);

function _formatResult(r) {
  if (typeof r === "boolean") return r ? "true" : "false";
  if (r === null || r === undefined) return "null";
  if (Array.isArray(r) || typeof r === "object") return JSON.stringify(r);
  return String(r);
}

if (typeof Solution !== "undefined") {
  const _sol = new Solution();
  const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))
    .filter(m => m !== "constructor");
  if (_methods.length > 0) {
    console.log(_formatResult(_sol[_methods[0]](..._args)));
  }
}
`;
}
