---
name: e2e-solution-regression
description: MANDATORY E2E regression for ALL 71 Blind 75 solutions across ALL languages. Must run after ANY change to wrapper, judge, parser, runner, sandbox, or test cases. Uses executor API to verify through the full submit pipeline.
---

# E2E Solution Regression — 全部 71 題 × 全語言驗證

## Architecture (server-side parser)

The pipeline is:
1. **TypeScript `parseTestInput()`** converts free-form YAML input → `any[]` args array
2. **Submission router** calls `parseTestInput` and attaches `args` to each test case
3. **Executor queue** passes `testCases` (with `args`) to worker
4. **Worker** builds `RunConfig` with `args: tc.args ?? []`
5. **Language runner** embeds `JSON.stringify(args)` as base64 in bootstrap command (no stdin piping)
6. **Python/JS wrapper** reads JSON args, calls `Solution.method(*args)`, prints result
7. **C/C++ runner** passes `config.input` as stdin (no wrapper — solutions read stdin directly)
8. **Judge** compares output with expected (deep-sorted for arrays, TreeNode value matching)

Key files:
- `apps/web/src/server/services/input-parser.ts` — parseTestInput (5 formats)
- `services/executor/src/runners/wrapper.ts` — Python/JS wrappers
- `services/executor/src/runners/python.ts` — base64 bootstrap, args via stdin subprocess
- `services/executor/src/runners/javascript.ts` — base64 bootstrap, args via /tmp/args.json
- `services/executor/src/runners/c.ts` / `cpp.ts` — compile + run, stdin = config.input
- `services/executor/src/judge.ts` — deep-sorted array comparison + TreeNode value matching

## Language Support Status

| Language | Wrapper | Args Delivery | Standalone Functions | Class Solution | Auto-convert (TreeNode/ListNode) |
|----------|---------|---------------|---------------------|----------------|----------------------------------|
| Python   | ✅ Full  | base64 → stdin subprocess | ✅ Last defined | ✅ First public method | ✅ via type hints |
| JavaScript | ✅ Full | base64 → /tmp/args.json | ✅ Source parsing | ✅ First non-constructor | ❌ (no type hints) |
| C        | ❌ None  | raw stdin (config.input) | N/A — user reads stdin | N/A | ❌ |
| C++      | ❌ None  | raw stdin (config.input) | N/A — user reads stdin | N/A | ❌ |

## WHEN TO RUN (MANDATORY)

**Every time ANY of these files change, you MUST run ALL tests:**

- `services/executor/src/runners/wrapper.ts`
- `services/executor/src/runners/python.ts`
- `services/executor/src/runners/javascript.ts`
- `services/executor/src/runners/c.ts` / `cpp.ts`
- `services/executor/src/judge.ts`
- `services/executor/src/sandbox.ts`
- `apps/web/src/server/services/input-parser.ts`
- `seed/problems/**/*.yaml`
- `tests/solutions/test_*.py`

**No exceptions. No shortcuts. ALL 71 problems × ALL affected languages.**

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

### Step 2: Run the full Python E2E test script

```bash
python3 tests/e2e_executor_test.py
```

Expected output:
```
Total: 71 | Pass: 65 | Fail: 0 | Skip: 6
```
**Fail MUST be 0.** Skip = 6 (design problems: encode-decode-strings, serialize-deserialize-tree, implement-trie, find-median, linked-list-cycle, clone-graph).

### Step 3: Run multi-language spot checks

After the full Python E2E passes, run spot checks for JS, C, and C++ to verify the runners work:

```bash
# JavaScript — test a few problems manually via executor API
python3 -c "
import json, urllib.request

def test_js(name, code, args, expected):
    payload = {'submissionId': f'js-{name}', 'language': 'JAVASCRIPT', 'code': code,
        'testCases': [{'id':'tc-1','input':'','args':args,'expected':expected,'isHidden':False,'isKiller':False}],
        'timeout': 10000, 'memoryLimit': 256}
    req = urllib.request.Request('http://localhost:4000/execute/sync',
        json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
    r = json.loads(urllib.request.urlopen(req, timeout=30).read())
    print(f'  JS {name}: {r[\"status\"]}')
    return r['status'] == 'ACCEPTED'

# Class Solution style
test_js('two-sum-cls',
    'class Solution { twoSum(nums, target) { const m = {}; for (let i = 0; i < nums.length; i++) { if ((target-nums[i]) in m) return [m[target-nums[i]], i]; m[nums[i]] = i; } } }',
    [[2,7,11,15], 9], '[0,1]')

# Standalone function style
test_js('two-sum-fn',
    'var twoSum = function(nums, target) { const m = {}; for (let i = 0; i < nums.length; i++) { if ((target-nums[i]) in m) return [m[target-nums[i]], i]; m[nums[i]] = i; } };',
    [[2,7,11,15], 9], '[0,1]')

# DP problem
test_js('climbing-stairs',
    'class Solution { climbStairs(n) { if (n<=2) return n; let a=1,b=2; for(let i=3;i<=n;i++) [a,b]=[b,a+b]; return b; } }',
    [10], '89')
"

# C++ — compile + run test
python3 -c "
import json, urllib.request
payload = {'submissionId': 'cpp-verify', 'language': 'CPP',
    'code': '#include <iostream>\nusing namespace std;\nint main() { string s; getline(cin, s); cout << s; return 0; }',
    'testCases': [{'id':'tc-1','input':'hello','args':[],'expected':'hello','isHidden':False,'isKiller':False}],
    'timeout': 30000, 'memoryLimit': 256}
req = urllib.request.Request('http://localhost:4000/execute/sync',
    json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
r = json.loads(urllib.request.urlopen(req, timeout=60).read())
print(f'  C++ echo: {r[\"status\"]}')
"

# C — compile + run test
python3 -c "
import json, urllib.request
payload = {'submissionId': 'c-verify', 'language': 'C',
    'code': '#include <stdio.h>\nint main() { char b[256]; fgets(b,sizeof(b),stdin); printf(\"%s\",b); return 0; }',
    'testCases': [{'id':'tc-1','input':'world','args':[],'expected':'world','isHidden':False,'isKiller':False}],
    'timeout': 30000, 'memoryLimit': 256}
req = urllib.request.Request('http://localhost:4000/execute/sync',
    json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
r = json.loads(urllib.request.urlopen(req, timeout=60).read())
print(f'  C echo: {r[\"status\"]}')
"
```

All must show `ACCEPTED`.

## COMMON FAILURE PATTERNS

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `json.loads(sys.stdin.rea` (truncated) | Docker stdin race condition | Use base64 args in bootstrap cmd, not stdin pipe |
| `missing positional argument` | Wrong args count from parser | Fix parseTestInput or YAML input format |
| `actual=bab expected="bab"` | Expected has extra quotes | Fix YAML expected to not have quotes |
| `actual=null expected=[[...]]` | In-place mutation (-> None) | Wrapper detects `-> None` hint, returns first arg |
| `actual=null expected=[]` | Tree method returns None for empty tree | Wrapper detects TreeNode return hint |
| `actual=[6,2,8,...] expected=6` | TreeNode subtree vs value | Judge compares root value when expected is scalar |
| Sort mismatch for nested arrays | Shallow sort in judge | Judge uses deepSort for nested array comparison |
| Old wrapper still running | tsx module caching | Kill ALL node executor PIDs before restart |
| JS standalone fn not called | `var` in Node module doesn't add to global | Wrapper detects fn name from source at generation time |
| C/C++ compile error "No such file" | Compile path missing /tmp/ prefix | runners/c.ts passes `/tmp/${filename}` to compileCmd |

## ADDING NEW PROBLEMS

1. Create Python solution: `tests/solutions/test_<slug>.py`
2. Create YAML: `seed/problems/<category>/<slug>.yaml`
3. Run `python3 tests/solutions/test_<slug>.py` (local pass)
4. Run `python3 tests/e2e_executor_test.py` (executor pass — Python)
5. Write equivalent JS solution and test via executor API (JS)
6. Write equivalent C/C++ solution if applicable (C/C++)
7. All languages must pass before commit

## ANTI-PATTERNS

- ❌ "I tested 3 problems and they passed" → Run ALL 71
- ❌ "Local Python test passes so it's fine" → Executor pipeline is different
- ❌ "Only wrapper changed, no need to test solutions" → Wrapper IS the integration point
- ❌ "I'll test later" → Test NOW, before commit
- ❌ "Executor is already running" → Kill and restart to get latest code
- ❌ "Only Python needs testing" → JS/C/C++ runners must be spot-checked too
- ❌ "C/C++ compiles locally" → Docker compile path differs, must test through executor
