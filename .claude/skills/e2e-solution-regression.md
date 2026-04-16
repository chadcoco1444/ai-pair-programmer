---
name: e2e-solution-regression
description: E2E regression testing for solutions — verifies correct answers through the full submit pipeline (wrapper + judge). Run after any change to wrapper, judge, parser, or test cases.
---

# E2E Solution Regression — 完整 submit pipeline 驗證

## When to Run

**MUST run after any change to:**
- `services/executor/src/runners/wrapper.ts` (I/O wrapper)
- `services/executor/src/judge.ts` (judge logic)
- `services/executor/src/sandbox.ts` (Docker execution)
- `seed/problems/**/*.yaml` (test case changes)
- Any runner file (`python.ts`, `javascript.ts`, etc.)

## How It Works

```
Solution Code (tests/solutions/test_*.py)
    ↓
Wrapper (wrapPythonCode) — adds I/O bridge
    ↓
Parser (_parse_input) — reads stdin, parses args
    ↓
Executor — runs in Docker container
    ↓
Judge (compareOutput) — compares actual vs expected
    ↓
Result: ACCEPTED / WRONG_ANSWER / RUNTIME_ERROR
```

## Regression Test Procedure

### Step 1: Verify solutions locally (fast, no Docker)

```bash
cd tests/solutions
for f in test_*.py; do
  echo -n "$f: "
  python3 "$f" 2>&1 | tail -1
done
```

Expected: 71/71 pass

### Step 2: Verify wrapper pipeline (generates wrapped code, tests with stdin)

```bash
# Generate wrapper and test with sample inputs
node -e "
const fs = require('fs');
const src = fs.readFileSync('services/executor/src/runners/wrapper.ts', 'utf-8');
const match = src.match(/return \x60([\s\S]*?)\x60;\n\}/);
let template = match[1];

// Test with a clean Solution class
const userCode = \`class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            if target - num in lookup:
                return [lookup[target - num], i]
            lookup[num] = i\`;
template = template.replace('\${userCode}', userCode);
fs.writeFileSync('/tmp/wrapper_test.py', template);
"

echo 'nums = [2,7,11,15], target = 9' | python3 /tmp/wrapper_test.py
# Expected: [0, 1]
```

### Step 3: Test critical edge cases

These are the bugs that have actually occurred:

| Test | Input | Expected | Bug it catches |
|------|-------|----------|---------------|
| var=val format | `nums = [2,7], target = 9` | 2 args parsed | Regex escaping in template |
| Nested arrays | `board = [[...]], words = [...]` | 2 args parsed | Bracket counting |
| Simple value | `[2,3,1,1,4]` | 1 arg (list) | No var= prefix |
| String input | `"()"` | 1 arg (string) | ast.literal_eval |
| Bool output | `true` / `false` | lowercase | Python True → "true" |
| Array output order | `["eat","oath"]` vs `["oath","eat"]` | ACCEPTED | Order-insensitive compare |
| Method selection | class with `findWords` + `dfs` | calls `findWords` | Definition order not alphabetical |

## Adding New Problems

When adding a new problem to the seed data:

1. **Create solution file**: `tests/solutions/test_<slug>.py`
2. **Verify locally**: `python3 tests/solutions/test_<slug>.py`
3. **Verify through wrapper**: generate wrapper, pipe test input, check output
4. **Verify YAML test cases match**: expected output must match solution output
5. **Run full regression**: all 71 tests still pass

## Anti-Patterns

- ❌ "The Python logic works when I run it directly" — template escaping may differ
- ❌ "Regex works in Python source" — `r'\w'` vs `r'\\w'` have different meanings in templates
- ❌ "Only testing with simple inputs" — always test nested arrays + var=val format
- ❌ "Skipping wrapper test because local test passes" — the wrapper IS the integration point
