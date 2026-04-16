---
name: verify-before-done
description: Every fix MUST be verified with a test before claiming it's done. No fix is complete without proof it works.
---

# Verify Before Done — 修完必驗證

## Rule

**宣告 "已修好" 之前，MUST 完成以下步驟：**

1. **寫 regression test** — 重現原始 bug 的測試
2. **確認測試 FAIL** — 在修復前，測試必須失敗（證明測試有效）
3. **修復 bug**
4. **確認測試 PASS** — 修復後測試通過
5. **跑全部測試** — `npm run test` 確認無 regression
6. **手動驗證**（如果是 UI）— 在瀏覽器中實際操作確認

## 驗證 Checklist

在 commit message 中包含：

```
Verified:
- [ ] Regression test written and passes
- [ ] All tests pass (N total)
- [ ] Manual verification (if UI)
```

## Anti-Patterns

❌ **"應該修好了"** — 沒有測試證明就不算修好
❌ **"邏輯上是對的"** — 邏輯正確 ≠ 實際運作正確
❌ **"改了程式碼就 commit"** — 改完必須跑測試
❌ **"測試太難寫所以跳過"** — 那就 mock，但不能跳過
❌ **"只在本地跑過"** — CI 也要跑

## 常見漏網之魚

這些是過去實際發生過的 bug，每個都因為沒有足夠驗證而 regression：

| Bug | Root Cause | 教訓 |
|-----|-----------|------|
| Docker logs 包含 binary headers | `toString()` 不 demux | 需要 byte-level 測試 |
| Wrapper 呼叫 dfs 而非 findWords | `dir()` 按字母排序 | 需要 method ordering 測試 |
| Python code 和 stdin 混在一起 | `cat > file` 吃掉全部 stdin | 需要 code/input 分離測試 |
| 正確答案顯示 empty output | 沒有 I/O wrapper | 需要 end-to-end 測試 |
| var=value 格式解析失敗 | wrapper 只能解析 literal | 需要多格式 input 測試 |
| stderr 不顯示給使用者 | judge 丟掉 stderr | 需要 error visibility 測試 |

## 修 Bug 的標準流程

```
1. 重現 bug（手動或自動）
2. 寫 regression test（命名: REGRESSION: ...)
3. 確認 test FAIL
4. 修復 bug
5. 確認 test PASS
6. 跑全部測試
7. commit（包含 root cause 在 message 中）
8. 如果是 UI bug → 瀏覽器手動確認
```
