# Pending Bugs (next session)

## 1. Practice list 35/71 vs 41 actual ACCEPTED
**Status**: DB has 41 distinct problems with ACCEPTED submissions, UI shows only 35/71

**Investigation needed**:
- Web dev server may not have restarted with latest `submission.history` limit fix (50 → 500)
- React Query may be caching stale data
- Check if there's a distinct/deduplication issue in the frontend filter

**Fix**:
```bash
# Restart web dev server, hard refresh browser
npm run dev:web
# Then Ctrl+Shift+R in browser
```

If still 35/71 after restart, debug `apps/web/src/app/practice/page.tsx` line 118-124 — the `solvedSlugs` Set logic.

## 2. Spiral Matrix recent WRONG_ANSWER
**Status**: Last submission 2026-04-17 13:50 was WRONG_ANSWER. Earlier may have been ACCEPTED.

**Not a bug** — system correctly shows as unsolved because latest submission failed. But user may want UI to show "Solved once, currently broken" or similar.

**Options**:
- a) Keep current behavior (status = latest submission status)
- b) Show as solved if ANY submission is ACCEPTED (already how solvedSlugs filter works)
- c) Show "partial" state (has AC history but recent fail)

The current `solvedSlugs` filter DOES check `status === "ACCEPTED"` on any submission, so if there's an ACCEPTED in history, it should show green. If user says Spiral Matrix doesn't show green but DB has ACCEPTED → bug, fix filter. If DB has NO ACCEPTED → correct behavior, user needs to resubmit.

## 3. Other problems with missing green checks (per screenshot)
- Subtree of Another Tree (3.): DB HAS 2x ACCEPTED — should be green (bug in UI)
- Valid Parentheses (14.): DB HAS 7x ACCEPTED — should be green (bug in UI)
- Valid Anagram (16.): DB HAS 1x ACCEPTED — should be green (bug in UI)
- Spiral Matrix (25.): DB has only WRONG_ANSWER — correct behavior

**Root cause hypothesis**: Web server restart not done. Once fresh data loads with limit=500, all 41 should show green.

## Next session action
1. `npm run dev:web` (restart)
2. Hard refresh browser
3. Verify 41/71 displayed
4. If still wrong, check submission.history endpoint response in Network tab
5. Debug practice page solvedSlugs computation
