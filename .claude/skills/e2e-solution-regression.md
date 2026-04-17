---
name: e2e-solution-regression
description: MANDATORY E2E regression for ALL 71 Blind 75 solutions across ALL 4 languages (Python/JS/C++/C). Must run after ANY change to wrapper, judge, parser, runner, sandbox, or test cases. Target 71/71 per language.
---

# E2E Solution Regression — 全部 71 題 × 4 語言驗證

## Current Status (full coverage)

| Language | Pass | Fail | Skip |
|----------|------|------|------|
| Python   | 71   | 0    | 0    |
| JavaScript | 71 | 0    | 0    |
| C++      | 71   | 0    | 0    |
| C        | 71   | 0    | 0    |
| **Total**| **284** | **0** | **0** |

## Architecture

Pipeline:
1. **TypeScript `parseTestInput()`** converts YAML input → `any[]` args (5 formats + multi-op detection)
2. **Submission router** attaches args to test cases
3. **Executor queue** → worker
4. **Worker** compiles once for C/C++ (caches image), runs each test case
5. **Python/JS runners**: base64 bootstrap + stdin/args.json
6. **C/C++ runners**: compile + run compiled image, args via `/tmp/args.json`
7. **Judge** compares output (deep-sorted for arrays, TreeNode value match)

Key files:
- `apps/web/src/server/services/input-parser.ts` — parseTestInput
- `services/executor/src/runners/wrapper.ts` — Python/JS wrappers
- `services/executor/src/runners/python.ts` / `javascript.ts` — no compile
- `services/executor/src/runners/cpp.ts` / `c.ts` — compile + cache image
- `tests/solutions_cpp/json_helper.h` — C++ JSON parser + TreeNode/ListNode/GraphNode
- `tests/solutions_c/json_helper.h` — C JSON parser + data structures
- `services/executor/src/worker.ts` — concurrency=1, compile cache per submission
- `services/executor/src/judge.ts` — deep sort + TreeNode value matching

## Language Support

| Language | Wrapper | Args Delivery | Standalone Functions | Class Solution | Data Structures |
|----------|---------|---------------|---------------------|----------------|-----------------|
| Python   | ✅ Full  | base64 → stdin | ✅ Last defined | ✅ First public method | ✅ via type hints |
| JavaScript | ✅ Full | base64 → /tmp/args.json | ✅ Source parsing | ✅ First non-constructor | ✅ via param name |
| C++      | ✅ json_helper.h | `/tmp/args.json` | ✅ (main function style) | ✅ Via build_*() helpers | ✅ TreeNode/ListNode/GraphNode |
| C        | ✅ json_helper.h | `/tmp/args.json` | ✅ (main function style) | ✅ Via build_*() helpers | ✅ TreeNode/ListNode/GraphNode |

## WHEN TO RUN (MANDATORY)

**Every time ANY of these files change, you MUST run ALL 4 language tests:**

- `services/executor/src/runners/wrapper.ts` / `python.ts` / `javascript.ts` / `c.ts` / `cpp.ts`
- `services/executor/src/judge.ts` / `sandbox.ts` / `worker.ts`
- `apps/web/src/server/services/input-parser.ts`
- `seed/problems/**/*.yaml`
- `tests/solutions/test_*.py` / `tests/solutions_js/*.js` / `tests/solutions_cpp/*.cpp` / `tests/solutions_c/*.c`
- `tests/solutions_cpp/json_helper.h` / `tests/solutions_c/json_helper.h`

## HOW TO RUN

### Prerequisites

```bash
# 1. Docker Desktop running
docker ps

# 2. Redis running (executor needs it)
docker ps | grep redis  # or: docker start skill-redis

# 3. Language Docker images built
docker images | grep skill-runner
# Expected: skill-runner-python, skill-runner-javascript, skill-runner-c-cpp

# 4. Clean state (if previous runs left cruft)
while [ $(docker images skill-compiled -q | wc -l) -gt 0 ]; do
  docker images skill-compiled -q | head -50 | xargs docker rmi -f 2>/dev/null
done
docker exec <redis-container> redis-cli FLUSHALL  # flush old queue
```

### Restart executor cleanly

```bash
# Kill ALL old executor processes first (tsx can cache old code)
wmic process where "name='node.exe'" get ProcessId,CommandLine | grep executor
# Kill each PID, then:
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer"
npx tsx services/executor/src/server.ts &
sleep 5 && curl -s http://localhost:4000/health
```

### Run all 4 languages

```bash
npm run test:e2e:all
```

This runs in sequence:
```
npm run test:e2e     # Python
npm run test:e2e:js  # JavaScript
npm run test:e2e:cpp # C++
npm run test:e2e:c   # C
```

Each must output `Total: 71 | Pass: 71 | Fail: 0 | Skip: 0`.

### Individual language

```bash
npm run test:e2e      # Python only
npm run test:e2e:js   # JS only
npm run test:e2e:cpp  # C++ only (slowest — compile each of 71 problems)
npm run test:e2e:c    # C only (compile + C has slower JSON parsing)
```

## COMMON FAILURE PATTERNS

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `HTTP 500 / No such image: skill-compiled:...` | Docker snapshot race between concurrent compiles | Worker concurrency must be 1 |
| `parent snapshot does not exist` | Concurrent image cleanup deletes shared layers | Don't delete images per-job; use periodic batch cleanup |
| `timed out` after 60+ passes | Docker image accumulation makes daemon sluggish | Clean up skill-compiled images before re-running |
| `json.loads(sys.stdin.rea` (Python, truncated) | Docker stdin race | Use base64 args in bootstrap, not stdin pipe |
| `Unexpected token '{'` at `${userCode}` | JS wrapper template interpolation escaped | Use `${userCode}` not `\${userCode}` |
| `missing positional argument` | parseTestInput parses wrong args | Check parseTestInput.ts and Python port |
| `actual=bab expected="bab"` | YAML expected has extra quotes | Remove quotes from YAML `expected` field |
| `actual=null expected=[[...]]` | In-place mutation (-> None) | Wrapper detects and returns first arg |
| `actual=null expected=[]` | Tree/List method returns None for empty | Wrapper detects TreeNode/ListNode return hint |
| `actual=[6,2,8,...] expected=6` | TreeNode subtree vs value | Judge compares root value when expected is scalar |
| Sort mismatch for nested arrays | Shallow sort in judge | Judge uses deepSort |
| `Redis ECONNREFUSED` | Redis container stopped | `docker start <redis-container>` or use crawlcast-redis-1 |
| Old wrapper behavior | tsx module caching | Kill ALL executor node processes before restart |
| C/C++ compile error "No such file" | Compile path missing /tmp/ prefix | Use `/tmp/${filename}` in compileCmd |

## ADDING NEW PROBLEMS

1. Python solution: `tests/solutions/test_<slug>.py`
2. YAML: `seed/problems/<category>/<slug>.yaml`
3. JS solution: `tests/solutions_js/<slug>.js`
4. C++ solution: `tests/solutions_cpp/<slug>.cpp`
5. C solution: `tests/solutions_c/<slug>.c`
6. Run `npm run test:e2e:all` — all 4 languages must pass

## ANTI-PATTERNS

- ❌ "I tested 3 problems and they passed" → Run ALL 71
- ❌ "Local test passes so it's fine" → Executor pipeline is different
- ❌ "Only Python needs testing" → ALL 4 languages must pass
- ❌ "Executor is already running" → Kill and restart to load latest code
- ❌ "C/C++ compiles locally" → Docker compile environment differs
- ❌ "Redis is probably up" → Check explicitly; executor silently fails on Redis down
- ❌ Running multiple E2E concurrently → Docker snapshot races cause HTTP 500s
- ❌ Leaving skill-compiled images to accumulate → Docker daemon degrades at ~500+ images
