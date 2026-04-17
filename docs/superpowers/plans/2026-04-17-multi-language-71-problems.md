# Multi-Language 71 Problems E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All 71 Blind 75 problems pass E2E tests in Python (0 skip), JavaScript, C++, and C — with full automated test reports for each language.

**Architecture:** 
- Phase 1: Fix 6 Python skips via multi-op wrapper mode + special data structure construction
- Phase 2: Enhance JS wrapper (TreeNode/ListNode) + write 71 JS solutions + JS E2E script
- Phase 3: Create C++ wrapper (JSON parsing) + write 71 C++ solutions + C++ E2E script  
- Phase 4: Create C wrapper + write 71 C solutions + C E2E script

**Tech Stack:** TypeScript (wrapper generation), Python, JavaScript, C++, C, Vitest, Docker

---

## File Structure

```
services/executor/src/runners/
├── wrapper.ts                    # MODIFY: add multi-op mode (Python + JS), TreeNode/ListNode for JS, C/C++ wrappers
├── python.ts                     # MINOR: no changes needed
├── javascript.ts                 # MINOR: no changes needed
├── c.ts                          # MODIFY: use base64 args like Python/JS
├── cpp.ts                        # MODIFY: use base64 args like Python/JS
tests/
├── e2e_executor_test.py          # MODIFY: remove SKIP_SLUGS, add multi-op test case handling
├── e2e_executor_js.py            # CREATE: JS E2E test — all 71 problems
├── e2e_executor_cpp.py           # CREATE: C++ E2E test — all 71 problems
├── e2e_executor_c.py             # CREATE: C E2E test — all 71 problems
├── solutions/                    # EXISTING: 71 Python solutions
├── solutions_js/                 # CREATE: 71 JavaScript solutions
├── solutions_cpp/                # CREATE: 71 C++ solutions
├── solutions_c/                  # CREATE: 71 C solutions
seed/problems/
├── **/*.yaml                     # MODIFY: 6 design problems get multi-op testCases format
```

---

## Phase 1: Fix 6 Python Skips (0 skip target)

### Task 1: Multi-operation wrapper mode for Python

The 4 design problems (implement-trie, find-median, encode-decode-strings, serialize-deserialize-tree) use a `ops + args` YAML format. The wrapper needs a mode to:
1. Detect `ops = [...]` in the parsed args
2. Instantiate the class (first op)
3. Execute each subsequent operation in sequence
4. Collect results into an array
5. Print the JSON result array

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts`
- Modify: `apps/web/src/server/services/input-parser.ts`

- [ ] **Step 1: Update parseTestInput to handle ops+args format**

In `apps/web/src/server/services/input-parser.ts`, the format `ops = ["Trie","insert","search"], args = [[],["apple"],["apple"]]` needs to be parsed as `{ ops: [...], args: [...] }`. Currently it would parse as two separate args.

Add detection: if parsed result has exactly 2 elements, first is a string array starting with a class name, second is a nested array — wrap as `[{ ops: first, args: second }]`.

```typescript
// At the end of parseTestInput, before returning:
// Detect multi-op format: [["ClassName","method1",...], [[],arg1,...]]
if (result.length === 2 
    && Array.isArray(result[0]) && Array.isArray(result[1])
    && result[0].length > 0 && typeof result[0][0] === 'string'
    && result[0][0][0] === result[0][0][0].toUpperCase()
    && Array.isArray(result[1][0])) {
  return [{ __multiOp: true, ops: result[0], args: result[1] }];
}
```

- [ ] **Step 2: Add multi-op execution to Python wrapper**

In `wrapper.ts` `wrapPythonCode`, add after the existing Solution/function detection block:

```python
# Multi-operation mode: args[0] = { __multiOp: True, ops: [...], args: [...] }
if len(_args) == 1 and isinstance(_args[0], dict) and _args[0].get('__multiOp'):
    _ops = _args[0]['ops']
    _op_args = _args[0]['args']
    _results = []
    _instance = None
    for _idx, _op in enumerate(_ops):
        _cur_args = _op_args[_idx] if _idx < len(_op_args) else []
        if _idx == 0:
            # Instantiate the class
            _cls = globals().get(_op)
            if _cls:
                _instance = _cls(*_cur_args)
            _results.append(None)
        else:
            _method = getattr(_instance, _op, None)
            if _method:
                _r = _method(*_cur_args)
                _results.append(_r)
            else:
                _results.append(None)
    # Format: null for None, true/false for bool, number for int/float
    def _fmt(v):
        if v is None: return None
        if isinstance(v, bool): return v
        if isinstance(v, (int, float)): return v
        if isinstance(v, list): return v
        return str(v)
    print(json.dumps([_fmt(r) for r in _results]))
    sys.exit(0)
```

- [ ] **Step 3: Update Python E2E parser to match**

In `tests/e2e_executor_test.py`, update the Python `parse_test_input` function with the same multi-op detection logic.

- [ ] **Step 4: Run tests for parseTestInput**

```bash
cd apps/web && npx vitest run __tests__/server/services/input-parser.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/server/services/input-parser.ts services/executor/src/runners/wrapper.ts tests/e2e_executor_test.py
git commit -m "feat: multi-op wrapper mode for design problems (Trie, MedianFinder, etc.)"
```

---

### Task 2: Fix linked-list-cycle (cycle construction)

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts` — add `_build_list_with_cycle` helper

- [ ] **Step 1: Add cycle construction helper to Python wrapper**

In the data structure helpers section of `wrapPythonCode`:

```python
def _build_list_with_cycle(values, pos):
    """Build linked list with optional cycle at position pos."""
    if not values:
        return None
    nodes = [ListNode(v) for v in values]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos >= 0 and pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0]
```

- [ ] **Step 2: Update `_convert_args` to detect cycle pattern**

When args are `[[3,2,0,-4], 1]` and param hints include `ListNode` for first param and `int` for second (named `pos`), build the linked list with cycle:

```python
# In _convert_args, after existing ListNode conversion:
if param == 'pos' or (i > 0 and isinstance(converted[i], int)):
    # Check if previous arg was converted to ListNode
    if i > 0 and isinstance(args[i-1], list):
        # Rebuild with cycle
        converted[i-1] = _build_list_with_cycle(args[i-1], converted[i])
        converted.pop(i)  # Remove pos from args
        break
```

Actually, simpler approach: detect the `head + pos` pattern in parseTestInput and handle in wrapper.

- [ ] **Step 3: Test linked-list-cycle through executor**

- [ ] **Step 4: Commit**

---

### Task 3: Fix clone-graph (graph construction)

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts` — add Node class and graph builder

- [ ] **Step 1: Add Node class and graph builder to Python wrapper**

```python
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def _build_graph(adj_list):
    if not adj_list:
        return None
    nodes = [Node(i + 1) for i in range(len(adj_list))]
    for i, neighbors in enumerate(adj_list):
        nodes[i].neighbors = [nodes[n - 1] for n in neighbors]
    return nodes[0]

def _graph_to_adj_list(node):
    if not node:
        return []
    visited = {}
    from collections import deque as _dq
    queue = _dq([node])
    visited[node.val] = node
    while queue:
        n = queue.popleft()
        for nb in n.neighbors:
            if nb.val not in visited:
                visited[nb.val] = nb
                queue.append(nb)
    result = []
    for i in range(1, len(visited) + 1):
        result.append(sorted([nb.val for nb in visited[i].neighbors]))
    return result
```

- [ ] **Step 2: Add graph auto-conversion in _convert_args**

When type hint contains `Node` (not TreeNode/ListNode), convert list to graph.

- [ ] **Step 3: Add graph serialization in _format_result**

```python
if hasattr(r, 'neighbors'):  # Node (graph)
    return json.dumps(_graph_to_adj_list(r))
```

- [ ] **Step 4: Test clone-graph, remove from SKIP_SLUGS**

- [ ] **Step 5: Commit**

---

### Task 4: Fix encode-decode-strings and serialize-deserialize-tree

These use the multi-op mode from Task 1, but with a **roundtrip pattern**: encode→decode, serialize→deserialize.

**Files:**
- Modify: `seed/problems/string/encode-and-decode-strings.yaml` — update testCases to multi-op format
- Modify: `seed/problems/tree/serialize-and-deserialize-binary-tree.yaml` — same

- [ ] **Step 1: Update encode-decode-strings YAML to roundtrip format**

Change testCases to use ops format:
```yaml
testCases:
  - input: 'ops = ["Codec","encode_decode"], args = [[],["Hello","World"]]'
    expected: '["Hello","World"]'
```

Actually, simpler approach: the wrapper already detects Codec class. Add special handling for classes with `encode`+`decode` or `serialize`+`deserialize` method pairs — auto-execute roundtrip.

- [ ] **Step 2: Add roundtrip detection in Python wrapper**

```python
# After Solution detection, before function fallback:
if not _found:
    # Check for Codec-style classes with encode/decode or serialize/deserialize
    for _cls_name in ['Codec', 'Solution']:
        if _cls_name in dir():
            _cls = globals()[_cls_name]
            _inst = _cls()
            if hasattr(_inst, 'encode') and hasattr(_inst, 'decode'):
                _encoded = _inst.encode(_args[0] if _args else [])
                _result = _inst.decode(_encoded)
                _found = True
                break
            if hasattr(_inst, 'serialize') and hasattr(_inst, 'deserialize'):
                # First arg should be a tree
                _tree = _build_tree(_args[0]) if _args and isinstance(_args[0], list) else None
                _serialized = _inst.serialize(_tree)
                _deserialized = _inst.deserialize(_serialized)
                _result = _tree_to_array(_deserialized) if _deserialized else []
                _found = True
                break
```

- [ ] **Step 3: Remove all 6 from SKIP_SLUGS, run full E2E**

```bash
python3 tests/e2e_executor_test.py
```

Expected: `Total: 71 | Pass: 71 | Fail: 0 | Skip: 0`

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: fix all 6 skip problems — 71/71 Python E2E pass"
```

---

## Phase 2: JavaScript — 71 Solutions + E2E

### Task 5: Enhance JS wrapper with TreeNode/ListNode + multi-op

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts` — `wrapJavaScriptCode`

- [ ] **Step 1: Add TreeNode/ListNode/Node classes + helpers to JS wrapper**

Add before `${userCode}` in the JS wrapper:

```javascript
// === Common data structures ===
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val; this.next = next;
  }
}
function _buildTree(values) { /* BFS level-order construction */ }
function _buildList(values) { /* linked list construction */ }
function _treeToArray(root) { /* BFS serialization */ }
function _listToArray(head) { /* traversal */ }
function _buildListWithCycle(values, pos) { /* cycle construction */ }
```

- [ ] **Step 2: Add auto-conversion in JS wrapper**

Since JS has no type hints, use parameter NAME to detect types:
- param named `root`, `tree`, `p`, `q` + arg is array → TreeNode
- param named `head`, `list1`, `list2`, `lists` + arg is array → ListNode
- param named `pos` after a list param → cycle construction

- [ ] **Step 3: Add multi-op + roundtrip mode to JS wrapper**

Same logic as Python: detect `__multiOp` in args, or Codec-style roundtrip classes.

- [ ] **Step 4: Add in-place mutation + TreeNode/ListNode serialization**

- [ ] **Step 5: Run wrapper unit tests**

```bash
cd services/executor && npx vitest run
```

- [ ] **Step 6: Commit**

---

### Task 6: Write 71 JavaScript solutions

**Files:**
- Create: `tests/solutions_js/test_<slug>.js` (71 files)

Each JS solution follows the pattern:
```javascript
// Class Solution style (preferred)
class Solution {
    methodName(param1, param2) {
        // Implementation
        return result;
    }
}

// OR standalone function style  
var methodName = function(param1, param2) {
    return result;
};
```

- [ ] **Step 1–71: Write each solution** (use subagents in parallel batches of ~10)

Group by category for parallel work:
- Array problems: two-sum, best-time-to-buy, contains-duplicate, product-except-self, max-subarray, max-product, find-min-rotated, search-rotated, three-sum, container-most-water
- String problems: valid-anagram, group-anagrams, valid-palindrome, longest-palindromic, palindromic-substrings, longest-substring-no-repeat, longest-repeating-replacement, minimum-window, encode-decode-strings
- DP problems: climbing-stairs, coin-change, longest-increasing, longest-common-sub, word-break, combination-sum, house-robber, house-robber-ii, decode-ways, unique-paths, jump-game, counting-bits
- Tree problems: max-depth, same-tree, invert-tree, level-order, validate-bst, kth-smallest, lca-bst, construct-tree, binary-tree-max-path, serialize-deserialize, subtree
- Graph problems: number-islands, clone-graph, pacific-atlantic, course-schedule, connected-components, graph-valid-tree
- Linked list problems: reverse-ll, merge-two, merge-k, remove-nth, reorder-list, linked-list-cycle
- Binary problems: sum-two-int, number-1-bits, counting-bits, missing-number, reverse-bits
- Matrix/interval: rotate-image, spiral-matrix, set-matrix-zeroes, word-search, word-search-ii, merge-intervals, insert-interval, non-overlapping
- Design: implement-trie, find-median, top-k-frequent

- [ ] **Step 72: Commit all JS solutions**

---

### Task 7: Create JS E2E test script

**Files:**
- Create: `tests/e2e_executor_js.py`

Same structure as `e2e_executor_test.py` but:
- Reads from `tests/solutions_js/`
- Sends with `language: "JAVASCRIPT"`
- Extracts solution code (no test stripping needed — just read the file)

- [ ] **Step 1: Write the E2E script**
- [ ] **Step 2: Run and verify all 71 pass**

```bash
python3 tests/e2e_executor_js.py
```

Expected: `Total: 71 | Pass: 71 | Fail: 0 | Skip: 0`

- [ ] **Step 3: Commit**

---

## Phase 3: C++ — 71 Solutions + E2E

### Task 8: Create C++ wrapper

C++ solutions need a wrapper to read JSON args from `/tmp/args.json`, parse them, call the solution function, and print the result. Since C++ doesn't have built-in JSON parsing, the wrapper includes a minimal JSON parser.

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts` — add `wrapCppCode`
- Modify: `services/executor/src/runners/cpp.ts` — use wrapper + base64 pattern

- [ ] **Step 1: Create `wrapCppCode` function**

The C++ wrapper template includes:
- Minimal JSON parser (handles arrays, objects, strings, numbers, booleans, null)
- TreeNode/ListNode/Node struct definitions
- Tree/list/graph construction from JSON
- Result serialization to JSON string
- Main function that reads `/tmp/args.json`, parses, calls Solution method, prints result

- [ ] **Step 2: Update cpp.ts to use wrapper**

Change cpp.ts to:
1. Wrap user code with the C++ wrapper
2. Write wrapped code to file
3. Compile and run (no stdin needed — args in file)

- [ ] **Step 3: Test with a few problems**
- [ ] **Step 4: Commit**

---

### Task 9: Write 71 C++ solutions

**Files:**
- Create: `tests/solutions_cpp/test_<slug>.cpp` (71 files)

C++ solutions follow the pattern:
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Implementation
    }
};
```

- [ ] **Step 1–71: Write each solution** (parallel subagent batches)
- [ ] **Step 72: Commit all C++ solutions**

---

### Task 10: Create C++ E2E test script

**Files:**
- Create: `tests/e2e_executor_cpp.py`

- [ ] **Step 1: Write the script**
- [ ] **Step 2: Run and verify 71/71 pass**
- [ ] **Step 3: Commit**

---

## Phase 4: C — 71 Solutions + E2E

### Task 11: Create C wrapper

Same approach as C++ but with C-compatible code (no classes, use structs and function pointers).

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts` — add `wrapCCode`
- Modify: `services/executor/src/runners/c.ts` — use wrapper + base64 pattern

- [ ] **Step 1: Create `wrapCCode` function**
- [ ] **Step 2: Update c.ts to use wrapper**
- [ ] **Step 3: Test with a few problems**
- [ ] **Step 4: Commit**

---

### Task 12: Write 71 C solutions

**Files:**
- Create: `tests/solutions_c/test_<slug>.c` (71 files)

- [ ] **Step 1–71: Write each solution** (parallel subagent batches)
- [ ] **Step 72: Commit all C solutions**

---

### Task 13: Create C E2E test script

**Files:**
- Create: `tests/e2e_executor_c.py`

- [ ] **Step 1: Write the script**
- [ ] **Step 2: Run and verify 71/71 pass**
- [ ] **Step 3: Commit**

---

## Phase 5: Final Verification + npm scripts

### Task 14: Add npm scripts for all language E2E tests

**Files:**
- Modify: `package.json`

```json
{
  "scripts": {
    "test:e2e": "python3 tests/e2e_executor_test.py",
    "test:e2e:js": "python3 tests/e2e_executor_js.py",
    "test:e2e:cpp": "python3 tests/e2e_executor_cpp.py",
    "test:e2e:c": "python3 tests/e2e_executor_c.py",
    "test:e2e:all": "npm run test:e2e && npm run test:e2e:js && npm run test:e2e:cpp && npm run test:e2e:c"
  }
}
```

- [ ] **Step 1: Add scripts**
- [ ] **Step 2: Run `npm run test:e2e:all`**

Expected output:
```
Python: Total: 71 | Pass: 71 | Fail: 0 | Skip: 0
JS:     Total: 71 | Pass: 71 | Fail: 0 | Skip: 0
C++:    Total: 71 | Pass: 71 | Fail: 0 | Skip: 0
C:      Total: 71 | Pass: 71 | Fail: 0 | Skip: 0
```

- [ ] **Step 3: Update Claude Skill**
- [ ] **Step 4: Final commit + push**
