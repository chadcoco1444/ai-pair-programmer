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

def _build_list_with_cycle(values, pos):
    """Build linked list with optional cycle. pos=-1 means no cycle."""
    if not values:
        return None
    nodes = [ListNode(v) for v in values]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]

def _build_graph(adj_list):
    """Build graph from adjacency list (1-indexed values). Uses Node class if defined."""
    if not adj_list:
        return None
    _NodeCls = globals().get('Node')
    if _NodeCls is None:
        class _NodeCls:
            def __init__(self, val=0, neighbors=None):
                self.val = val
                self.neighbors = neighbors if neighbors is not None else []
    nodes = [_NodeCls(i + 1) for i in range(len(adj_list))]
    for i, neighbors in enumerate(adj_list):
        for j in neighbors:
            nodes[i].neighbors.append(nodes[j - 1])
    return nodes[0]

def _graph_to_adj_list(node):
    """Convert graph back to adjacency list."""
    if not node:
        return []
    from collections import deque as _dq
    visited = {}
    queue = _dq([node])
    visited[node] = True
    result = {}
    while queue:
        n = queue.popleft()
        result[n.val] = sorted([nb.val for nb in n.neighbors])
        for nb in n.neighbors:
            if nb not in visited:
                visited[nb] = True
                queue.append(nb)
    return [result[i] for i in sorted(result.keys())]

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

def _find_node(root, val):
    """Find a TreeNode by value via BFS."""
    if not root:
        return TreeNode(val)
    from collections import deque as _dq
    q = _dq([root])
    while q:
        node = q.popleft()
        if node.val == val:
            return node
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    return TreeNode(val)

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
    _tree_root = None  # Cache for finding nodes by value
    for i, param in enumerate(params):
        if i >= len(converted):
            break
        hint = hints.get(param, None)
        hint_str = str(hint) if hint else ''

        _is_collection = 'list[' in hint_str.lower() or 'List[' in hint_str
        if 'TreeNode' in hint_str or 'treenode' in hint_str.lower():
            if isinstance(converted[i], list):
                if _is_collection:
                    # List[TreeNode]: convert each element
                    converted[i] = [_build_tree(v) if isinstance(v, list) else v for v in converted[i]]
                else:
                    vals = [None if v is None or v == 'null' else v for v in converted[i]]
                    converted[i] = _build_tree(vals)
                    if _tree_root is None:
                        _tree_root = converted[i]
            elif isinstance(converted[i], (int, float)):
                # TreeNode hint but got int → find node in tree or wrap as TreeNode
                if _tree_root:
                    converted[i] = _find_node(_tree_root, converted[i])
                else:
                    converted[i] = TreeNode(converted[i])
        elif 'ListNode' in hint_str or 'listnode' in hint_str.lower():
            if isinstance(converted[i], list):
                if _is_collection:
                    # List[ListNode]: convert each inner list
                    converted[i] = [_build_list(v) if isinstance(v, list) else v for v in converted[i]]
                else:
                    # Check if there's an extra arg beyond method params that could be 'pos' (linked-list-cycle pattern)
                    _extra_idx = len(params)  # index of first extra arg
                    if _extra_idx < len(converted) and isinstance(converted[_extra_idx], int):
                        converted[i] = _build_list_with_cycle(converted[i], converted[_extra_idx])
                        converted[_extra_idx] = '__consumed__'
                    else:
                        converted[i] = _build_list(converted[i])
        elif hint_str and ("Node" in hint_str or "'Node'" in hint_str) and 'TreeNode' not in hint_str and 'ListNode' not in hint_str:
            # Graph Node (clone-graph style)
            if isinstance(converted[i], list):
                converted[i] = _build_graph(converted[i])

    # Remove consumed args (e.g. 'pos' for linked-list-cycle)
    converted = [a for a in converted if a != '__consumed__']
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
    if hasattr(r, 'val') and hasattr(r, 'neighbors'):
        return json.dumps(_graph_to_adj_list(r))
    return str(r)

def _run_multi_op(ops, args):
    """Execute multi-operation mode: instantiate class, call methods, collect results."""
    # Find the class by name (first op)
    cls_name = ops[0]
    cls = globals().get(cls_name)
    if cls is None:
        raise RuntimeError(f"Class {cls_name!r} not found")
    instance = cls(*args[0])
    results = [None]  # constructor always returns null
    for i in range(1, len(ops)):
        method = getattr(instance, ops[i])
        method_args = args[i] if i < len(args) else []
        converted = _convert_args(method, method_args)
        r = method(*converted)
        results.append(r)
    return results

def _format_multi_op_result(results):
    """Format multi-op results as a JSON array."""
    formatted = []
    for r in results:
        if r is None:
            formatted.append(None)
        elif isinstance(r, bool):
            formatted.append(r)
        elif isinstance(r, TreeNode):
            formatted.append(_tree_to_array(r))
        elif isinstance(r, ListNode):
            formatted.append(_list_to_array(r))
        elif hasattr(r, 'val') and hasattr(r, 'neighbors'):
            formatted.append(_graph_to_adj_list(r))
        else:
            formatted.append(r)
    return json.dumps(formatted)

if __name__ == "__main__":
    _args = json.loads(sys.stdin.read())

    # Multi-op mode: _args = [{ "__multiOp": true, "ops": [...], "args": [...] }]
    if (len(_args) == 1 and isinstance(_args[0], dict) and _args[0].get("__multiOp")):
        _multi = _args[0]
        _results = _run_multi_op(_multi["ops"], _multi["args"])
        print(_format_multi_op_result(_results))
    elif "Solution" in dir():
        _sol = Solution()
        _methods = [k for k, v in type(_sol).__dict__.items()
                    if not k.startswith("_") and callable(v)]
        # Check for roundtrip pattern (encode/decode)
        if hasattr(_sol, 'encode') and hasattr(_sol, 'decode') and 'encode' in _methods and 'decode' in _methods:
            _encoded = _sol.encode(_args[0] if _args else [])
            _result = _sol.decode(_encoded)
            print(_format_result(_result))
        elif hasattr(_sol, 'serialize') and hasattr(_sol, 'deserialize') and 'serialize' in _methods and 'deserialize' in _methods:
            _tree = _build_tree(_args[0]) if _args and isinstance(_args[0], list) else None
            _serialized = _sol.serialize(_tree)
            _deserialized = _sol.deserialize(_serialized)
            _result = _tree_to_array(_deserialized) if _deserialized else []
            print(_format_result(_result))
        elif _methods:
            _method = getattr(_sol, _methods[0])
            _converted = _convert_args(_method, _args)
            _result = _method(*_converted)
            _ret_hint = str(inspect.get_annotations(_method).get('return', ''))
            if _result is None and _converted:
                # In-place mutation: -> None means modify first arg and return it
                if _ret_hint == "<class 'NoneType'>" or _ret_hint == 'None':
                    _result = _converted[0]
                # Tree-returning method with empty tree: None → []
                elif 'TreeNode' in _ret_hint:
                    _result = []
                # ListNode-returning method with empty list: None → []
                elif 'ListNode' in _ret_hint:
                    _result = []
                # Graph Node-returning method with empty graph: None → []
                elif 'Node' in _ret_hint and 'TreeNode' not in _ret_hint and 'ListNode' not in _ret_hint:
                    _result = []
            print(_format_result(_result))
    elif "Codec" in dir():
        _codec = Codec()
        if hasattr(_codec, 'encode') and hasattr(_codec, 'decode'):
            _encoded = _codec.encode(_args[0] if _args else [])
            _result = _codec.decode(_encoded)
            print(_format_result(_result))
        elif hasattr(_codec, 'serialize') and hasattr(_codec, 'deserialize'):
            _tree = _build_tree(_args[0]) if _args and isinstance(_args[0], list) else None
            _serialized = _codec.serialize(_tree)
            _deserialized = _codec.deserialize(_serialized)
            _result = _tree_to_array(_deserialized) if _deserialized else []
            print(_format_result(_result))
`;
}

export function wrapJavaScriptCode(userCode: string): string {
  // Detect standalone function name from user code (for non-class solutions)
  let standaloneFn = "";
  if (!/class\s+Solution\b/.test(userCode) && !/class\s+Codec\b/.test(userCode)) {
    // Match: var/let/const name = function, or function name(
    const fnMatch = userCode.match(
      /(?:var|let|const)\s+(\w+)\s*=\s*function|function\s+(\w+)\s*\(/
    );
    if (fnMatch) {
      standaloneFn = fnMatch[1] || fnMatch[2];
    }
  }

  return `// === Common data structures ===
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

class Node {
  constructor(val = 0, neighbors = []) {
    this.val = val;
    this.neighbors = [...neighbors];
  }
}

function _buildTree(values) {
  if (!values || values.length === 0 || values[0] == null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;
  while (queue.length > 0 && i < values.length) {
    const node = queue.shift();
    if (i < values.length && values[i] != null) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] != null) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function _buildList(values) {
  const dummy = new ListNode(0);
  let curr = dummy;
  for (const v of values) {
    curr.next = new ListNode(v);
    curr = curr.next;
  }
  return dummy.next;
}

function _buildListWithCycle(values, pos) {
  if (!values || values.length === 0) return null;
  const nodes = values.map(v => new ListNode(v));
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }
  if (pos >= 0) {
    nodes[nodes.length - 1].next = nodes[pos];
  }
  return nodes[0];
}

function _treeToArray(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}

function _listToArray(head) {
  const result = [];
  const seen = new Set();
  while (head) {
    if (seen.has(head)) break;
    seen.add(head);
    result.push(head.val);
    head = head.next;
  }
  return result;
}

function _buildGraph(adjList) {
  if (!adjList || adjList.length === 0) return null;
  const nodes = [];
  for (let i = 0; i < adjList.length; i++) {
    nodes.push(new Node(i + 1));
  }
  for (let i = 0; i < adjList.length; i++) {
    for (const j of adjList[i]) {
      nodes[i].neighbors.push(nodes[j - 1]);
    }
  }
  return nodes[0];
}

function _graphToAdjList(node) {
  if (!node) return [];
  const visited = new Map();
  const queue = [node];
  visited.set(node, true);
  const result = {};
  while (queue.length > 0) {
    const n = queue.shift();
    result[n.val] = n.neighbors.map(nb => nb.val).sort((a, b) => a - b);
    for (const nb of n.neighbors) {
      if (!visited.has(nb)) {
        visited.set(nb, true);
        queue.push(nb);
      }
    }
  }
  const keys = Object.keys(result).map(Number).sort((a, b) => a - b);
  return keys.map(k => result[k]);
}

function _findNode(root, val) {
  if (!root) return new TreeNode(val);
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node.val === val) return node;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return new TreeNode(val);
}

function _getParamNames(fn) {
  const s = fn.toString();
  const m = s.match(/^[^(]*\\(([^)]*)\\)/);
  if (!m) return [];
  return m[1].split(',').map(p => p.trim().replace(/=.*$/, '').replace(/\\.\\.\\./, '')).filter(Boolean);
}

function _convertArgs(method, args, paramNames) {
  if (!paramNames) paramNames = _getParamNames(method);
  const converted = [...args];
  let treeRoot = null;
  for (let i = 0; i < paramNames.length && i < converted.length; i++) {
    const name = paramNames[i].toLowerCase();
    if (['root', 'tree'].includes(name) && Array.isArray(converted[i])) {
      converted[i] = _buildTree(converted[i]);
      if (!treeRoot) treeRoot = converted[i];
    } else if (['p', 'q'].includes(name) && Array.isArray(converted[i])) {
      converted[i] = _buildTree(converted[i]);
      if (!treeRoot) treeRoot = converted[i];
    } else if (['p', 'q'].includes(name) && typeof converted[i] === 'number' && treeRoot) {
      converted[i] = _findNode(treeRoot, converted[i]);
    } else if (['head', 'list', 'list1', 'list2', 'l1', 'l2'].includes(name) && Array.isArray(converted[i])) {
      // Check for cycle pattern: extra arg beyond param count
      const extraIdx = paramNames.length;
      if (name === 'head' && extraIdx < converted.length && typeof converted[extraIdx] === 'number') {
        converted[i] = _buildListWithCycle(converted[i], converted[extraIdx]);
        converted[extraIdx] = '__consumed__';
      } else {
        converted[i] = _buildList(converted[i]);
      }
    } else if (name === 'lists' && Array.isArray(converted[i])) {
      converted[i] = converted[i].map(v => Array.isArray(v) ? _buildList(v) : v);
    } else if (['node', 'adjlist', 'graph'].includes(name) && Array.isArray(converted[i]) && converted[i].length > 0 && Array.isArray(converted[i][0])) {
      converted[i] = _buildGraph(converted[i]);
    }
  }
  return converted.filter(a => a !== '__consumed__');
}

function _formatResult(r) {
  if (typeof r === 'boolean') return r ? 'true' : 'false';
  if (r === null || r === undefined) return 'null';
  if (r instanceof TreeNode) return JSON.stringify(_treeToArray(r));
  if (r instanceof ListNode) return JSON.stringify(_listToArray(r));
  if (r instanceof Node && r.neighbors !== undefined) return JSON.stringify(_graphToAdjList(r));
  if (Array.isArray(r) || typeof r === 'object') return JSON.stringify(r);
  return String(r);
}

function _formatMultiOpResult(results) {
  const formatted = results.map(r => {
    if (r === null || r === undefined) return null;
    if (r instanceof TreeNode) return _treeToArray(r);
    if (r instanceof ListNode) return _listToArray(r);
    if (r instanceof Node && r.neighbors !== undefined) return _graphToAdjList(r);
    return r;
  });
  return JSON.stringify(formatted);
}

// In-place mutation detection: method name patterns that modify first arg
const _IN_PLACE_NAMES = /^(rotate|setZeroes|reorderList|sortColors|moveZeroes|reverseString|merge|flatten|connect|recoverTree|deleteNode|sortList|reverseList|reverse|sort|shuffle|swap|flip|invert)/i;

// === User code ===
\${userCode}

// === Auto-generated I/O wrapper ===
const _args = JSON.parse(require("fs").readFileSync("/tmp/args.json", "utf-8"));

// Multi-op mode
if (_args.length === 1 && _args[0] && typeof _args[0] === 'object' && !Array.isArray(_args[0]) && _args[0].__multiOp) {
  const _multi = _args[0];
  const _ops = _multi.ops;
  const _opArgs = _multi.args;
  const _Cls = eval(_ops[0]);
  const _instance = new _Cls(...(_opArgs[0] || []));
  const _results = [null];
  for (let _i = 1; _i < _ops.length; _i++) {
    const _method = _instance[_ops[_i]].bind(_instance);
    const _methodArgs = _opArgs[_i] || [];
    const _paramNames = _getParamNames(_method);
    const _converted = _convertArgs(_method, _methodArgs, _paramNames);
    let _r = _method(..._converted);
    if (_r === undefined) _r = null;
    _results.push(_r);
  }
  console.log(_formatMultiOpResult(_results));
} else if (typeof Codec !== 'undefined') {
  // Codec roundtrip mode
  const _codec = new Codec();
  if (typeof _codec.encode === 'function' && typeof _codec.decode === 'function') {
    const _encoded = _codec.encode(_args[0] != null ? _args[0] : []);
    const _decoded = _codec.decode(_encoded);
    console.log(_formatResult(_decoded));
  } else if (typeof _codec.serialize === 'function' && typeof _codec.deserialize === 'function') {
    const _tree = Array.isArray(_args[0]) ? _buildTree(_args[0]) : null;
    const _serialized = _codec.serialize(_tree);
    const _deserialized = _codec.deserialize(_serialized);
    const _r = _deserialized ? _treeToArray(_deserialized) : [];
    console.log(_formatResult(_r));
  }
} else if (typeof Solution !== 'undefined') {
  const _sol = new Solution();
  const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))
    .filter(m => m !== 'constructor');

  // Check for roundtrip pattern (encode/decode or serialize/deserialize)
  if (typeof _sol.encode === 'function' && typeof _sol.decode === 'function' && _methods.includes('encode') && _methods.includes('decode')) {
    const _encoded = _sol.encode(_args[0] != null ? _args[0] : []);
    const _decoded = _sol.decode(_encoded);
    console.log(_formatResult(_decoded));
  } else if (typeof _sol.serialize === 'function' && typeof _sol.deserialize === 'function' && _methods.includes('serialize') && _methods.includes('deserialize')) {
    const _tree = Array.isArray(_args[0]) ? _buildTree(_args[0]) : null;
    const _serialized = _sol.serialize(_tree);
    const _deserialized = _sol.deserialize(_serialized);
    const _r = _deserialized ? _treeToArray(_deserialized) : [];
    console.log(_formatResult(_r));
  } else if (_methods.length > 0) {
    const _methodName = _methods[0];
    const _method = _sol[_methodName].bind(_sol);
    const _paramNames = _getParamNames(_method);
    const _converted = _convertArgs(_method, _args, _paramNames);
    let _result = _method(..._converted);

    // In-place mutation handling
    if (_result === undefined && _converted.length > 0) {
      if (_IN_PLACE_NAMES.test(_methodName)) {
        _result = _converted[0];
      }
    }

    // Convert data structures back to arrays for output
    if (_result === undefined || _result === null) {
      console.log('null');
    } else {
      console.log(_formatResult(_result));
    }
  }
}${standaloneFn ? ` else if (typeof ${standaloneFn} === 'function') {
  const _fn = ${standaloneFn};
  const _paramNames = _getParamNames(_fn);
  const _converted = _convertArgs(_fn, _args, _paramNames);
  let _result = _fn(..._converted);
  if (_result === undefined) _result = null;
  console.log(_formatResult(_result));
}` : ""}
`;
}
