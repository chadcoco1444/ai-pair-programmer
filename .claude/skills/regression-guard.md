---
name: regression-guard
description: Enforce regression testing for every bug fix and feature. Prevents bugs from recurring by requiring unit tests before marking work as done.
---

# Regression Guard — 每次修 bug / 加功能必須寫測試

## Rule

**每次修復 bug 或完成功能時，MUST 在 commit 前完成以下步驟：**

1. **寫失敗測試** — 先寫一個能重現 bug 的 unit test（或驗證新功能的測試），確認它 FAIL
2. **修 bug / 實作功能** — 讓測試 PASS
3. **跑全部測試** — 確認沒有 regression（`npm run test`）
4. **Commit 時標註** — commit message 包含 `regression:` 或 `test:` 標籤

## Test Naming Convention

Regression tests MUST include `REGRESSION:` prefix in the test name：

```typescript
it("REGRESSION: executor unreachable should return RUNTIME_ERROR not throw", async () => {
  // ...
});

it("REGRESSION: Docker logs demux should strip binary headers", () => {
  // ...
});
```

## When to Write Tests

| 情境 | 必須寫測試？ | 類型 |
|------|-------------|------|
| 修 bug | YES | regression test（重現 bug） |
| 新功能 | YES | feature test（驗證行為） |
| 重構 | YES if 改變行為 | 確認既有行為不變 |
| 純 UI 樣式 | NO | 除非涉及邏輯 |
| 設定檔 | NO | 除非涉及邏輯 |

## Test Structure

```
apps/web/__tests__/
├── server/
│   ├── routers/          # tRPC router tests
│   │   ├── user.test.ts
│   │   ├── problem.test.ts
│   │   └── submission.test.ts  # includes REGRESSION tests
│   └── services/         # Service layer tests
│       ├── execution-client.test.ts
│       ├── knowledge-graph.test.ts
│       ├── skill-orchestrator.test.ts
│       └── adaptive-learning.test.ts
services/executor/__tests__/
├── judge.test.ts          # Judge logic
└── sandbox-demux.test.ts  # REGRESSION: Docker log parsing
```

## Checklist Before Commit

- [ ] 新/改的邏輯有對應的 unit test
- [ ] Bug fix 有 `REGRESSION:` 測試重現原始 bug
- [ ] `npm run test` 全部 PASS
- [ ] Commit message 描述 root cause（不只是 "fix bug"）

## Anti-Patterns

- ❌ "先修 bug 再補測試" — 測試要先寫
- ❌ "這個 bug 太簡單不需要測試" — 簡單 bug 更容易 regression
- ❌ "測試跑太慢所以跳過" — mock 外部依賴
- ❌ commit message 只寫 "fix" — 要寫 root cause
