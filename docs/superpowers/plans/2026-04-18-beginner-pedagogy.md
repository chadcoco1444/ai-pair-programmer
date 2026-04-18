# Beginner Pedagogy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two features for beginners: (1) Level-based concrete walk-through directive in the Socratic prompt, (2) Input Visualizer SVG renderers embedded in problem description for each test case.

**Architecture:** Feature 1 is pure prompt engineering — conditional directive injected into `buildSKILLPrompt` based on student level. Feature 2 is a plug-in renderer library: `detectInputType(raw)` → dispatches to shape-specific renderer that returns an SVG. Placed inline in the problem detail page per test case.

**Tech Stack:** TypeScript, React 19, Vitest, @testing-library/react. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-18-beginner-pedagogy-design.md`

---

## File Structure

```
apps/web/src/
├── server/services/
│   └── skill-prompts.ts                       # MODIFY: inject walk-through directive for BEGINNER/INTERMEDIATE
├── lib/input-visualizer/
│   ├── types.ts                               # NEW: InputShape union
│   ├── detect.ts                              # NEW: detectInputType(raw) → InputShape
│   ├── index.tsx                              # NEW: visualizeInput(raw) → JSX | null (dispatch)
│   └── renderers/
│       ├── array.tsx                          # NEW
│       ├── matrix.tsx                         # NEW
│       ├── tree.tsx                           # NEW
│       ├── list.tsx                           # NEW
│       ├── string.tsx                         # NEW
│       ├── graph.tsx                          # NEW
│       ├── string-array.tsx                   # NEW
│       └── multi-arg.tsx                      # NEW
├── components/practice/
│   ├── InputVisualizer.tsx                    # NEW: React wrapper
│   └── ExampleVisualizations.tsx              # NEW: iterate testCases + render visualizers
└── app/practice/[slug]/
    └── page.tsx                               # MODIFY: render <ExampleVisualizations />

apps/web/__tests__/
├── server/services/
│   └── skill-prompts-walkthrough.test.ts     # NEW
└── lib/input-visualizer/
    ├── detect.test.ts                         # NEW
    ├── array.test.tsx                         # NEW
    ├── matrix.test.tsx                        # NEW
    ├── tree.test.tsx                          # NEW
    ├── list.test.tsx                          # NEW
    ├── string.test.tsx                        # NEW
    ├── graph.test.tsx                         # NEW
    ├── string-array.test.tsx                  # NEW
    └── multi-arg.test.tsx                     # NEW
```

---

## Phase 1: Feature 1 — Concrete Walk-through Directive

### Task 1: Add walkthrough directive to skill-prompts.ts

**Files:**
- Modify: `apps/web/src/server/services/skill-prompts.ts`
- Create: `apps/web/__tests__/server/services/skill-prompts-walkthrough.test.ts`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/server/services/skill-prompts-walkthrough.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildSKILLPrompt } from "@/server/services/skill-prompts";

const problem = {
  title: "Two Sum",
  category: "ARRAY",
  difficulty: "EASY",
  description: "Given an array and a target, return indices of two numbers that sum to target.",
  concepts: ["Array", "Hash Table"],
  hints: [],
};

describe("buildSKILLPrompt — walkthrough directive", () => {
  it("injects walkthrough directive for BEGINNER in Socratic phase", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toContain("BEFORE discussing algorithms");
    expect(prompt).toContain("force a concrete walk-through");
  });

  it("injects walkthrough directive for INTERMEDIATE in Socratic phase", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "INTERMEDIATE", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive for ADVANCED", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "ADVANCED", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive for EXPERT", () => {
    const prompt = buildSKILLPrompt({
      phase: "SOCRATIC",
      student: { level: "EXPERT", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });

  it("does NOT inject walkthrough directive in non-Socratic phases (BEGINNER)", () => {
    const prompt = buildSKILLPrompt({
      phase: "KNOWLEDGE",
      student: { level: "BEGINNER", weaknesses: [], conceptMastery: [] },
      problem,
    });
    expect(prompt).not.toContain("BEFORE discussing algorithms");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/server/services/skill-prompts-walkthrough.test.ts
```

Expected: 3 tests FAIL (BEGINNER, INTERMEDIATE inject checks), 2 PASS (ADVANCED, EXPERT, KNOWLEDGE negative checks pass by default since directive doesn't exist yet).

- [ ] **Step 3: Add directive constant + inject in buildSKILLPrompt**

Open `apps/web/src/server/services/skill-prompts.ts`. After the `LEVEL_CONTEXT` constant (around line 100), add:

```typescript
const CONCRETE_WALKTHROUGH_DIRECTIVE = `## BEFORE discussing algorithms, force a concrete walk-through

If this is the student's first Socratic exchange (no prior assistant messages in this conversation, or the student says "I don't know how to start" or "help me"):

1. Pick ONE specific input from the problem's examples.
2. Do NOT mention time complexity, data structures, or algorithm names yet.
3. Ask 3 concrete questions that walk the student through processing that input by hand, step by step.
4. After they answer, reveal the algorithmic pattern.

Example for Two Sum with nums=[2,7,11,15], target=9:
- "Point at 2. What number do you need to find to sum to 9?"
- "How would you remember which numbers you already looked at?"
- "If you reach 15 and still no match, what does that mean?"

Do this ONLY for the first Socratic exchange.`;
```

Then modify `buildSKILLPrompt` to inject this when applicable. Replace the existing function body:

```typescript
export function buildSKILLPrompt(params: {
  phase: SKILLPhase;
  student: StudentProfile;
  problem?: ProblemContext;
}): string {
  const { phase, student, problem } = params;

  const parts: string[] = [SYSTEM_BASE];

  // Phase rules
  parts.push(PHASE_PROMPTS[phase]);

  // Student level
  parts.push(LEVEL_CONTEXT[student.level]);

  // Concrete walk-through for beginners in Socratic phase
  if (
    phase === "SOCRATIC" &&
    (student.level === "BEGINNER" || student.level === "INTERMEDIATE")
  ) {
    parts.push(CONCRETE_WALKTHROUGH_DIRECTIVE);
  }

  // Weaknesses
  if (student.weaknesses.length > 0) {
    parts.push(`Known weaknesses: ${student.weaknesses.join(", ")}. Keep these in mind while guiding the student.`);
  }

  // Concept mastery
  if (student.conceptMastery.length > 0) {
    const masteryStr = student.conceptMastery
      .map((c) => `${c.name}: ${Math.round(c.mastery * 100)}%`)
      .join(", ");
    parts.push(`Related concept mastery: ${masteryStr}`);
  }

  // Problem info
  if (problem) {
    parts.push(`## Problem info
- Title: ${problem.title}
- Category: ${problem.category}
- Difficulty: ${problem.difficulty}
- Related concepts: ${problem.concepts.join(", ")}

Description:
${problem.description}`);
  }

  return parts.join("\n\n");
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/server/services/skill-prompts-walkthrough.test.ts
```

Expected: ALL 5 PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/server/services/skill-prompts.ts apps/web/__tests__/server/services/skill-prompts-walkthrough.test.ts && git commit -m "feat(ai-tutor): inject concrete walk-through directive for BEGINNER/INTERMEDIATE"
```

---

## Phase 2: Feature 2 — Input Visualizer

### Task 2: Types + detect.ts

**Files:**
- Create: `apps/web/src/lib/input-visualizer/types.ts`
- Create: `apps/web/src/lib/input-visualizer/detect.ts`
- Create: `apps/web/__tests__/lib/input-visualizer/detect.test.ts`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/detect.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { detectInputType } from "@/lib/input-visualizer/detect";

describe("detectInputType", () => {
  it("detects a plain integer array", () => {
    const r = detectInputType("[2,7,11,15]");
    expect(r.kind).toBe("array");
    if (r.kind === "array") expect(r.values).toEqual([2, 7, 11, 15]);
  });

  it("detects a 2D matrix of numbers", () => {
    const r = detectInputType("[[1,1,0],[0,1,0]]");
    expect(r.kind).toBe("matrix");
    if (r.kind === "matrix") expect(r.cells).toEqual([[1, 1, 0], [0, 1, 0]]);
  });

  it("detects a string", () => {
    const r = detectInputType('"abcabcbb"');
    expect(r.kind).toBe("string");
    if (r.kind === "string") expect(r.value).toBe("abcabcbb");
  });

  it("detects an array of strings", () => {
    const r = detectInputType('["eat","tea","ate"]');
    expect(r.kind).toBe("string-array");
    if (r.kind === "string-array") expect(r.values).toEqual(["eat", "tea", "ate"]);
  });

  it("detects tree from level-order with nulls (when assigned to root)", () => {
    const r = detectInputType("root = [3,9,20,null,null,15,7]");
    expect(r.kind).toBe("tree");
    if (r.kind === "tree") expect(r.levelOrder).toEqual([3, 9, 20, null, null, 15, 7]);
  });

  it("detects linked list when assigned to head", () => {
    const r = detectInputType("head = [1,2,3,4,5]");
    expect(r.kind).toBe("list");
    if (r.kind === "list") expect(r.values).toEqual([1, 2, 3, 4, 5]);
  });

  it("detects multi-arg with named parts", () => {
    const r = detectInputType("nums = [2,7,11,15], target = 9");
    expect(r.kind).toBe("multi-arg");
    if (r.kind === "multi-arg") {
      expect(r.parts).toHaveLength(2);
      expect(r.parts[0]).toEqual({ name: "nums", value: [2, 7, 11, 15] });
      expect(r.parts[1]).toEqual({ name: "target", value: 9 });
    }
  });

  it("detects graph adjacency list when assigned to adjList", () => {
    const r = detectInputType("adjList = [[2,4],[1,3],[2,4],[1,3]]");
    expect(r.kind).toBe("graph");
    if (r.kind === "graph") expect(r.adjList).toEqual([[2, 4], [1, 3], [2, 4], [1, 3]]);
  });

  it("returns unknown for malformed input", () => {
    expect(detectInputType("garbage{{")).toEqual({ kind: "unknown" });
  });

  it("returns unknown for empty string", () => {
    expect(detectInputType("")).toEqual({ kind: "unknown" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/detect.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create types.ts**

Create `apps/web/src/lib/input-visualizer/types.ts`:

```typescript
export type InputShape =
  | { kind: "array"; values: number[] }
  | { kind: "matrix"; cells: (number | string)[][] }
  | { kind: "tree"; levelOrder: (number | null)[] }
  | { kind: "list"; values: number[] }
  | { kind: "string"; value: string }
  | { kind: "string-array"; values: string[] }
  | { kind: "graph"; adjList: number[][] }
  | { kind: "multi-arg"; parts: { name: string; value: unknown }[] }
  | { kind: "unknown" };
```

- [ ] **Step 4: Create detect.ts**

Create `apps/web/src/lib/input-visualizer/detect.ts`:

```typescript
import type { InputShape } from "./types";

/** Lightweight JSON parse that tolerates trailing commas and Python-style None/True/False. */
function tryJson(s: string): unknown | undefined {
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {}
  try {
    const normalized = trimmed
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    return JSON.parse(normalized);
  } catch {}
  return undefined;
}

/** Split "name = value" comma-separated pairs, respecting brackets. */
function splitAssignments(s: string): { name: string; rawValue: string }[] {
  const parts: { name: string; rawValue: string }[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "[" || c === "{" || c === "(") depth++;
    else if (c === "]" || c === "}" || c === ")") depth--;
    if (c === "," && depth === 0) {
      const m = /^\s*([a-zA-Z_]\w*)\s*=\s*(.+)\s*$/.exec(current);
      if (m) parts.push({ name: m[1], rawValue: m[2] });
      current = "";
      continue;
    }
    current += c;
  }
  const m = /^\s*([a-zA-Z_]\w*)\s*=\s*(.+)\s*$/.exec(current);
  if (m) parts.push({ name: m[1], rawValue: m[2] });
  return parts;
}

function isSingleAssignment(s: string): { name: string; rawValue: string } | null {
  const assignments = splitAssignments(s);
  return assignments.length === 1 ? assignments[0] : null;
}

function classifyValue(
  name: string | null,
  value: unknown
): InputShape {
  if (typeof value === "string") {
    return { kind: "string", value };
  }
  if (Array.isArray(value)) {
    // Array of strings?
    if (value.every((v) => typeof v === "string")) {
      return { kind: "string-array", values: value as string[] };
    }
    // 2D array — could be matrix or graph or tree/list-of-lists
    if (value.every((v) => Array.isArray(v))) {
      // name hints: adjList → graph
      if (name && /adjlist|adj|graph|edges/i.test(name)) {
        return { kind: "graph", adjList: value as number[][] };
      }
      return { kind: "matrix", cells: value as (number | string)[][] };
    }
    // 1D array of numbers or numbers+nulls
    const allNumeric = value.every(
      (v) => typeof v === "number" || v === null
    );
    if (allNumeric) {
      // name hint: root/tree → tree
      if (name && /root|tree/i.test(name)) {
        return { kind: "tree", levelOrder: value as (number | null)[] };
      }
      // name hint: head/list → list
      if (name && /head|list|node/i.test(name)) {
        return { kind: "list", values: value.filter((v): v is number => v !== null) };
      }
      // plain numeric array (no nulls) → array
      if (value.every((v) => typeof v === "number")) {
        return { kind: "array", values: value as number[] };
      }
      // numeric with nulls but no name → treat as tree
      return { kind: "tree", levelOrder: value as (number | null)[] };
    }
    return { kind: "unknown" };
  }
  return { kind: "unknown" };
}

export function detectInputType(raw: string): InputShape {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "unknown" };

  // Case 1: single "name = value"
  const single = isSingleAssignment(trimmed);
  if (single) {
    const value = tryJson(single.rawValue);
    if (value === undefined) return { kind: "unknown" };
    return classifyValue(single.name, value);
  }

  // Case 2: multiple "name = val, name2 = val2"
  const assignments = splitAssignments(trimmed);
  if (assignments.length > 1) {
    const parts = assignments
      .map((a) => {
        const v = tryJson(a.rawValue);
        return v !== undefined ? { name: a.name, value: v } : null;
      })
      .filter((p): p is { name: string; value: unknown } => p !== null);
    if (parts.length === 0) return { kind: "unknown" };
    return { kind: "multi-arg", parts };
  }

  // Case 3: no assignment, just a value
  const value = tryJson(trimmed);
  if (value === undefined) return { kind: "unknown" };
  return classifyValue(null, value);
}
```

- [ ] **Step 5: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/detect.test.ts
```

Expected: 10 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/types.ts apps/web/src/lib/input-visualizer/detect.ts apps/web/__tests__/lib/input-visualizer/detect.test.ts && git commit -m "feat(visualizer): input shape detection for all supported types"
```

---

### Task 3: renderArray + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/array.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/array.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/array.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderArray } from "@/lib/input-visualizer/renderers/array";

describe("renderArray", () => {
  it("renders an svg with correct number of cells for the values", () => {
    const { container } = render(renderArray([2, 7, 11, 15]));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(4);
  });

  it("displays each value as text", () => {
    const { container } = render(renderArray([2, 7, 11, 15]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("2");
    expect(texts).toContain("7");
    expect(texts).toContain("11");
    expect(texts).toContain("15");
  });

  it("displays index labels below each cell", () => {
    const { container } = render(renderArray([5, 10]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("[0]");
    expect(texts).toContain("[1]");
  });

  it("renders empty svg for empty array", () => {
    const { container } = render(renderArray([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/array.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/array.tsx`:

```tsx
import type { JSX } from "react";

const CELL_W = 48;
const CELL_H = 48;
const GAP = 4;
const LABEL_H = 16;

export function renderArray(values: number[]): JSX.Element {
  const total = Math.max(1, values.length) * (CELL_W + GAP);
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={CELL_H + LABEL_H}
        viewBox={`0 0 ${total} ${CELL_H + LABEL_H}`}
        role="img"
        aria-label="Array visualization"
      >
        {values.map((v, i) => (
          <g key={i} transform={`translate(${i * (CELL_W + GAP)}, 0)`}>
            <rect
              x="0"
              y="0"
              width={CELL_W}
              height={CELL_H}
              rx="6"
              fill="#1e293b"
              stroke="#334155"
            />
            <text
              x={CELL_W / 2}
              y={CELL_H / 2 + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="14"
            >
              {v}
            </text>
            <text
              x={CELL_W / 2}
              y={CELL_H + 12}
              textAnchor="middle"
              fill="#64748b"
              fontFamily="'Fira Code', monospace"
              fontSize="10"
            >
              [{i}]
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/array.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/array.tsx apps/web/__tests__/lib/input-visualizer/array.test.tsx && git commit -m "feat(visualizer): renderArray SVG with cells + index labels"
```

---

### Task 4: renderMatrix + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/matrix.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/matrix.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/matrix.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderMatrix } from "@/lib/input-visualizer/renderers/matrix";

describe("renderMatrix", () => {
  it("renders rows × cols cells", () => {
    const { container } = render(renderMatrix([[1, 2, 3], [4, 5, 6]]));
    expect(container.querySelectorAll("rect").length).toBe(6);
  });

  it("displays each cell value as text", () => {
    const { container } = render(renderMatrix([[1, 0], [0, 1]]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(["1", "0", "0", "1"]));
  });

  it("returns null-like (empty svg) for empty input", () => {
    const { container } = render(renderMatrix([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/matrix.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/matrix.tsx`:

```tsx
import type { JSX } from "react";

const CELL = 40;
const GAP = 3;

export function renderMatrix(cells: (number | string)[][]): JSX.Element {
  const rows = cells.length;
  const cols = rows > 0 ? cells[0].length : 0;
  const w = Math.max(1, cols) * (CELL + GAP);
  const h = Math.max(1, rows) * (CELL + GAP);
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Matrix visualization"
      >
        {cells.map((row, r) =>
          row.map((v, c) => (
            <g key={`${r}-${c}`} transform={`translate(${c * (CELL + GAP)}, ${r * (CELL + GAP)})`}>
              <rect
                x="0"
                y="0"
                width={CELL}
                height={CELL}
                rx="4"
                fill={v === 0 || v === "0" ? "#0f172a" : "#1e293b"}
                stroke="#334155"
              />
              <text
                x={CELL / 2}
                y={CELL / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="13"
              >
                {v}
              </text>
            </g>
          ))
        )}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/matrix.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/matrix.tsx apps/web/__tests__/lib/input-visualizer/matrix.test.tsx && git commit -m "feat(visualizer): renderMatrix SVG grid"
```

---

### Task 5: renderTree + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/tree.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/tree.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/tree.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderTree } from "@/lib/input-visualizer/renderers/tree";

describe("renderTree", () => {
  it("renders circles for each non-null value", () => {
    const { container } = render(renderTree([3, 9, 20, null, null, 15, 7]));
    // 5 non-null = 5 circles
    expect(container.querySelectorAll("circle").length).toBe(5);
  });

  it("displays each non-null value as text", () => {
    const { container } = render(renderTree([1, 2, 3]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("1");
    expect(texts).toContain("2");
    expect(texts).toContain("3");
  });

  it("renders empty svg for empty input", () => {
    const { container } = render(renderTree([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("circle").length).toBe(0);
  });

  it("handles single root", () => {
    const { container } = render(renderTree([42]));
    expect(container.querySelectorAll("circle").length).toBe(1);
    expect(container.querySelector("text")?.textContent).toBe("42");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/tree.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/tree.tsx`:

```tsx
import type { JSX } from "react";

const NODE_R = 18;
const LEVEL_H = 60;
const SIBLING_W = 50;

interface Layout {
  id: number;
  value: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function buildLayout(levelOrder: (number | null)[]): Layout[] {
  // Convert level-order to tree nodes with (depth, index-at-depth)
  if (levelOrder.length === 0 || levelOrder[0] === null) return [];
  const nodes: Layout[] = [];
  const queue: { value: number; index: number; depth: number; parentIndex: number }[] = [];
  queue.push({ value: levelOrder[0] as number, index: 0, depth: 0, parentIndex: -1 });
  let i = 1;
  while (queue.length > 0 && i < levelOrder.length) {
    const node = queue.shift()!;
    // left child
    if (i < levelOrder.length && levelOrder[i] !== null) {
      queue.push({
        value: levelOrder[i] as number,
        index: nodes.length + queue.length + 1,
        depth: node.depth + 1,
        parentIndex: node.index,
      });
    }
    i++;
    // right child
    if (i < levelOrder.length && levelOrder[i] !== null) {
      queue.push({
        value: levelOrder[i] as number,
        index: nodes.length + queue.length,
        depth: node.depth + 1,
        parentIndex: node.index,
      });
    }
    i++;
    nodes.push({
      id: node.index,
      value: node.value,
      x: 0, // assigned later
      y: node.depth * LEVEL_H + NODE_R + 10,
    });
  }
  // Flush remaining queue into nodes
  while (queue.length > 0) {
    const node = queue.shift()!;
    nodes.push({
      id: node.index,
      value: node.value,
      x: 0,
      y: node.depth * LEVEL_H + NODE_R + 10,
    });
  }

  // Assign x by depth grouping
  const byDepth = new Map<number, Layout[]>();
  for (const n of nodes) {
    const d = Math.round((n.y - NODE_R - 10) / LEVEL_H);
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }
  const maxDepth = Math.max(...Array.from(byDepth.keys()));
  const totalWidth = Math.pow(2, maxDepth) * SIBLING_W;
  for (const [depth, siblings] of byDepth) {
    const slots = Math.pow(2, depth);
    const slotW = totalWidth / slots;
    siblings.forEach((n, idx) => {
      n.x = slotW / 2 + idx * slotW;
    });
  }
  return nodes;
}

export function renderTree(levelOrder: (number | null)[]): JSX.Element {
  const nodes = buildLayout(levelOrder);
  if (nodes.length === 0) {
    return (
      <figure className="my-3">
        <svg width={1} height={1} role="img" aria-label="Empty tree" />
      </figure>
    );
  }
  const maxX = Math.max(...nodes.map((n) => n.x)) + NODE_R + 10;
  const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_R + 10;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={maxX}
        height={maxY}
        viewBox={`0 0 ${maxX} ${maxY}`}
        role="img"
        aria-label="Tree visualization"
      >
        {nodes.map((n, i) => (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill="#1e293b"
              stroke="#22c55e"
              strokeWidth="2"
            />
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="13"
              fontWeight="600"
            >
              {n.value}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/tree.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/tree.tsx apps/web/__tests__/lib/input-visualizer/tree.test.tsx && git commit -m "feat(visualizer): renderTree SVG with level-order layout"
```

---

### Task 6: renderLinkedList + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/list.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/list.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/list.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderLinkedList } from "@/lib/input-visualizer/renderers/list";

describe("renderLinkedList", () => {
  it("renders one node per value", () => {
    const { container } = render(renderLinkedList([1, 2, 3, 4, 5]));
    expect(container.querySelectorAll("rect").length).toBe(5);
  });

  it("renders n-1 arrows between n nodes", () => {
    const { container } = render(renderLinkedList([1, 2, 3]));
    const arrows = container.querySelectorAll('path[data-role="arrow"]');
    expect(arrows.length).toBe(2);
  });

  it("displays each value as text", () => {
    const { container } = render(renderLinkedList([10, 20, 30]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("10");
    expect(texts).toContain("20");
    expect(texts).toContain("30");
  });

  it("handles empty list", () => {
    const { container } = render(renderLinkedList([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/list.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/list.tsx`:

```tsx
import type { JSX } from "react";

const NODE_W = 56;
const NODE_H = 44;
const ARROW_W = 32;

export function renderLinkedList(values: number[]): JSX.Element {
  const total = Math.max(1, values.length * NODE_W + Math.max(0, values.length - 1) * ARROW_W);
  const h = NODE_H + 10;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={h}
        viewBox={`0 0 ${total} ${h}`}
        role="img"
        aria-label="Linked list visualization"
      >
        {values.map((v, i) => {
          const x = i * (NODE_W + ARROW_W);
          return (
            <g key={i}>
              <rect
                x={x}
                y={5}
                width={NODE_W}
                height={NODE_H}
                rx="6"
                fill="#1e293b"
                stroke="#334155"
              />
              <text
                x={x + NODE_W / 2}
                y={5 + NODE_H / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="14"
              >
                {v}
              </text>
              {i < values.length - 1 && (
                <path
                  data-role="arrow"
                  d={`M ${x + NODE_W} ${5 + NODE_H / 2} L ${x + NODE_W + ARROW_W - 4} ${5 + NODE_H / 2} M ${x + NODE_W + ARROW_W - 8} ${5 + NODE_H / 2 - 4} L ${x + NODE_W + ARROW_W - 4} ${5 + NODE_H / 2} L ${x + NODE_W + ARROW_W - 8} ${5 + NODE_H / 2 + 4}`}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  fill="none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/list.test.tsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/list.tsx apps/web/__tests__/lib/input-visualizer/list.test.tsx && git commit -m "feat(visualizer): renderLinkedList SVG with arrows"
```

---

### Task 7: renderString + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/string.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/string.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/string.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderString } from "@/lib/input-visualizer/renderers/string";

describe("renderString", () => {
  it("renders one cell per character", () => {
    const { container } = render(renderString("abc"));
    expect(container.querySelectorAll("rect").length).toBe(3);
  });

  it("displays each character", () => {
    const { container } = render(renderString("xyz"));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("x");
    expect(texts).toContain("y");
    expect(texts).toContain("z");
  });

  it("handles empty string", () => {
    const { container } = render(renderString(""));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/string.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/string.tsx`:

```tsx
import type { JSX } from "react";

const CELL_W = 36;
const CELL_H = 44;
const GAP = 2;
const LABEL_H = 14;

export function renderString(s: string): JSX.Element {
  const n = s.length;
  const total = Math.max(1, n * (CELL_W + GAP));
  const h = CELL_H + LABEL_H;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={h}
        viewBox={`0 0 ${total} ${h}`}
        role="img"
        aria-label="String visualization"
      >
        {Array.from(s).map((ch, i) => (
          <g key={i} transform={`translate(${i * (CELL_W + GAP)}, 0)`}>
            <rect
              x="0"
              y="0"
              width={CELL_W}
              height={CELL_H}
              rx="4"
              fill="#1e293b"
              stroke="#334155"
            />
            <text
              x={CELL_W / 2}
              y={CELL_H / 2 + 6}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="16"
            >
              {ch}
            </text>
            <text
              x={CELL_W / 2}
              y={CELL_H + 10}
              textAnchor="middle"
              fill="#64748b"
              fontFamily="'Fira Code', monospace"
              fontSize="9"
            >
              {i}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/string.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/string.tsx apps/web/__tests__/lib/input-visualizer/string.test.tsx && git commit -m "feat(visualizer): renderString SVG with char cells + index"
```

---

### Task 8: renderGraph + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/graph.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/graph.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/graph.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderGraph } from "@/lib/input-visualizer/renderers/graph";

describe("renderGraph", () => {
  it("renders one node per adjacency list entry", () => {
    const { container } = render(renderGraph([[2, 4], [1, 3], [2, 4], [1, 3]]));
    expect(container.querySelectorAll("circle").length).toBe(4);
  });

  it("displays each node label (1-indexed)", () => {
    const { container } = render(renderGraph([[2], [1]]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("1");
    expect(texts).toContain("2");
  });

  it("handles empty graph", () => {
    const { container } = render(renderGraph([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("circle").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/graph.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/graph.tsx`:

```tsx
import type { JSX } from "react";

const NODE_R = 18;
const RADIUS = 100;
const SVG_W = 260;
const SVG_H = 220;

export function renderGraph(adjList: number[][]): JSX.Element {
  const n = adjList.length;
  if (n === 0) {
    return (
      <figure className="my-3">
        <svg width={1} height={1} role="img" aria-label="Empty graph" />
      </figure>
    );
  }
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions.push({
      x: cx + RADIUS * Math.cos(angle),
      y: cy + RADIUS * Math.sin(angle),
    });
  }

  return (
    <figure className="my-3">
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="Graph visualization"
      >
        {adjList.map((neighbors, i) =>
          neighbors
            .filter((nb) => nb > i) // draw each edge once (undirected-style)
            .map((nb) => {
              const idx = nb - 1;
              if (idx < 0 || idx >= n) return null;
              const a = positions[i];
              const b = positions[idx];
              return (
                <line
                  key={`e-${i}-${nb}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
              );
            })
        )}
        {positions.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill="#1e293b"
              stroke="#22c55e"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="13"
              fontWeight="600"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/graph.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/graph.tsx apps/web/__tests__/lib/input-visualizer/graph.test.tsx && git commit -m "feat(visualizer): renderGraph SVG circular layout"
```

---

### Task 9: renderStringArray + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/string-array.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/string-array.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/string-array.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderStringArray } from "@/lib/input-visualizer/renderers/string-array";

describe("renderStringArray", () => {
  it("renders one cell per string", () => {
    const { container } = render(renderStringArray(["eat", "tea", "ate"]));
    expect(container.querySelectorAll("rect").length).toBe(3);
  });

  it("displays each string", () => {
    const { container } = render(renderStringArray(["foo", "bar"]));
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(["foo", "bar"]));
  });

  it("handles empty array", () => {
    const { container } = render(renderStringArray([]));
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelectorAll("rect").length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/string-array.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/string-array.tsx`:

```tsx
import type { JSX } from "react";

const CELL_H = 32;
const GAP = 6;
const CHAR_W = 9; // approx
const PAD = 16;

export function renderStringArray(values: string[]): JSX.Element {
  const widths = values.map((v) => Math.max(48, v.length * CHAR_W + PAD));
  const positions: number[] = [];
  let cursor = 0;
  for (const w of widths) {
    positions.push(cursor);
    cursor += w + GAP;
  }
  const totalW = Math.max(1, cursor);
  const totalH = CELL_H + 8;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label="String array visualization"
      >
        {values.map((v, i) => {
          const x = positions[i];
          const w = widths[i];
          return (
            <g key={i}>
              <rect
                x={x}
                y={4}
                width={w}
                height={CELL_H}
                rx="16"
                fill="#1e293b"
                stroke="#334155"
              />
              <text
                x={x + w / 2}
                y={4 + CELL_H / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="13"
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/string-array.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/string-array.tsx apps/web/__tests__/lib/input-visualizer/string-array.test.tsx && git commit -m "feat(visualizer): renderStringArray SVG chip row"
```

---

### Task 10: renderMultiArg (composite) + test

**Files:**
- Create: `apps/web/src/lib/input-visualizer/renderers/multi-arg.tsx`
- Create: `apps/web/__tests__/lib/input-visualizer/multi-arg.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/web/__tests__/lib/input-visualizer/multi-arg.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderMultiArg } from "@/lib/input-visualizer/renderers/multi-arg";

describe("renderMultiArg", () => {
  it("renders a labeled section for each named arg", () => {
    const { container } = render(
      renderMultiArg([
        { name: "nums", value: [2, 7, 11, 15] },
        { name: "target", value: 9 },
      ])
    );
    const labels = Array.from(container.querySelectorAll('[data-role="arg-label"]')).map(
      (el) => el.textContent
    );
    expect(labels).toContain("nums");
    expect(labels).toContain("target");
  });

  it("handles empty parts list", () => {
    const { container } = render(renderMultiArg([]));
    expect(container.querySelectorAll('[data-role="arg-label"]').length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/multi-arg.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create renderer**

Create `apps/web/src/lib/input-visualizer/renderers/multi-arg.tsx`:

```tsx
import type { JSX } from "react";
import { renderArray } from "./array";
import { renderMatrix } from "./matrix";
import { renderString } from "./string";
import { renderStringArray } from "./string-array";
import { renderTree } from "./tree";
import { renderLinkedList } from "./list";

function renderSinglePart(name: string, value: unknown): JSX.Element | null {
  if (typeof value === "string") return renderString(value);
  if (typeof value === "number") {
    return (
      <div className="inline-block rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-sm text-slate-100">
        {value}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <div className="inline-block rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-sm text-slate-100">
        {value ? "true" : "false"}
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) {
      return renderStringArray(value as string[]);
    }
    if (value.every((v) => Array.isArray(v))) {
      return renderMatrix(value as (number | string)[][]);
    }
    if (value.every((v) => typeof v === "number" || v === null)) {
      if (/root|tree/i.test(name)) {
        return renderTree(value as (number | null)[]);
      }
      if (/head|list|node/i.test(name)) {
        return renderLinkedList(
          (value as (number | null)[]).filter((v): v is number => v !== null)
        );
      }
      if (value.every((v) => typeof v === "number")) {
        return renderArray(value as number[]);
      }
      return renderTree(value as (number | null)[]);
    }
  }
  return null;
}

export function renderMultiArg(
  parts: { name: string; value: unknown }[]
): JSX.Element {
  return (
    <figure className="my-3 space-y-2">
      {parts.map((p, i) => {
        const inner = renderSinglePart(p.name, p.value);
        return (
          <div key={i} className="flex flex-col gap-1">
            <span
              data-role="arg-label"
              className="font-mono text-xs text-emerald-400 uppercase tracking-wide"
            >
              {p.name}
            </span>
            {inner ?? (
              <span className="font-mono text-xs text-slate-500">
                [unsupported value]
              </span>
            )}
          </div>
        );
      })}
    </figure>
  );
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
cd apps/web && npx vitest run __tests__/lib/input-visualizer/multi-arg.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/renderers/multi-arg.tsx apps/web/__tests__/lib/input-visualizer/multi-arg.test.tsx && git commit -m "feat(visualizer): renderMultiArg composite with per-arg labels"
```

---

### Task 11: visualizeInput dispatcher (index.tsx)

**Files:**
- Create: `apps/web/src/lib/input-visualizer/index.tsx`

- [ ] **Step 1: Create index.tsx**

```tsx
import type { JSX } from "react";
import { detectInputType } from "./detect";
import { renderArray } from "./renderers/array";
import { renderMatrix } from "./renderers/matrix";
import { renderTree } from "./renderers/tree";
import { renderLinkedList } from "./renderers/list";
import { renderString } from "./renderers/string";
import { renderStringArray } from "./renderers/string-array";
import { renderGraph } from "./renderers/graph";
import { renderMultiArg } from "./renderers/multi-arg";

export { detectInputType } from "./detect";
export type { InputShape } from "./types";

export function visualizeInput(raw: string): JSX.Element | null {
  const shape = detectInputType(raw);
  switch (shape.kind) {
    case "array":
      return renderArray(shape.values);
    case "matrix":
      return renderMatrix(shape.cells);
    case "tree":
      return renderTree(shape.levelOrder);
    case "list":
      return renderLinkedList(shape.values);
    case "string":
      return renderString(shape.value);
    case "string-array":
      return renderStringArray(shape.values);
    case "graph":
      return renderGraph(shape.adjList);
    case "multi-arg":
      return renderMultiArg(shape.parts);
    case "unknown":
    default:
      return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/lib/input-visualizer/index.tsx && git commit -m "feat(visualizer): visualizeInput dispatcher"
```

---

### Task 12: InputVisualizer component + ExampleVisualizations

**Files:**
- Create: `apps/web/src/components/practice/InputVisualizer.tsx`
- Create: `apps/web/src/components/practice/ExampleVisualizations.tsx`

- [ ] **Step 1: Create InputVisualizer.tsx**

```tsx
"use client";

import { visualizeInput } from "@/lib/input-visualizer";

interface InputVisualizerProps {
  input: string;
}

export function InputVisualizer({ input }: InputVisualizerProps) {
  const svg = visualizeInput(input);
  if (!svg) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      {svg}
    </div>
  );
}
```

- [ ] **Step 2: Create ExampleVisualizations.tsx**

```tsx
"use client";

import { InputVisualizer } from "./InputVisualizer";

interface TestCase {
  id: string;
  input: string;
  expected: string;
  isHidden: boolean;
}

interface ExampleVisualizationsProps {
  testCases: TestCase[];
  limit?: number;
}

export function ExampleVisualizations({ testCases, limit = 3 }: ExampleVisualizationsProps) {
  const visible = testCases.filter((t) => !t.isHidden).slice(0, limit);
  if (visible.length === 0) return null;
  return (
    <section className="my-4 space-y-3">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-400">
        Visualized Examples
      </h3>
      {visible.map((tc, i) => (
        <div key={tc.id} className="space-y-1">
          <div className="font-mono text-[11px] text-slate-500">Example {i + 1}</div>
          <InputVisualizer input={tc.input} />
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/components/practice/InputVisualizer.tsx apps/web/src/components/practice/ExampleVisualizations.tsx && git commit -m "feat(practice): InputVisualizer + ExampleVisualizations components"
```

---

### Task 13: Wire ExampleVisualizations into practice page

**Files:**
- Modify: `apps/web/src/app/practice/[slug]/page.tsx`

- [ ] **Step 1: Find the description rendering block**

```bash
grep -n "ReactMarkdown\|problem.description\|testCases" "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\apps\web\src\app\practice\[slug]\page.tsx" | head -10
```

Identify where `problem.description` is rendered (via `ReactMarkdown`).

- [ ] **Step 2: Add import + mount ExampleVisualizations**

At the top of `apps/web/src/app/practice/[slug]/page.tsx`, add import:

```tsx
import { ExampleVisualizations } from "@/components/practice/ExampleVisualizations";
```

Find the closing `</ReactMarkdown>` (or equivalent) in the left pane / problem description area and add **right after it**:

```tsx
{problem.testCases && problem.testCases.length > 0 && (
  <ExampleVisualizations testCases={problem.testCases} />
)}
```

Exact location depends on current JSX structure — place it after the description but before submission-related UI (if any in the same pane).

- [ ] **Step 3: Start dev server and manually verify**

```bash
cd apps/web && npm run dev
```

Navigate to:
- `http://localhost:3001/practice/two-sum` — should show array visualization
- `http://localhost:3001/practice/invert-binary-tree` — should show tree visualization
- `http://localhost:3001/practice/rotate-image` — should show matrix visualization
- `http://localhost:3001/practice/merge-two-sorted-lists` — should show linked list
- `http://localhost:3001/practice/valid-anagram` — should show strings

Verify SVGs render, no console errors, looks reasonable.

- [ ] **Step 4: Commit**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git add apps/web/src/app/practice/[slug]/page.tsx && git commit -m "feat(practice): mount ExampleVisualizations in problem detail page"
```

---

## Phase 3: Final verification + push

### Task 14: Full test suite + push

- [ ] **Step 1: Run all unit tests**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\apps\web" && npx vitest run
```

Expected: all previous tests (93) pass + new tests (~35):
- 5 walk-through tests
- 10 detect tests
- 4 array + 3 matrix + 4 tree + 4 list + 3 string + 3 graph + 3 string-array + 2 multi-arg = 26 renderer tests
- Total new: ~31 new tests → grand total ~124

- [ ] **Step 2: Run executor unit tests (should be unchanged)**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\services\executor" && npx vitest run
```

Expected: 37/37 PASS (unchanged).

- [ ] **Step 3: Push**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git push
```

---

## Summary

**Total tasks:** 14

- Task 1 — concrete walkthrough directive (prompt engineering)
- Tasks 2–11 — input visualizer library (types, detect, 7 renderers, dispatcher)
- Task 12 — React wrapper components
- Task 13 — integrate into practice page
- Task 14 — verify + push

**Key checkpoints:**

1. After Task 1 — AI gives concrete walkthrough for BEGINNER/INTERMEDIATE first messages
2. After Task 11 — `visualizeInput()` works for all 7 shape types + unknown
3. After Task 13 — Every problem page shows up to 3 visualized examples

**Self-review notes:**

- ✅ Spec Feature 1 (walkthrough directive) → Task 1 with tests for all 4 levels + non-Socratic phase
- ✅ Spec Feature 2 Tier 1 (array/matrix/tree/string) → Tasks 3, 4, 5, 7
- ✅ Spec Feature 2 Tier 2 (list/graph/string-array) → Tasks 6, 8, 9
- ✅ Spec Feature 2 Tier 3 (multi-arg) → Task 10
- ✅ Extensibility (new renderer = new file + detect case) → Tasks 2 + 11 make this pattern explicit
- ✅ Unknown fallback → `visualizeInput` returns null → `InputVisualizer` renders nothing
- ✅ Placement in problem description → Tasks 12, 13
- ✅ Type consistency: InputShape shape is stable from Task 2 through Task 11
- ✅ Tests for detect + every renderer + walkthrough behavior
- ✅ No placeholders
