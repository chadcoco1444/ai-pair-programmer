# Beginner-Friendly AI Tutor: Concrete Example Walk-through + Input Visualizer Design

**Date**: 2026-04-18
**Status**: Approved — ready for implementation plan

## Problem

Beginners struggle with programming problems for three related reasons:
1. They know syntax but can't translate thought into code
2. They can't debug when code breaks
3. They can follow examples but can't write solutions independently

The root cause is a **missing thinking scaffold** between the problem statement and the code. Experienced programmers silently run through a concrete example, recognize patterns, and sketch data flow before typing. Beginners skip this entirely — they stare at the blank editor or ask the AI for the answer.

Current tutor (SKILL framework + suggestion chips) is good, but assumes the learner can verbally describe their thinking. For a total beginner, "describe your approach" is already too abstract.

Goal: add two complementary features that force beginners through the concrete-thinking step before touching code.

## Features

### Feature 1 — Level-based Concrete Walk-through (Socratic prompt upgrade)

For `BEGINNER` and `INTERMEDIATE` users, the AI's first Socratic response **must start with a concrete walk-through** of a specific test case input, not a general discussion of the algorithm.

Example response the AI should produce for a `BEGINNER` on Two Sum:

> Let's forget about algorithms for a moment. Take this input:
>
> `nums = [2, 7, 11, 15], target = 9`
>
> 1. If I point at the number `2`, what would you check next?
> 2. Imagine you already looked at `2` and `7` — how would you *remember* you've seen them?
> 3. What if you got to `15` and still haven't found a pair? What would you conclude?
>
> Walk through this in your head first. Reply with what you'd do for this specific list — don't worry about Python yet.
>
> `[S]`

Only after the student has verbalized the concrete walk-through does the AI move into algorithmic discussion (Knowledge phase).

`ADVANCED` and `EXPERT` users skip this — they get the current Socratic prompt unchanged.

### Feature 2 — Input Visualizer

On the problem detail page (`/practice/[slug]`), each test case's input is rendered as an SVG visualization embedded in the Examples section. Supported shapes:

**Tier 1 (must support)**
- Array of numbers: horizontal boxes `[2][7][11][15]` with index labels
- 2D matrix / grid: grid of cells, optionally color-coded
- Binary tree (level-order with nulls): `[3,9,20,null,null,15,7]` → tree diagram
- String: char boxes `[a][b][c]` with index labels

**Tier 2**
- Linked list: `[1,2,3,4,5]` → nodes with arrows `1 → 2 → 3 → 4 → 5 → null`
- Graph adjacency list: `[[2,4],[1,3]]` → simple force-directed graph
- Array of strings: vertical list or comma-separated chips

**Tier 3**
- Multi-arg (e.g. `nums = [2,7,11,15], target = 9`): detect assignment format, visualize each arg separately and label it
- Unknown/multi-op shapes: fallback to null (no visualizer shown)

## Architecture

### Feature 1

One file modified: `apps/web/src/server/services/skill-prompts.ts`

The `buildSystemPrompt` function already incorporates `LEVEL_CONTEXT` per user level. We add a new section conditionally prepended to the Socratic phase prompt when the user is `BEGINNER` or `INTERMEDIATE`:

```typescript
const CONCRETE_WALKTHROUGH_DIRECTIVE = `
## BEFORE discussing algorithms, force a concrete walk-through

If this is the student's first Socratic exchange (no prior messages, or they just said "I don't know how to start"):

1. Pick ONE specific test case input from the problem's examples.
2. Do NOT discuss time complexity, data structures, or algorithm names yet.
3. Ask 3 concrete questions that walk the student through processing that input by hand, step by step.
4. Use their answers to reveal the algorithmic pattern AFTER they've done the walk-through.

Example:
  For Two Sum with nums=[2,7,11,15], target=9, ask:
  - "Point at 2. What number do you need to find to sum to 9?"
  - "How would you remember which numbers you already looked at?"
  - "If you reach 15 and still no match, what does that mean?"

Do this ONLY for the first Socratic exchange. Subsequent exchanges can proceed normally.`;
```

Inject this in `buildSystemPrompt` between `LEVEL_CONTEXT[level]` and the phase-specific prompt, conditional on `level === "BEGINNER" || level === "INTERMEDIATE"`.

### Feature 2

New directory structure:

```
apps/web/src/
├── lib/input-visualizer/
│   ├── index.ts                       # Main API: visualizeInput(raw) → JSX | null
│   ├── detect.ts                      # detectInputType(raw) → InputShape | 'unknown'
│   ├── types.ts                       # InputShape union, Renderer interface
│   └── renderers/
│       ├── array.tsx                  # renderArray(nums: number[]) → SVG
│       ├── matrix.tsx                 # renderMatrix(cells: (number|string)[][]) → SVG
│       ├── tree.tsx                   # renderTree(levelOrder: (number|null)[]) → SVG
│       ├── list.tsx                   # renderLinkedList(values: number[]) → SVG
│       ├── string.tsx                 # renderString(s: string) → SVG
│       ├── graph.tsx                  # renderGraph(adjList: number[][]) → SVG
│       └── multi-arg.tsx              # renderMultiArg(parts: {name: string, value: any}[]) → SVG
├── components/practice/
│   └── InputVisualizer.tsx            # React wrapper: <InputVisualizer input={rawString} />
└── (modify) apps/web/src/app/practice/[slug]/page.tsx  # render <InputVisualizer /> per example
```

### Public API

```typescript
// lib/input-visualizer/index.ts
export function visualizeInput(rawInput: string): React.ReactNode | null;
// Returns a JSX element (SVG wrapped in container) or null if unrecognized.

// lib/input-visualizer/detect.ts
export type InputShape =
  | { kind: "array"; values: number[] }
  | { kind: "matrix"; cells: (number | string)[][] }
  | { kind: "tree"; levelOrder: (number | null)[] }
  | { kind: "list"; values: number[] }
  | { kind: "string"; value: string }
  | { kind: "graph"; adjList: number[][] }
  | { kind: "string-array"; values: string[] }
  | { kind: "multi-arg"; parts: { name: string; value: unknown }[] }
  | { kind: "unknown" };

export function detectInputType(rawInput: string): InputShape;
```

### Detection logic

Reuses existing `parseTestInput()` from `apps/web/src/server/services/input-parser.ts` (server-side utility) ported to client.

OR we export a shared helper module consumed by both server (for args parsing) and client (for visualization). To avoid risk of divergence, **reuse the existing parser** — move `parseTestInput` to `packages/shared/` if it isn't already, or import directly since it's stateless TypeScript.

For this plan: **import `parseTestInput` directly from the server module** (it has no server-only deps — it's just string parsing). Next.js allows this for `"use client"` components as long as the module has no Node-only imports.

### Rendering each shape

Each renderer is a pure function: input → JSX. They all return a `<svg>` inside a `<figure>` with a small caption.

Example (array):

```tsx
export function renderArray(values: number[]): JSX.Element {
  const CELL_W = 48, CELL_H = 48, GAP = 4;
  const total = values.length * (CELL_W + GAP);
  return (
    <figure className="my-3 overflow-x-auto">
      <svg width={total} height={72} role="img" aria-label="Array visualization">
        {values.map((v, i) => (
          <g key={i} transform={`translate(${i * (CELL_W + GAP)}, 0)`}>
            <rect x="0" y="0" width={CELL_W} height={CELL_H} rx="6"
              fill="#1e293b" stroke="#334155" />
            <text x={CELL_W / 2} y={CELL_H / 2 + 5} textAnchor="middle"
              fill="#f8fafc" fontFamily="'Fira Code', monospace" fontSize="14">
              {v}
            </text>
            <text x={CELL_W / 2} y={CELL_H + 16} textAnchor="middle"
              fill="#64748b" fontFamily="'Fira Code', monospace" fontSize="10">
              [{i}]
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
```

Similar geometric approach for other shapes.

### Placement

In `practice/[slug]/page.tsx`, the problem description is rendered via `ReactMarkdown` with custom component overrides. We intercept the code fence or paragraph patterns that precede test cases ("Input:", "Output:") — actually cleaner: render visualizations from the structured `testCases` data (which we already have from the DB), **not** from the markdown.

Specifically: after the `ReactMarkdown` block in the left pane, if `problem.testCases.length > 0`, render a new `<ExampleVisualizations testCases={problem.testCases} />` section that shows each visible (non-hidden) test case with its `<InputVisualizer />`.

## Data flow

### Feature 1

```
User sends first chat message on problem page
  ↓
skill-orchestrator builds system prompt
  ↓
buildSystemPrompt checks user.level
  ↓
If BEGINNER/INTERMEDIATE: inject CONCRETE_WALKTHROUGH_DIRECTIVE before phase prompt
If ADVANCED/EXPERT: skip injection
  ↓
Gemini generates response following the directive
```

### Feature 2

```
User navigates to /practice/[slug]
  ↓
Server fetches problem with testCases
  ↓
Client renders problem description
  ↓
For each visible test case, <InputVisualizer input={tc.input} />
  ↓
InputVisualizer calls visualizeInput(raw)
  ↓
  → detectInputType(raw) → InputShape
  → dispatch to matching renderer → SVG
  → if unknown, return null (no visualization shown)
  ↓
Output rendered inline in problem description area
```

## Error Handling

- **Malformed input** (e.g., YAML typo, unparseable): `detectInputType` returns `{ kind: "unknown" }`, visualizer returns null, UI shows nothing (no error message — graceful degradation).
- **Empty input**: same as unknown.
- **Huge input** (e.g., 1000-element array): cap at first 50 elements with an ellipsis indicator.
- **Unknown level**: Feature 1 falls back to existing behavior (no concrete walk-through injection).

## Testing

### Unit tests

`apps/web/__tests__/lib/input-visualizer/`:
- `detect.test.ts` — 20+ cases covering all shapes + edge cases (empty, malformed, multi-arg)
- `array.test.tsx` — renders correct number of cells, numbers visible
- `matrix.test.tsx` — rows/cols correct
- `tree.test.tsx` — null positions handled, root at top
- `list.test.tsx` — arrows between nodes
- `string.test.tsx` — char boxes with indices
- `graph.test.tsx` — 1-indexed nodes, edges drawn
- `multi-arg.test.tsx` — each named arg rendered

`apps/web/__tests__/server/services/`:
- `skill-prompts.test.ts` — add cases: `buildSystemPrompt(BEGINNER, SOCRATIC, ...)` contains walkthrough directive; `buildSystemPrompt(ADVANCED, SOCRATIC, ...)` does not.

### Integration

Manual check on `/practice/two-sum`:
- SVG appears under each example
- Numbers match the input
- Hover / tab-navigate works (accessibility)

Manual check with logged-in BEGINNER account:
- First message to AI gets a concrete walk-through response
- Upgrading to ADVANCED user skips the walk-through

## Non-Goals (out of scope)

- ❌ Animated visualizations (static SVG only)
- ❌ Interactive visualizations (click a cell to highlight, etc.) — future
- ❌ Visualizing expected output (only inputs)
- ❌ Visualizing intermediate algorithm state (that's a debugger, not a visualizer)
- ❌ Detecting difficulty of walk-through automatically (always same 3-question format)
- ❌ Multilingual AI walk-through prompts (AI auto-matches user language as usual)

## Success Criteria

1. BEGINNER user's first AI response on any problem starts with "Let's trace through..." (or equivalent concrete walk-through)
2. ADVANCED user's first AI response does not include the walk-through directive (behaves as before)
3. `/practice/two-sum` shows 3 array visualizations (one per visible example) inline
4. `/practice/invert-binary-tree` shows tree-shaped visualizations
5. `/practice/merge-two-sorted-lists` shows linked-list style visualization
6. Unknown shape renders nothing (no crash)
7. Adding a new input type requires only a new renderer file + one case in `detect.ts` — no refactor
8. All existing 93 unit tests still pass, + ~30 new tests for this feature
