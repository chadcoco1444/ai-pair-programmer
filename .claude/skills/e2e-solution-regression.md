---
name: e2e-solution-regression
description: MANDATORY E2E regression for ALL 71 Blind 75 solutions. Must run after ANY change to wrapper, judge, parser, runner, sandbox, or test cases. Uses executor API to verify through the full submit pipeline.
---

# E2E Solution Regression — 全部 71 題驗證

## Architecture (server-side parser)

The pipeline is:
1. **TypeScript `parseTestInput()`** converts free-form YAML input → `any[]` args array
2. **Submission router** calls `parseTestInput` and attaches `args` to each test case
3. **Executor queue** passes `testCases` (with `args`) to worker
4. **Worker** builds `RunConfig` with `args: tc.args ?? []`
5. **Language runner** embeds `JSON.stringify(args)` as base64 in bootstrap command (no stdin piping)
6. **Python/JS wrapper** reads JSON from stdin, calls `Solution.method(*args)`, prints result
7. **Judge** compares output with expected (deep-sorted for arrays)

Key files:
- `apps/web/src/server/services/input-parser.ts` — parseTestInput (5 formats)
- `services/executor/src/runners/wrapper.ts` — Python/JS wrappers (~140 lines each)
- `services/executor/src/runners/python.ts` — base64 bootstrap, no stdin piping
- `services/executor/src/runners/javascript.ts` — same pattern
- `services/executor/src/judge.ts` — deep-sorted array comparison

## WHEN TO RUN (MANDATORY)

**Every time ANY of these files change, you MUST run the full E2E test:**

- `services/executor/src/runners/wrapper.ts`
- `services/executor/src/runners/python.ts`
- `services/executor/src/runners/javascript.ts`
- `services/executor/src/judge.ts`
- `services/executor/src/sandbox.ts`
- `apps/web/src/server/services/input-parser.ts`
- `seed/problems/**/*.yaml`
- `tests/solutions/test_*.py`

**No exceptions. No shortcuts. Not "just test 3 problems". ALL 71.**

## HOW TO RUN

### Step 1: Ensure executor is running (MUST use latest code)

```bash
# Kill ALL old executor processes first!
wmic process where "name='node.exe'" get ProcessId,CommandLine | grep executor
# Kill each PID, then:
npx tsx services/executor/src/server.ts &
curl -s http://localhost:4000/health
```

**IMPORTANT:** tsx can cache old modules. Always kill ALL executor node processes before restarting.

### Step 2: Run the full E2E test script

```bash
python3 tests/e2e_executor_test.py
```

This script:
1. Finds all 71 solution files in `tests/solutions/`
2. Finds matching YAML test cases in `seed/problems/`
3. Extracts the Solution class code (strips test functions)
4. Calls `parse_test_input()` (Python port) to pre-parse args
5. Sends to executor API (`POST /execute/sync`) with `args` field
6. Executor wraps code → runs in Docker → judges output
7. Reports PASS/FAIL/SKIP for every problem

### Step 3: Verify output

```
Total: 71 | Pass: 55 | Fail: 0 | Skip: 16
```

**Fail MUST be 0.** Any failure blocks the commit.

## COMMON FAILURE PATTERNS

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `json.loads(sys.stdin.rea` (truncated) | Docker stdin race condition | Use base64 args in bootstrap cmd, not stdin pipe |
| `missing positional argument` | Wrong args count from parser | Fix parseTestInput or YAML input format |
| `actual=bab expected="bab"` | Expected has extra quotes | Fix YAML expected to not have quotes |
| `actual=null expected=[[...]]` | In-place mutation (-> None) | Wrapper detects `-> None` hint, returns first arg |
| `actual=null expected=[]` | Tree method returns None for empty tree | Wrapper detects TreeNode return hint |
| Sort mismatch for nested arrays | Shallow sort in judge | Judge uses deepSort for nested array comparison |
| Old wrapper still running | tsx module caching | Kill ALL node executor PIDs before restart |

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
- ❌ "Executor is already running" → Kill and restart to get latest code
