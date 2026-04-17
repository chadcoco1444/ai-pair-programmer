# Server-side Input Parser — 設計規格

## 問題

YAML test case 的 input 有 5 種不同格式，目前的 parser 嵌在每個語言的 wrapper template 裡（Python/JS），導致：
1. JS template escaping 地獄（`\\w` vs `\w` vs `\\\\w`）
2. 每新增語言要重寫 parser
3. 150+ 行的 wrapper，難以 debug

## 解決方案

**將 parser 移到 TypeScript server-side。** Wrapper 只需讀 JSON stdin + call function。

## 架構

### Before

```
YAML input (free-form string)
  → Executor (raw string as stdin)
  → Python wrapper: complex _parse_input (150 lines)
  → Solution.method(*parsed_args)
```

### After

```
YAML input (free-form string)
  → Submission Router: parseTestInput() (TypeScript)
  → args: JSON array [[2,7,11,15], 9]
  → Executor ({code, args, expected})
  → Python wrapper: args = json.loads(stdin) (5 lines)
  → Solution.method(*args)
```

## 改動清單

### 1. 新增: `apps/web/src/server/services/input-parser.ts`

```typescript
export function parseTestInput(input: string): any[]
```

支援 5 種格式：
- `var = val`: `"nums = [2,7], target = 9"` → `[[2,7], 9]`
- space-separated: `"[1,2,5] 11"` → `[[1,2,5], 11]`
- comma-separated strings: `'"anagram", "nagaram"'` → `["anagram", "nagaram"]`
- single value: `"[1,2,3]"` → `[[1,2,3]]`
- multi-line: `"[2,7]\n9"` → `[[2,7], 9]`

JSON 轉換：`null` → `null`, `true` → `true`, `false` → `false`

```typescript
export function convertArgsForMethod(
  args: any[],
  code: string  // user code — extract type hints from method signature
): any[]
```

偵測 `Optional[TreeNode]` / `Optional[ListNode]` type hints → 將 list arg 轉為 tree/list 的 level-order array（TreeNode 轉換仍在 Python wrapper 做，但由 TypeScript 標記哪些 args 要轉）。

### 2. 新增: `apps/web/__tests__/server/services/input-parser.test.ts`

Vitest 測試覆蓋所有 5 種格式 + edge cases。

### 3. 修改: `services/executor/src/runners/types.ts`

```typescript
interface TestCaseInput {
  id: string;
  input: string;      // 原始 input (給 judge 顯示用)
  args: any[];         // 新增: 預解析好的 args
  expected: string;
  isHidden: boolean;
  isKiller: boolean;
}
```

### 4. 修改: `apps/web/src/server/routers/submission.ts`

在 submit mutation 裡，呼叫 `parseTestInput()` 預處理每個 test case：

```typescript
testCases: testCases.map(tc => ({
  id: tc.id,
  input: tc.input,
  args: parseTestInput(tc.input),  // 新增
  expected: tc.expected,
  ...
}))
```

### 5. 修改: `services/executor/src/worker.ts`

將 `JSON.stringify(tc.args)` 作為 stdin 傳給 runner，不再傳 raw input string。

### 6. 修改: `services/executor/src/runners/wrapper.ts`

Python wrapper 從 ~150 行 → ~30 行：

```python
# Auto-imports + TreeNode/ListNode/build_tree/build_list (保留)

{userCode}

import sys, json
if __name__ == "__main__":
    _args = json.loads(sys.stdin.read())
    _sol = Solution()
    _methods = [k for k,v in type(_sol).__dict__.items()
                if not k.startswith("_") and callable(v)]
    _result = getattr(_sol, _methods[0])(*_args)
    # format + print
```

JavaScript wrapper ~20 行，同理。

### 7. 修改: `services/executor/src/runners/python.ts` + `javascript.ts`

Runner 把 `JSON.stringify(config.args)` 作為 stdin（不再是 `config.input`）。

### 8. 修改: `services/executor/src/runners/types.ts` — RunConfig

```typescript
interface RunConfig {
  language: ...;
  code: string;
  args: any[];      // 改用 args
  timeout: number;
  memoryLimit: number;
}
```

### 9. 修改: `tests/e2e_executor_test.py`

E2E 測試腳本改為送 `args` 而非 `input`。

## 不改的東西

- YAML 檔案格式不動
- Judge 比對邏輯不動
- `expected` 仍是 string
- TreeNode/ListNode class 定義保留在 wrapper
- `_build_tree` / `_build_list` 保留在 wrapper
- method definition order selection 保留
- auto-import common modules 保留

## 移除的東西

- `_parse_input()` — 刪除
- `_split_top_level()` — 刪除
- `_looks_like_assignment()` — 刪除
- `_convert_args()` — 移到 TypeScript
- `_parse_value()` — 刪除

## 新語言擴增流程

新增一個語言（如 Go、Rust）只需：
1. 寫 ~20 行 wrapper（讀 JSON stdin → call function → print result）
2. 寫 Dockerfile
3. 不需要寫 parser

## 測試策略

### Unit Tests
1. `input-parser.test.ts` — 覆蓋所有 5 種格式 + 71 個實際 test case
2. `wrapper.test.ts` — 更新為測試極簡 wrapper

### E2E Tests — 4 語言 x 71 題

```
tests/solutions/
├── python/          # 71 個 .py 解答
├── javascript/      # 71 個 .js 解答
├── c/               # 71 個 .c 解答（適用題目）
└── cpp/             # 71 個 .cpp 解答（適用題目）
```

- `npm run test:e2e` — 全部題目 x 全部語言 through executor
- E2E 腳本依序對每題的每個語言版本 submit
- Fail 數 = 0 才能 commit

### Claude Skill 要求
- 修改 wrapper/judge/runner/sandbox 後 MUST 跑 `npm run test:e2e`
- E2E 測試覆蓋所有 4 語言（Python, JavaScript, C, C++）
- 新增題目時，4 語言的解答都要加

### 實作順序
1. 先完成 server-side parser + 極簡 wrapper（本 spec）
2. Python 71 題 E2E 全通過
3. 再加 JavaScript 71 題解答
4. 再加 C/C++ 解答（部分題目不適用，如 Trie、Serialize Tree）
