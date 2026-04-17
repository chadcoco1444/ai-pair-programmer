---
name: e2e-solution-regression
description: MANDATORY E2E regression for ALL 71 Blind 75 solutions. Must run after ANY change to wrapper, judge, parser, runner, sandbox, or test cases. Uses executor API to verify through the full submit pipeline.
---

# E2E Solution Regression — 全部 71 題驗證

## WHEN TO RUN (MANDATORY)

**Every time ANY of these files change, you MUST run the full E2E test:**

- `services/executor/src/runners/wrapper.ts`
- `services/executor/src/runners/python.ts`
- `services/executor/src/runners/javascript.ts`
- `services/executor/src/judge.ts`
- `services/executor/src/sandbox.ts`
- `seed/problems/**/*.yaml`
- `tests/solutions/test_*.py`

**No exceptions. No shortcuts. Not "just test 3 problems". ALL 71.**

## HOW TO RUN

### Step 1: Ensure executor is running

```bash
curl -s http://localhost:4000/health || npm run dev:executor
```

### Step 2: Run the full E2E test script

```bash
python3 tests/e2e_executor_test.py
```

This script:
1. Finds all 71 solution files in `tests/solutions/`
2. Finds matching YAML test cases in `seed/problems/`
3. Extracts the Solution class code (strips test functions)
4. Sends to executor API (`POST /execute/sync`)
5. Executor wraps code → runs in Docker → judges output
6. Reports PASS/FAIL/SKIP for every problem

### Step 3: Verify output

```
Total: 71 | Pass: XX | Fail: 0 | Skip: XX
```

**Fail MUST be 0.** Any failure blocks the commit.

## USING SUBAGENTS

When fixing failures, dispatch subagents in parallel by category:

```
Agent 1: Fix Array problems (two-sum, container, product, etc.)
Agent 2: Fix DP problems (coin-change, house-robber, etc.)
Agent 3: Fix Tree problems (BST, invert, level-order, etc.)
Agent 4: Fix String problems (anagram, palindrome, etc.)
```

Each subagent should:
1. Read the failing problem's error message
2. Check the YAML test case format
3. Check the solution code
4. Fix wrapper/solution/test-case as needed
5. Re-run that problem through executor API to verify

## COMMON FAILURE PATTERNS

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `missing positional argument` | Input not parsed into enough args | Fix YAML input format or wrapper parser |
| `unsupported operand type` | Args parsed as string not int/list | Fix `_parse_value` or `null→None` conversion |
| `actual=bab expected="bab"` | Expected has quotes, actual doesn't | Fix YAML expected to not have quotes |
| `actual=null expected=[]` | void method returns None | Fix `_format_result` for None → `[]` |
| `RUNTIME_ERROR` with no stderr | Docker container crashed | Check code + wrapper escaping |
| Wrong method called | `dir()` alphabetical ordering | Use `type().__dict__` for definition order |

## ADDING NEW PROBLEMS

1. Create solution: `tests/solutions/test_<slug>.py`
2. Create YAML: `seed/problems/<category>/<slug>.yaml`
3. Run `python3 tests/solutions/test_<slug>.py` (local pass)
4. Run `python3 tests/e2e_executor_test.py` (executor pass)
5. Both must pass before commit

## ANTI-PATTERNS

- ❌ "I tested 3 problems and they passed" → Run ALL 71
- ❌ "Local Python test passes so it's fine" → Executor pipeline is different
- ❌ "Only wrapper changed, no need to test solutions" → Wrapper IS the integration point
- ❌ "I'll test later" → Test NOW, before commit
