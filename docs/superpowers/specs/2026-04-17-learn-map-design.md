# Learn Map — 知識圖譜驅動的學習體驗 Design

**Date**: 2026-04-17
**Status**: Approved — ready for implementation plan

## Problem

Current state:
- Knowledge Graph is on `/dashboard` but displayed via Mermaid (static, non-interactive)
- Today's Recommendations query returns empty because `UserProgress.mastery` is never updated after submissions — `updateMastery()` exists but is never called
- User cannot navigate from concept → related problems
- No visual sense of learning progression

Goal: Transform the knowledge graph into the primary learning navigation, with side-drawer concept details, auto mastery updates, and cached daily recommendations.

## User Flow

```
User opens /learn
  ↓
Sees skill tree (hierarchical, bottom-up: Array → Two Pointer → Sliding Window → ...)
  Nodes colored by mastery: 🟢 >70% · 🟡 40-70% · ⚪ <40% · [dimmed] prereqs unmet
  Top banner: "✨ 今日推薦: 從 [DP] 開始 →" (clickable)
  ↓
User clicks concept node (e.g., "Dynamic Programming")
  ↓
Right drawer slides out showing:
  - Concept description + mastery bar (%)
  - Prerequisites (clickable chips) · Follow-ups (clickable chips)
  - Problems list with ✓solved / ⭕unsolved + difficulty badge
  - Last 3 submissions with status
  - Weakness stats ("你在這概念犯過 3 次 off-by-one")
  ↓
User clicks a problem → navigates to /practice/[slug]
  After solving, system auto-updates UserProgress.mastery for linked concepts
  ↓
User returns to /learn
  Node colors reflect new mastery
  Drawer (if still open) refreshes
```

## Architecture

### Page Layout (/learn)

```
┌─ /learn ─────────────────────────────────────────┐
│  [✨ 今日推薦: 從「Dynamic Programming」開始 →]  │  ← Top banner
├──────────────────────────────────────────────────┤
│  ┌─ React Flow Canvas (70%) ─┐ ┌─ Drawer (30%)─┐│
│  │                            │ │ [Concept info] ││
│  │  🟢 Array                  │ │ [Mastery bar]  ││
│  │  │                         │ │ [Prereqs]      ││
│  │  ├─🟡 Two Pointer          │ │ [Problems]     ││
│  │  │                         │ │ [Submissions]  ││
│  │  └─⚪ DP (dim)             │ │ [Weaknesses]   ││
│  └────────────────────────────┘ └────────────────┘│
└──────────────────────────────────────────────────┘
```

### Components

**Frontend** (`apps/web/src/app/learn/`):
- `page.tsx` — Client-side page, fetches graph + daily rec, holds drawer state
- `components/SkillTree.tsx` — React Flow canvas with custom nodes
- `components/ConceptNode.tsx` — Custom node renderer (emoji + name + mastery ring)
- `components/ConceptDrawer.tsx` — Right-side slide panel
- `components/RecommendationBanner.tsx` — Top banner with CTA

**Backend** (`apps/web/src/server/`):
- `services/adaptive-learning.ts` — ADD `recalculateMasteryForProblem(userId, problemId)`
- `routers/concept.ts` — ADD `concept.detail(conceptId)` endpoint
- `routers/concept.ts` — ENHANCE `concept.graph(userId)` to include mastery + solvedCount
- `routers/submission.ts` — MODIFY `submit` to call `recalculateMasteryForProblem` on ACCEPTED
- `routers/learning.ts` — MODIFY `recommendations` to use `DailyRecommendation` cache

### Data Model

**New table**:
```prisma
model DailyRecommendation {
  id         String   @id @default(cuid())
  userId     String
  date       String   // "2026-04-17"
  problemIds Json     // ["prob1", "prob2", ...]
  reasons    Json     // [{ problemId, reason, score }]
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
}
```

**No changes** to: `Concept`, `ConceptEdge`, `UserProgress`, `ProblemConcept`, `UserWeakness`.

### Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Graph lib | `@xyflow/react` (React Flow) | Native React, TypeScript, full interactivity, ~45kb |
| Layout algo | `@dagrejs/dagre` | Hierarchical (top-down) — matches skill tree metaphor |
| Cache | Postgres table `DailyRecommendation` | Persistent across restarts, 1/user/day |
| State | React Query (tRPC) | Already in use |
| Drawer | Custom (no new lib) | Simple CSS transform |

## API Contract

### `concept.graph` (enhanced)
```typescript
input: { userId?: string }  // defaults to current user if authenticated
output: {
  nodes: Array<{
    id: string
    name: string
    domain: string
    mastery: number        // 0-1
    problemCount: number
    solvedCount: number
    prereqsMet: boolean    // for soft-lock dimming
  }>
  edges: Array<{
    source: string
    target: string
    type: 'prerequisite' | 'related'
  }>
}
```

### `concept.detail` (new)
```typescript
input: { conceptId: string }
output: {
  concept: { id, name, domain, description }
  mastery: number
  problems: Array<{
    slug: string
    title: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    relevance: number
    solved: boolean
  }>
  prerequisites: Array<{ id, name, mastery }>
  followUps: Array<{ id, name, mastery }>
  recentSubmissions: Array<{ problemSlug, problemTitle, status, createdAt }>
  weaknessStats: Array<{ pattern: string, frequency: number }>
}
```

### `learning.recommendations` (modified)
Internally calls `getDailyRecommendation(userId)` which:
1. Checks `DailyRecommendation` for today
2. If miss: computes via existing algorithm, caches
3. Returns top 1 problem + concept for banner, top 3-5 for future expansion

### `adaptiveLearning.recalculateMasteryForProblem` (new helper)
Called from `submission.submit` after status=ACCEPTED:
```typescript
async recalculateMasteryForProblem(userId, problemId) {
  const pcs = await prisma.problemConcept.findMany({ where: { problemId } })
  for (const pc of pcs) {
    await this.updateMastery(userId, pc.conceptId)
  }
}
```

## Data Flow

### Graph load
```
GET /learn → concept.graph useQuery
  ↓
Server: JOIN Concept + UserProgress
  Compute per node: prereqsMet = all prereq.mastery >= 0.7
  ↓
Client: React Flow renders with dagre layout
  Color = f(mastery)
  Dimmed = !prereqsMet
```

### Concept click
```
User clicks node
  ↓
URL updates: /learn?concept=dynamic-programming
  ↓
concept.detail useQuery fetches
  ↓
Drawer slides out (CSS transform translateX)
```

### Submission → mastery update
```
submission.submit (existing flow)
  ↓
ACCEPTED → adaptiveLearning.recalculateMasteryForProblem(userId, problemId)
  ↓
For each ProblemConcept → adaptiveLearning.updateMastery(userId, conceptId)
  ↓ (existing logic)
Upserts UserProgress with new mastery formula
  ↓
Return submission result to UI
  ↓
If user on /learn, next re-fetch of concept.graph shows updated color
```

### Daily recommendation
```
User opens /learn → trpc.learning.recommendations
  ↓
Check DailyRecommendation for (userId, today)
  ↓
MISS: run adaptive algorithm → insert row
HIT: return cached
  ↓
Banner shows top 1 problem with reason
```

## Error Handling

- **No concepts in DB**: Show empty state "Seed data missing, run `npm run db:seed`"
- **UserProgress empty (new user)**: Graph shows all ⚪, no prereqs dimmed (since 0 < 0.7 threshold applies, but show all unlocked to avoid scaring new users). Recommendation falls back to easy problems.
- **concept.detail fails**: Drawer shows error state with retry button
- **DailyRecommendation write fails**: Log, compute on the fly anyway (don't block user)
- **recalculateMasteryForProblem fails**: Log error but don't fail submission (mastery update is a side effect)

## Testing

### Unit
- `adaptive-learning.test.ts`: `recalculateMasteryForProblem` updates all linked concepts
- `concept.test.ts`: `concept.graph` returns `prereqsMet` correctly
- `concept.test.ts`: `concept.detail` returns all expected fields

### Integration
- E2E: User submits accepted → mastery updates → /learn reflects it
- E2E: Daily recommendation cache hits within same day, refreshes next day

### Visual
- Graph renders with correct layout (top-down)
- Node colors match mastery thresholds
- Drawer animates smoothly
- Recommendation banner clickable → selects concept

## Non-Goals (Out of Scope)

- ❌ Animations/celebration when concept mastered
- ❌ Streak tracking (day-by-day consecutive solves)
- ❌ XP rewards or level-up visuals
- ❌ Social features (share learning map, compare with friends)
- ❌ AI-generated concept explanations (we use existing `Concept.description`)
- ❌ Mobile-specific layout (responsive but desktop-first)
- ❌ Offline support
- ❌ Advanced graph filtering (search/focus mode)

These could be phase 2 additions after validating the core experience.

## Open Questions

None — all design decisions made in brainstorming.

## Success Criteria

1. User visits /learn, sees the skill tree with their mastery state within 500ms
2. Clicking a concept opens drawer within 200ms (React Query cached)
3. Submitting ACCEPTED solution updates mastery and reflects in graph after refresh
4. Today's recommendation shows a non-empty result for users with ≥1 submission
5. All concept nodes are clickable and navigate properly
6. No regression: existing /dashboard page still works
