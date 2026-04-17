# Server-side Input Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move test case input parsing from language wrappers (Python/JS) to TypeScript server-side, making wrappers ~30 lines and enabling multi-language E2E testing.

**Architecture:** `parseTestInput()` in TypeScript parses all 5 input formats into `any[]` args. Submission router calls it before sending to executor. Executor passes `JSON.stringify(args)` as stdin. Language wrappers just do `json.loads(stdin)` + call function.

**Tech Stack:** TypeScript, Vitest, Python

---

## File Structure

```
apps/web/src/server/services/
├── input-parser.ts              # NEW: parseTestInput() — all parsing logic
apps/web/__tests__/server/services/
├── input-parser.test.ts         # NEW: 71 test cases for all formats
services/executor/src/runners/
├── wrapper.ts                   # REWRITE: ~30 line Python, ~20 line JS wrapper
├── python.ts                    # MODIFY: pass JSON args as stdin
├── javascript.ts                # MODIFY: pass JSON args as stdin
├── types.ts                     # MODIFY: add args to RunConfig + TestCaseInput
services/executor/src/
├── worker.ts                    # MODIFY: pass args through pipeline
apps/web/src/server/routers/
├── submission.ts                # MODIFY: call parseTestInput before submit
tests/
├── e2e_executor_test.py         # MODIFY: send args instead of input
```

---

### Task 1: TypeScript Input Parser + Tests

**Files:**
- Create: `apps/web/src/server/services/input-parser.ts`
- Create: `apps/web/__tests__/server/services/input-parser.test.ts`

- [x] **Step 1: Write failing tests for all 5 input formats**

```typescript
// apps/web/__tests__/server/services/input-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseTestInput } from "@/server/services/input-parser";

describe("parseTestInput", () => {
  // Format 1: var = val
  it("should parse 'nums = [2,7,11,15], target = 9'", () => {
    expect(parseTestInput('nums = [2,7,11,15], target = 9'))
      .toEqual([[2,7,11,15], 9]);
  });

  it("should parse 'board = [[...]], words = [...]' (nested arrays)", () => {
    expect(parseTestInput('board = [["o","a"],["e","t"]], words = ["oath","eat"]'))
      .toEqual([[["o","a"],["e","t"]], ["oath","eat"]]);
  });

  it("should parse 'prices = [7,1,5,3,6,4]'", () => {
    expect(parseTestInput('prices = [7,1,5,3,6,4]'))
      .toEqual([[7,1,5,3,6,4]]);
  });

  it("should parse 'root = [2,1,3]' (tree input)", () => {
    expect(parseTestInput('root = [2,1,3]'))
      .toEqual([[2,1,3]]);
  });

  it("should parse 'root = [5,1,4,null,null,3,6]' (null handling)", () => {
    expect(parseTestInput('root = [5,1,4,null,null,3,6]'))
      .toEqual([[5,1,4,null,null,3,6]]);
  });

  // Format 2: space-separated values
  it("should parse '[1,2,5] 11' (array + number)", () => {
    expect(parseTestInput('[1,2,5] 11')).toEqual([[1,2,5], 11]);
  });

  it("should parse '3 7' (two numbers)", () => {
    expect(parseTestInput('3 7')).toEqual([3, 7]);
  });

  it("should parse '1 2' (sum of two integers)", () => {
    expect(parseTestInput('1 2')).toEqual([1, 2]);
  });

  // Format 3: comma-separated quoted strings
  it('should parse \'"anagram", "nagaram"\'', () => {
    expect(parseTestInput('"anagram", "nagaram"')).toEqual(["anagram", "nagaram"]);
  });

  it('should parse \'"ADOBECODEBANC", "ABC"\'', () => {
    expect(parseTestInput('"ADOBECODEBANC", "ABC"')).toEqual(["ADOBECODEBANC", "ABC"]);
  });

  it('should parse \'"ABAB", 2\'', () => {
    expect(parseTestInput('"ABAB", 2')).toEqual(["ABAB", 2]);
  });

  it('should parse \'"leetcode" ["leet","code"]\'', () => {
    expect(parseTestInput('"leetcode" ["leet","code"]')).toEqual(["leetcode", ["leet","code"]]);
  });

  // Format 4: single value
  it("should parse '[1,2,3,1]' (single array)", () => {
    expect(parseTestInput('[1,2,3,1]')).toEqual([[1,2,3,1]]);
  });

  it("should parse '2' (single number)", () => {
    expect(parseTestInput('2')).toEqual([2]);
  });

  it("should parse '\"()\"' (single quoted string)", () => {
    expect(parseTestInput('"()"')).toEqual(["()"]);
  });

  it("should parse '11' (number for counting bits)", () => {
    expect(parseTestInput('11')).toEqual([11]);
  });

  // Format 5: JSON booleans and null
  it("should parse null values in arrays", () => {
    const result = parseTestInput('root = [5,1,4,null,null,3,6]');
    expect(result[0]).toContain(null);
  });

  // Edge cases
  it("should handle empty string", () => {
    expect(parseTestInput('')).toEqual([]);
  });

  it("should handle whitespace-only", () => {
    expect(parseTestInput('  \n  ')).toEqual([]);
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

```bash
cd apps/web && npx vitest run __tests__/server/services/input-parser.test.ts
```

Expected: FAIL (module not found)

- [x] **Step 3: Implement parseTestInput**

```typescript
// apps/web/src/server/services/input-parser.ts

/**
 * Parse free-form test case input into structured args array.
 * Runs server-side in TypeScript — NOT in language wrappers.
 *
 * Supports 5 formats:
 * 1. var = val:  "nums = [2,7], target = 9" → [[2,7], 9]
 * 2. space-sep:  "[1,2,5] 11" → [[1,2,5], 11]
 * 3. comma-sep:  '"anagram", "nagaram"' → ["anagram", "nagaram"]
 * 4. single:     "[1,2,3]" → [[1,2,3]]
 * 5. multi-line: "[2,7]\n9" → [[2,7], 9]
 */
export function parseTestInput(input: string): any[] {
  const raw = input.trim();
  if (!raw) return [];

  // Normalize: replace JSON null/true/false for JSON.parse compatibility
  // (done during parsing, not globally — to avoid replacing inside strings)

  // Check format 1: var = val
  if (looksLikeAssignment(raw)) {
    return parseVarValFormat(raw);
  }

  // Try JSON.parse first (handles arrays, numbers, strings, booleans, null)
  const jsonResult = tryJsonParse(raw);
  if (jsonResult !== undefined) {
    return [jsonResult];
  }

  // Check format 2/3: space or comma separated tokens
  const tokens = splitTopLevel(raw);
  if (tokens.length > 1) {
    return tokens.map((t) => {
      const parsed = tryJsonParse(t.trim());
      return parsed !== undefined ? parsed : t.trim();
    });
  }

  // Fallback: return as single string
  return [raw];
}

function looksLikeAssignment(s: string): boolean {
  // Check if starts with identifier followed by =
  const match = s.match(/^[a-zA-Z_]\w*\s*=/);
  if (!match) return false;
  // Make sure it's not == (comparison)
  const eqPos = s.indexOf("=");
  return eqPos > 0 && s[eqPos + 1] !== "=";
}

function parseVarValFormat(raw: string): any[] {
  // Join lines, then split by top-level ", varname ="
  const joined = raw.split("\n").join(" ").trim();
  const parts = splitByAssignment(joined);
  return parts.map((part) => {
    // Strip "varname = " prefix
    const eqIdx = part.indexOf("=");
    const val = part.substring(eqIdx + 1).trim();
    const parsed = tryJsonParse(val);
    return parsed !== undefined ? parsed : val;
  });
}

function splitByAssignment(s: string): string[] {
  // Split "var1 = val1, var2 = val2" using bracket-aware splitting
  const parts: string[] = [];
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let current = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inStr) {
      current += c;
      if (c === strChar && s[i - 1] !== "\\") inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      current += c;
    } else if ("([{".includes(c)) {
      depth++;
      current += c;
    } else if (")]}".includes(c)) {
      depth--;
      current += c;
    } else if (c === "," && depth === 0) {
      // Check if next non-space is a var assignment
      const rest = s.slice(i + 1).trimStart();
      if (/^[a-zA-Z_]\w*\s*=(?!=)/.test(rest)) {
        parts.push(current.trim());
        current = "";
        continue;
      }
      current += c;
    } else {
      current += c;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function splitTopLevel(s: string): string[] {
  // Split by spaces or commas at depth 0, handling quoted strings and brackets
  const tokens: string[] = [];
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let current = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (inStr) {
      current += c;
      if (c === strChar && s[i - 1] !== "\\") inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      current += c;
    } else if ("([{".includes(c)) {
      depth++;
      current += c;
    } else if (")]}".includes(c)) {
      depth--;
      current += c;
    } else if ((c === " " || c === ",") && depth === 0 && current.trim()) {
      // Skip consecutive separators
      tokens.push(current.trim());
      current = "";
      // Skip trailing comma+space
      while (i + 1 < s.length && (s[i + 1] === " " || s[i + 1] === ",")) i++;
    } else if (c !== " " || depth > 0) {
      current += c;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function tryJsonParse(s: string): any | undefined {
  s = s.trim();
  if (!s) return undefined;

  // Try direct JSON.parse
  try {
    return JSON.parse(s);
  } catch {}

  // Try with null/true/false normalization (for Python-style None/True/False)
  try {
    const normalized = s
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    return JSON.parse(normalized);
  } catch {}

  return undefined;
}
```

- [x] **Step 4: Run tests**

```bash
cd apps/web && npx vitest run __tests__/server/services/input-parser.test.ts
```

Expected: ALL PASS

- [x] **Step 5: Commit**

```bash
git add apps/web/src/server/services/input-parser.ts apps/web/__tests__/server/services/input-parser.test.ts
git commit -m "feat: server-side parseTestInput — 5 format support + tests"
```

---

### Task 2: Update Types — add `args` to RunConfig and TestCaseInput

**Files:**
- Modify: `services/executor/src/runners/types.ts`

- [x] **Step 1: Add `args` field to RunConfig and TestCaseInput**

In `services/executor/src/runners/types.ts`, change `RunConfig`:

```typescript
export interface RunConfig {
  language: "PYTHON" | "C" | "CPP" | "JAVASCRIPT";
  code: string;
  input: string;       // keep for backward compat
  args: any[];          // NEW: pre-parsed args as JSON array
  timeout: number;
  memoryLimit: number;
}
```

Add `args` to `TestCaseInput`:

```typescript
export interface TestCaseInput {
  id: string;
  input: string;
  args: any[];           // NEW
  expected: string;
  isHidden: boolean;
  isKiller: boolean;
}
```

- [x] **Step 2: Commit**

```bash
git add services/executor/src/runners/types.ts
git commit -m "feat: add args field to RunConfig + TestCaseInput"
```

---

### Task 3: Rewrite wrapper.ts — extreme simplification

**Files:**
- Modify: `services/executor/src/runners/wrapper.ts`
- Modify: `services/executor/__tests__/wrapper.test.ts`

- [x] **Step 1: Rewrite wrapper.ts**

Replace the entire 348-line file with:

```typescript
/**
 * Language wrappers — minimal I/O bridge.
 * All parsing is done server-side. Wrapper just:
 * 1. Reads JSON args from stdin
 * 2. Calls Solution.method(*args)
 * 3. Prints result
 */

export function wrapPythonCode(userCode: string): string {
  return `# === Auto-imported common modules ===
import collections, heapq, itertools, functools, math, bisect, string
from collections import defaultdict, Counter, deque, OrderedDict
from typing import List, Optional, Tuple, Dict, Set
from functools import lru_cache

# === Common data structures ===
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
    dummy = ListNode(0)
    curr = dummy
    for v in values:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def _tree_to_array(root):
    if not root: return []
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

def _list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

\${userCode}

# === I/O Wrapper ===
import sys, json, inspect

def _convert_arg(value, hint_str):
    if not hint_str:
        return value
    if 'TreeNode' in hint_str and isinstance(value, list):
        return _build_tree(value)
    if 'ListNode' in hint_str and isinstance(value, list):
        return _build_list(value)
    return value

def _format_result(r):
    if isinstance(r, bool): return str(r).lower()
    if isinstance(r, list): return json.dumps(r)
    if isinstance(r, TreeNode): return json.dumps(_tree_to_array(r))
    if isinstance(r, ListNode): return json.dumps(_list_to_array(r))
    if r is None: return "null"
    return str(r)

if __name__ == "__main__":
    _args = json.loads(sys.stdin.read())

    if "Solution" in dir():
        _sol = Solution()
        _methods = [k for k, v in type(_sol).__dict__.items()
                    if not k.startswith("_") and callable(v)]
        if _methods:
            _method = getattr(_sol, _methods[0])
            # Auto-convert TreeNode/ListNode args based on type hints
            try:
                _hints = inspect.get_annotations(_method)
                _params = [p for p in inspect.signature(_method).parameters if p != "self"]
                for _i, _p in enumerate(_params):
                    if _i < len(_args):
                        _args[_i] = _convert_arg(_args[_i], str(_hints.get(_p, "")))
            except: pass
            print(_format_result(_method(*_args)))
    else:
        import types as _t
        _funcs = [(k,v) for k,v in globals().items()
                  if isinstance(v, _t.FunctionType) and not k.startswith("_")]
        if _funcs:
            print(_format_result(_funcs[-1][1](*_args)))
`;
}

export function wrapJavaScriptCode(userCode: string): string {
  return \`\${userCode}

// === I/O Wrapper ===
const _args = JSON.parse(require("fs").readFileSync("/dev/stdin", "utf-8"));
let _result;
if (typeof Solution !== "undefined") {
  const _sol = new Solution();
  const _methods = Object.getOwnPropertyNames(Object.getPrototypeOf(_sol))
    .filter(m => m !== "constructor");
  if (_methods.length > 0) _result = _sol[_methods[0]](..._args);
} else {
  const _fns = Object.keys(global).filter(k =>
    typeof global[k] === "function" && !k.startsWith("_") && k !== "require");
  if (_fns.length > 0) _result = global[_fns[_fns.length - 1]](..._args);
}
if (typeof _result === "boolean") console.log(_result ? "true" : "false");
else if (_result === null || _result === undefined) console.log("null");
else if (Array.isArray(_result) || typeof _result === "object") console.log(JSON.stringify(_result));
else console.log(String(_result));
\`;
}
`;
}

// Note: the actual file should NOT have the outer template literal wrapping.
// The above shows the content structure. The actual implementation just has
// two exported functions returning template literal strings.
```

- [x] **Step 2: Update wrapper tests**

```typescript
// services/executor/__tests__/wrapper.test.ts
import { describe, it, expect } from "vitest";
import { wrapPythonCode, wrapJavaScriptCode } from "../src/runners/wrapper";

describe("wrapPythonCode", () => {
  it("should contain auto-imports", () => {
    const w = wrapPythonCode("pass");
    expect(w).toContain("import collections");
    expect(w).toContain("from collections import defaultdict");
  });

  it("should contain TreeNode/ListNode classes", () => {
    const w = wrapPythonCode("pass");
    expect(w).toContain("class TreeNode:");
    expect(w).toContain("class ListNode:");
    expect(w).toContain("def _build_tree");
  });

  it("should read JSON from stdin (not parse free-form text)", () => {
    const w = wrapPythonCode("pass");
    expect(w).toContain("json.loads(sys.stdin.read())");
    // Should NOT contain old parser functions
    expect(w).not.toContain("_parse_input");
    expect(w).not.toContain("_split_top_level");
    expect(w).not.toContain("_looks_like_assignment");
  });

  it("should use definition order for method selection", () => {
    const w = wrapPythonCode("pass");
    expect(w).toContain("type(_sol).__dict__");
  });

  it("should preserve user code", () => {
    const w = wrapPythonCode("class Solution:\n    def solve(self): pass");
    expect(w).toContain("class Solution:");
    expect(w).toContain("def solve");
  });
});

describe("wrapJavaScriptCode", () => {
  it("should read JSON from stdin", () => {
    const w = wrapJavaScriptCode("function solve() {}");
    expect(w).toContain("JSON.parse");
    expect(w).toContain("readFileSync");
  });

  it("should preserve user code", () => {
    const w = wrapJavaScriptCode("function twoSum() { return [0,1]; }");
    expect(w).toContain("function twoSum");
  });
});
```

- [x] **Step 3: Run tests**

```bash
cd services/executor && npx vitest run
```

Expected: ALL PASS

- [x] **Step 4: Commit**

```bash
git add services/executor/src/runners/wrapper.ts services/executor/__tests__/wrapper.test.ts
git commit -m "feat: rewrite wrapper — read JSON stdin, remove parser (~30 lines)"
```

---

### Task 4: Update Runners + Worker — pass JSON args as stdin

**Files:**
- Modify: `services/executor/src/runners/python.ts`
- Modify: `services/executor/src/runners/javascript.ts`
- Modify: `services/executor/src/worker.ts`

- [x] **Step 1: Update python.ts**

```typescript
import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapPythonCode } from "./wrapper";

export async function runPython(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.PYTHON;
  const wrappedCode = wrapPythonCode(config.code);
  const codeB64 = Buffer.from(wrappedCode).toString("base64");

  // Pass JSON-stringified args as stdin (not raw test input)
  const stdinData = JSON.stringify(config.args);

  return runInSandbox({
    image: lang.image,
    command: [
      "python3",
      "-c",
      [
        "import base64,subprocess,sys",
        `code=base64.b64decode('${codeB64}').decode('utf-8')`,
        "open('/tmp/solution.py','w').write(code)",
        "proc=subprocess.run([sys.executable,'/tmp/solution.py'],input=sys.stdin.buffer.read(),capture_output=True)",
        "sys.stdout.buffer.write(proc.stdout)",
        "sys.stderr.buffer.write(proc.stderr)",
        "sys.exit(proc.returncode)",
      ].join("\n"),
    ],
    stdin: stdinData,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
```

- [x] **Step 2: Update javascript.ts**

```typescript
import { runInSandbox } from "../sandbox";
import type { RunConfig, RunResult } from "./types";
import { LANGUAGE_CONFIG } from "./types";
import { wrapJavaScriptCode } from "./wrapper";

export async function runJavaScript(config: RunConfig): Promise<RunResult> {
  const lang = LANGUAGE_CONFIG.JAVASCRIPT;
  const wrappedCode = wrapJavaScriptCode(config.code);
  const codeB64 = Buffer.from(wrappedCode).toString("base64");
  const stdinData = JSON.stringify(config.args);

  return runInSandbox({
    image: lang.image,
    command: [
      "node",
      "-e",
      [
        "const fs=require('fs');",
        "const {execSync}=require('child_process');",
        `const code=Buffer.from('${codeB64}','base64').toString('utf-8');`,
        "fs.writeFileSync('/tmp/solution.js',code);",
        "try{const r=execSync('node /tmp/solution.js',{input:fs.readFileSync('/dev/stdin'),stdio:['pipe','pipe','pipe']});process.stdout.write(r);}",
        "catch(e){if(e.stdout)process.stdout.write(e.stdout);if(e.stderr)process.stderr.write(e.stderr);process.exit(e.status||1);}",
      ].join("\n"),
    ],
    stdin: stdinData,
    timeout: config.timeout,
    memoryLimit: config.memoryLimit,
  });
}
```

- [x] **Step 3: Update worker.ts — pass args through**

In `services/executor/src/worker.ts`, update the `processJob` function. Change how `RunConfig` is built:

```typescript
const config: RunConfig = {
  language,
  code,
  input: tc.input,
  args: tc.args ?? [],    // NEW: use pre-parsed args
  timeout,
  memoryLimit,
};
```

- [x] **Step 4: Run executor tests**

```bash
cd services/executor && npx vitest run
```

Expected: ALL PASS

- [x] **Step 5: Commit**

```bash
git add services/executor/src/runners/python.ts services/executor/src/runners/javascript.ts services/executor/src/worker.ts
git commit -m "feat: runners pass JSON args as stdin, worker forwards args"
```

---

### Task 5: Update Submission Router — call parseTestInput

**Files:**
- Modify: `apps/web/src/server/routers/submission.ts`

- [x] **Step 1: Import parseTestInput and use it in submit mutation**

At the top, add import:

```typescript
import { parseTestInput } from "../services/input-parser";
```

In the `submit` mutation, change the testCases mapping:

```typescript
testCases: testCases.map((tc) => ({
  id: tc.id,
  input: tc.input,
  args: parseTestInput(tc.input),  // NEW: pre-parse args
  expected: tc.expected,
  isHidden: tc.isHidden,
  isKiller: tc.isKiller,
})),
```

- [x] **Step 2: Run web tests**

```bash
cd apps/web && npx vitest run
```

Expected: ALL PASS

- [x] **Step 3: Commit**

```bash
git add apps/web/src/server/routers/submission.ts
git commit -m "feat: submission router calls parseTestInput before executor"
```

---

### Task 6: Update E2E test script + executor API

**Files:**
- Modify: `tests/e2e_executor_test.py`
- Modify: `services/executor/src/server.ts`

- [x] **Step 1: Update executor server to accept args in API**

In `services/executor/src/server.ts`, the `/execute` and `/execute/sync` endpoints should pass `args` through to the queue. The `ExecutionJob` already gets `testCases` — just make sure `args` is included.

- [x] **Step 2: Update E2E test script to send args**

In `tests/e2e_executor_test.py`, update `submit_to_executor` to call `parseTestInput` (implement a Python version) and send `args`:

```python
def parse_test_input_py(input_str):
    """Python port of TypeScript parseTestInput — for E2E testing."""
    import json, re
    raw = input_str.strip()
    if not raw:
        return []

    # Check var = val format
    if re.match(r'^[a-zA-Z_]\w*\s*=(?!=)', raw):
        return _parse_var_val(raw)

    # Try JSON parse
    try:
        return [json.loads(raw)]
    except:
        pass

    # Split by spaces/commas at top level
    tokens = _split_top_level(raw)
    if len(tokens) > 1:
        return [_try_json(t) for t in tokens]

    return [raw]
```

Then in the test case building:

```python
test_cases.append({
    "id": f"tc-{i+1}",
    "input": tc.get("input", ""),
    "args": parse_test_input_py(tc.get("input", "")),
    "expected": tc.get("expected", ""),
    ...
})
```

- [x] **Step 3: Run E2E**

```bash
python3 tests/e2e_executor_test.py
```

Expected: significant improvement from 20/71 → target 55+/71

- [x] **Step 4: Commit**

```bash
git add tests/e2e_executor_test.py services/executor/src/server.ts
git commit -m "feat: E2E test sends pre-parsed args to executor"
```

---

### Task 7: Fix remaining failures + update Claude Skill

- [x] **Step 1: Run E2E and categorize remaining failures**

```bash
python3 tests/e2e_executor_test.py 2>&1 | grep FAIL
```

- [x] **Step 2: Fix YAML expected values (quote mismatches like `"bab"` vs `bab`)**

For problems where expected has extra quotes (e.g., `expected: '"bab"'`), fix the YAML.

- [x] **Step 3: Fix solution code issues for edge cases**

Some solutions may need adjustment for how they receive TreeNode/ListNode args.

- [x] **Step 4: Run E2E again — must be 0 failures (excluding design/skip problems)**

```bash
python3 tests/e2e_executor_test.py
```

Expected: `Fail: 0`

- [x] **Step 5: Update Claude Skill**

Update `.claude/skills/e2e-solution-regression.md` to reflect the new architecture.

- [x] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: all E2E tests passing — 0 failures"
git push
```
