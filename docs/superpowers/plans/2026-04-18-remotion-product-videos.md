# Remotion Product Videos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two Remotion-rendered product videos (Hero 40s + Walkthrough 2:35) inside a new `apps/video/` workspace, sharing scene components and reusing existing Input Visualizer renderers.

**Architecture:** New npm workspace `apps/video/` with Remotion 4.x. Two compositions (`Hero`, `Walkthrough`) registered in `Root.tsx`, built from 13 scene components, 6 UI micro-components, 3 fixture files, and direct imports of `renderArray` etc. from `apps/web/src/lib/input-visualizer/`. All styling via inline styles driven by a `theme/colors.ts` token file — no Tailwind in the video workspace. Render via `npx remotion render` locally.

**Tech Stack:** Remotion 4.x, React 19, TypeScript, Vitest (fixtures only), `@remotion/google-fonts`, ffmpeg (shipped with Remotion for output encoding).

**Spec:** `docs/superpowers/specs/2026-04-18-remotion-product-videos-design.md`

---

## File Structure

```
apps/video/
├── package.json                              # workspace manifest
├── tsconfig.json                             # extends tsconfig.base if any, else standalone
├── remotion.config.ts                        # codec/fps/public dir
├── vitest.config.ts                          # for fixture smoke test
├── README.md                                 # how to preview/render + BGM replacement note
├── src/
│   ├── index.ts                              # registerRoot(Root)
│   ├── Root.tsx                              # composition registry
│   ├── compositions/
│   │   ├── Hero.tsx                          # 40s composition, stitches scenes
│   │   └── Walkthrough.tsx                   # 155s composition with <Audio>
│   ├── scenes/
│   │   ├── HookKineticText.tsx
│   │   ├── SocraticChat.tsx
│   │   ├── BeginnerWalkthrough.tsx           # imports renderArray from apps/web
│   │   ├── SuggestionChipsReveal.tsx
│   │   ├── PracticePageOpen.tsx
│   │   ├── PhaseTransitionKnowledge.tsx
│   │   ├── MonacoTyping.tsx
│   │   ├── SubmissionAccepted.tsx
│   │   ├── SkillTreeMastery.tsx
│   │   ├── DailyRecommendation.tsx
│   │   ├── PainStatement.tsx
│   │   ├── Thesis.tsx
│   │   └── Outro.tsx
│   ├── ui/
│   │   ├── ChatBubble.tsx
│   │   ├── ChipPill.tsx
│   │   ├── MacWindow.tsx
│   │   ├── CodeLine.tsx
│   │   ├── Caption.tsx
│   │   └── ConceptNode.tsx
│   ├── fixtures/
│   │   ├── two-sum.ts                        # frozen problem snapshot
│   │   ├── concepts.ts                       # 22 concepts with mastery progression
│   │   └── walkthrough-script.ts             # exact chat messages + frame timings
│   ├── theme/
│   │   ├── colors.ts                         # mirrors apps/web tokens
│   │   └── typography.ts                     # Fira Code / Fira Sans loaders
│   └── animations/
│       ├── typeLetter.ts                     # letter-by-letter typing helper
│       ├── bubbleIn.ts                       # spring entrance
│       └── barFill.ts                        # interpolated width fill
├── public/
│   └── bgm.mp3                               # placeholder silent (will be replaced)
└── __tests__/
    └── fixtures/
        └── two-sum.shape.test.ts             # smoke test for TestCase shape
```

Root-level changes:

- `package.json` root: add `apps/video` to `workspaces`, add `video:preview`, `video:render:hero`, `video:render:walkthrough` scripts
- `tsconfig.json` root (if exists): no changes needed (workspace has own config)

---

## Phase 1 — Scaffold (Tasks 1-3)

### Task 1: Create `apps/video/` workspace + install Remotion

**Files:**
- Create: `apps/video/package.json`
- Create: `apps/video/tsconfig.json`
- Create: `apps/video/remotion.config.ts`
- Create: `apps/video/src/index.ts`
- Create: `apps/video/src/Root.tsx`
- Create: `apps/video/.gitignore`
- Create: `apps/video/public/.gitkeep`
- Modify: root `package.json` (add workspace + scripts)

- [ ] **Step 1: Create `apps/video/package.json`**

```json
{
  "name": "@skill/video",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "preview": "remotion studio src/index.ts",
    "render:hero": "remotion render src/index.ts Hero out/hero.mp4",
    "render:walkthrough": "remotion render src/index.ts Walkthrough out/walkthrough.mp4",
    "test": "vitest run"
  },
  "dependencies": {
    "@remotion/bundler": "^4.0.0",
    "@remotion/cli": "^4.0.0",
    "@remotion/google-fonts": "^4.0.0",
    "@remotion/renderer": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "remotion": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `apps/video/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowJs": false,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "__tests__", "remotion.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 3: Create `apps/video/remotion.config.ts`**

```typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setPublicDir("public");
Config.setConcurrency(4);
```

- [ ] **Step 4: Create `apps/video/src/index.ts`**

```typescript
import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
```

- [ ] **Step 5: Create `apps/video/src/Root.tsx` skeleton**

```tsx
import { Composition } from "remotion";

export const Root = () => {
  return (
    <>
      {/* Compositions registered in Tasks 20-21 */}
    </>
  );
};
```

- [ ] **Step 6: Create `apps/video/.gitignore`**

```
node_modules
out
.DS_Store
```

- [ ] **Step 7: Create `apps/video/public/.gitkeep`**

```
```

(empty file; keeps the dir under version control until bgm.mp3 lands)

- [ ] **Step 8: Add `apps/video` to root `package.json` workspaces**

Open root `package.json`. Locate the `workspaces` array. Add `"apps/video"` to it. Also add these scripts to the root `scripts` object:

```json
{
  "video:preview": "npm run preview --workspace=apps/video",
  "video:render:hero": "npm run render:hero --workspace=apps/video",
  "video:render:walkthrough": "npm run render:walkthrough --workspace=apps/video"
}
```

(keep all existing scripts intact; only add these 3)

- [ ] **Step 9: Install dependencies from repo root**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer"
npm install
```

Expected: packages install under `node_modules/` (hoisted), new `apps/video/node_modules` may appear with workspace-specific bins. No errors.

- [ ] **Step 10: Smoke check — Remotion Studio boots**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && timeout 15 npm run video:preview || true
```

Expected: log shows `Server ready — Studio is running on http://localhost:3000`. The empty Root will show "No compositions" — that's fine for now. Ctrl+C.

- [ ] **Step 11: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video package.json package-lock.json && git commit -m "feat(video): scaffold apps/video Remotion workspace"
```

---

### Task 2: Theme tokens + typography

**Files:**
- Create: `apps/video/src/theme/colors.ts`
- Create: `apps/video/src/theme/typography.ts`

- [ ] **Step 1: Create `apps/video/src/theme/colors.ts`**

```typescript
// Mirrors apps/web Tailwind tokens for visual consistency.
export const colors = {
  bg: "#0f172a",          // slate-900 (page background)
  card: "#1e293b",        // slate-800 (card surface)
  cardAlt: "#0b1222",     // deeper alt
  border: "#334155",      // slate-700
  borderSoft: "#1e293b",
  emerald: "#22c55e",     // primary accent
  emeraldSoft: "#064e3b", // accent bg fill
  amber: "#f59e0b",       // mastery-mid
  red: "#ef4444",
  slate: "#94a3b8",       // slate-400 (body text)
  slateLight: "#cbd5e1",  // slate-300
  slateDim: "#64748b",    // slate-500 (muted)
  slateDimmer: "#475569", // slate-600
  text: "#f8fafc",        // slate-50 (primary text)
  blue: "#3b82f6",        // for user chat bubble (like chat-message.tsx)
} as const;

export type ColorToken = keyof typeof colors;
```

- [ ] **Step 2: Create `apps/video/src/theme/typography.ts`**

```typescript
import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";
import { loadFont as loadFiraSans } from "@remotion/google-fonts/FiraSans";

// Trigger font fetch at module load — Remotion waits for this before rendering.
const firaCode = loadFiraCode();
const firaSans = loadFiraSans();

export const fonts = {
  mono: firaCode.fontFamily,   // e.g. "'Fira Code', monospace"
  sans: firaSans.fontFamily,   // e.g. "'Fira Sans', sans-serif"
} as const;

export const type = {
  h1: { fontFamily: fonts.mono, fontSize: 96, fontWeight: 700, lineHeight: 1.05 },
  h2: { fontFamily: fonts.mono, fontSize: 64, fontWeight: 700, lineHeight: 1.1 },
  h3: { fontFamily: fonts.mono, fontSize: 40, fontWeight: 600, lineHeight: 1.2 },
  body: { fontFamily: fonts.sans, fontSize: 26, fontWeight: 400, lineHeight: 1.4 },
  bodySmall: { fontFamily: fonts.sans, fontSize: 20, fontWeight: 400, lineHeight: 1.35 },
  caption: { fontFamily: fonts.sans, fontSize: 22, fontWeight: 500, lineHeight: 1.3 },
  code: { fontFamily: fonts.mono, fontSize: 22, fontWeight: 400, lineHeight: 1.4 },
  codeSmall: { fontFamily: fonts.mono, fontSize: 16, fontWeight: 400, lineHeight: 1.4 },
  label: { fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, lineHeight: 1.2, letterSpacing: 1 },
} as const;
```

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/theme/ && git commit -m "feat(video): theme tokens + Google Fonts loaders"
```

---

### Task 3: UI micro-components

**Files:**
- Create: `apps/video/src/ui/ChatBubble.tsx`
- Create: `apps/video/src/ui/ChipPill.tsx`
- Create: `apps/video/src/ui/MacWindow.tsx`
- Create: `apps/video/src/ui/CodeLine.tsx`
- Create: `apps/video/src/ui/Caption.tsx`
- Create: `apps/video/src/ui/ConceptNode.tsx`

- [ ] **Step 1: Create `apps/video/src/ui/ChatBubble.tsx`**

```tsx
import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface ChatBubbleProps {
  role: "assistant" | "user";
  children: ReactNode;
  phaseTag?: string;
  maxWidth?: number;
  style?: CSSProperties;
}

export function ChatBubble({ role, children, phaseTag, maxWidth = 700, style }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", ...style }}>
      <div
        style={{
          maxWidth,
          padding: "18px 22px",
          borderRadius: 14,
          background: isUser ? colors.blue : colors.card,
          color: isUser ? "#fff" : colors.text,
          ...type.body,
          lineHeight: 1.55,
        }}
      >
        {phaseTag && !isUser && (
          <div style={{ ...type.label, color: colors.emerald, marginBottom: 6 }}>
            {phaseTag}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/video/src/ui/ChipPill.tsx`**

```tsx
import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface ChipPillProps {
  children: ReactNode;
  accent?: boolean;
  style?: CSSProperties;
}

export function ChipPill({ children, accent = false, style }: ChipPillProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        border: `1px solid ${accent ? colors.emerald : colors.border}`,
        background: accent ? colors.emeraldSoft : colors.card,
        color: accent ? colors.emerald : colors.text,
        ...type.bodySmall,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `apps/video/src/ui/MacWindow.tsx`**

```tsx
import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface MacWindowProps {
  title: string;
  titleColor?: string;
  width?: number;
  height?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function MacWindow({ title, titleColor = colors.slate, width, height, children, style }: MacWindowProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: colors.card,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ef4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#f59e0b" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#22c55e" }} />
        <div style={{ ...type.codeSmall, color: titleColor, marginLeft: 10 }}>{title}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create `apps/video/src/ui/CodeLine.tsx`**

```tsx
import { CSSProperties } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

type Token =
  | { kind: "plain"; text: string }
  | { kind: "keyword"; text: string }
  | { kind: "string"; text: string }
  | { kind: "comment"; text: string }
  | { kind: "ident"; text: string }
  | { kind: "number"; text: string };

interface CodeLineProps {
  tokens: Token[];
  indent?: number; // in "levels" (4 spaces each)
  style?: CSSProperties;
}

const tokenColors: Record<Token["kind"], string> = {
  plain: colors.text,
  keyword: "#c084fc",    // purple-400
  string: "#fbbf24",     // amber-300
  comment: colors.slateDim,
  ident: "#67e8f9",      // cyan-300
  number: "#fda4af",     // rose-300
};

export function CodeLine({ tokens, indent = 0, style }: CodeLineProps) {
  return (
    <div style={{ ...type.code, paddingLeft: indent * 32, whiteSpace: "pre", ...style }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: tokenColors[t.kind] }}>
          {t.text}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `apps/video/src/ui/Caption.tsx`**

```tsx
import { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface CaptionProps {
  children: ReactNode;
  position?: "bottom" | "top";
  style?: CSSProperties;
}

export function Caption({ children, position = "bottom", style }: CaptionProps) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [position]: 72,
          display: "flex",
          justifyContent: "center",
          ...style,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            padding: "14px 28px",
            background: "rgba(15,23,42,0.88)",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            color: colors.text,
            textAlign: "center",
            ...type.caption,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 6: Create `apps/video/src/ui/ConceptNode.tsx`**

```tsx
import { CSSProperties } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

type MasteryLevel = "untouched" | "learning" | "mastered";

interface ConceptNodeProps {
  name: string;
  mastery: number; // 0..1
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

function levelFor(mastery: number): MasteryLevel {
  if (mastery >= 0.7) return "mastered";
  if (mastery >= 0.4) return "learning";
  return "untouched";
}

const levelStyles: Record<MasteryLevel, { bg: string; border: string; text: string }> = {
  mastered: { bg: colors.emeraldSoft, border: colors.emerald, text: colors.emerald },
  learning: { bg: "#451a03", border: colors.amber, text: colors.amber },
  untouched: { bg: colors.card, border: colors.border, text: colors.slate },
};

export function ConceptNode({ name, mastery, x, y, width = 180, height = 54, style }: ConceptNodeProps) {
  const level = levelFor(mastery);
  const s = levelStyles[level];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 10,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        padding: "8px 12px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ ...type.codeSmall, color: s.text, fontWeight: 600, textAlign: "center" }}>{name}</div>
      <div style={{ ...type.label, color: colors.slateDim, textAlign: "center", fontSize: 11 }}>
        {Math.round(mastery * 100)}%
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/ui/ && git commit -m "feat(video): UI micro-components (ChatBubble, ChipPill, MacWindow, CodeLine, Caption, ConceptNode)"
```

---

## Phase 2 — Fixtures (Tasks 4-5)

### Task 4: Fixtures with smoke test

**Files:**
- Create: `apps/video/src/fixtures/two-sum.ts`
- Create: `apps/video/src/fixtures/concepts.ts`
- Create: `apps/video/vitest.config.ts`
- Create: `apps/video/__tests__/fixtures/two-sum.shape.test.ts`

- [ ] **Step 1: Create `apps/video/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Write failing test `apps/video/__tests__/fixtures/two-sum.shape.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { twoSum } from "../../src/fixtures/two-sum";

describe("fixtures/two-sum", () => {
  it("has required problem fields", () => {
    expect(twoSum.slug).toBe("two-sum");
    expect(twoSum.title).toBeTypeOf("string");
    expect(twoSum.difficulty).toBe("EASY");
    expect(twoSum.description).toBeTypeOf("string");
    expect(twoSum.description.length).toBeGreaterThan(20);
  });

  it("has at least 2 non-hidden test cases shaped like DB rows", () => {
    expect(Array.isArray(twoSum.testCases)).toBe(true);
    expect(twoSum.testCases.length).toBeGreaterThanOrEqual(2);
    for (const tc of twoSum.testCases) {
      expect(tc.id).toBeTypeOf("string");
      expect(tc.input).toBeTypeOf("string");
      expect(tc.expected).toBeTypeOf("string");
    }
  });

  it("first test case is the classic [2,7,11,15] target=9 demo", () => {
    const first = twoSum.testCases[0];
    expect(first.input).toContain("[2,7,11,15]");
    expect(first.input).toContain("target");
    expect(first.expected).toContain("0");
    expect(first.expected).toContain("1");
  });
});
```

- [ ] **Step 3: Run test to verify failure**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video" && npx vitest run __tests__/fixtures/two-sum.shape.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Create `apps/video/src/fixtures/two-sum.ts`**

```typescript
export interface FixtureTestCase {
  id: string;
  input: string;
  expected: string;
}

export interface FixtureProblem {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  testCases: FixtureTestCase[];
  concepts: string[];
}

/**
 * Frozen snapshot of the Two Sum problem. Mirrors what comes from
 * `getBySlug` in apps/web (shape only, not a runtime fetch). Drift is
 * acceptable — update this file manually when the seed changes.
 */
export const twoSum: FixtureProblem = {
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  description:
    "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  testCases: [
    {
      id: "tc-1",
      input: "nums = [2,7,11,15], target = 9",
      expected: "[0,1]",
    },
    {
      id: "tc-2",
      input: "nums = [3,2,4], target = 6",
      expected: "[1,2]",
    },
    {
      id: "tc-3",
      input: "nums = [3,3], target = 6",
      expected: "[0,1]",
    },
  ],
  concepts: ["Array", "Hash Table"],
};
```

- [ ] **Step 5: Run test to verify pass**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video" && npx vitest run __tests__/fixtures/two-sum.shape.test.ts
```

Expected: 3/3 PASS.

- [ ] **Step 6: Create `apps/video/src/fixtures/concepts.ts`**

```typescript
export interface FixtureConcept {
  id: string;
  name: string;
  mastery: number; // 0..1 — progression applied during Skill Tree animation
  col: number;     // grid column (0-based)
  row: number;     // grid row (0-based)
}

/**
 * 22 concepts arranged on a 5×5 grid (with gaps). Each concept has two
 * mastery values: starting state and final state. The scene interpolates.
 */
export interface ConceptWithProgression extends FixtureConcept {
  startMastery: number;
  endMastery: number;
}

export const concepts: ConceptWithProgression[] = [
  { id: "array",        name: "Array",         mastery: 0.9,  startMastery: 0.40, endMastery: 0.90, col: 0, row: 0 },
  { id: "two-pointer",  name: "Two Pointer",   mastery: 0.8,  startMastery: 0.30, endMastery: 0.80, col: 1, row: 0 },
  { id: "sliding",      name: "Sliding Window",mastery: 0.6,  startMastery: 0.10, endMastery: 0.60, col: 2, row: 0 },
  { id: "binary-search",name: "Binary Search", mastery: 0.7,  startMastery: 0.20, endMastery: 0.70, col: 3, row: 0 },
  { id: "hash-table",   name: "Hash Table",    mastery: 0.85, startMastery: 0.30, endMastery: 0.85, col: 4, row: 0 },
  { id: "stack",        name: "Stack",         mastery: 0.75, startMastery: 0.45, endMastery: 0.75, col: 0, row: 1 },
  { id: "monotonic",    name: "Monotonic Stk", mastery: 0.4,  startMastery: 0.15, endMastery: 0.40, col: 1, row: 1 },
  { id: "linked-list",  name: "Linked List",   mastery: 0.65, startMastery: 0.30, endMastery: 0.65, col: 2, row: 1 },
  { id: "string",       name: "String",        mastery: 0.80, startMastery: 0.40, endMastery: 0.80, col: 3, row: 1 },
  { id: "recursion",    name: "Recursion",     mastery: 0.55, startMastery: 0.20, endMastery: 0.55, col: 4, row: 1 },
  { id: "tree",         name: "Tree",          mastery: 0.70, startMastery: 0.25, endMastery: 0.70, col: 0, row: 2 },
  { id: "bst",          name: "BST",           mastery: 0.60, startMastery: 0.20, endMastery: 0.60, col: 1, row: 2 },
  { id: "trie",         name: "Trie",          mastery: 0.45, startMastery: 0.10, endMastery: 0.45, col: 2, row: 2 },
  { id: "heap",         name: "Heap",          mastery: 0.50, startMastery: 0.20, endMastery: 0.50, col: 3, row: 2 },
  { id: "graph",        name: "Graph",         mastery: 0.40, startMastery: 0.10, endMastery: 0.40, col: 4, row: 2 },
  { id: "bfs-dfs",      name: "BFS / DFS",     mastery: 0.55, startMastery: 0.15, endMastery: 0.55, col: 0, row: 3 },
  { id: "union-find",   name: "Union Find",    mastery: 0.35, startMastery: 0.05, endMastery: 0.35, col: 1, row: 3 },
  { id: "dp-1d",        name: "DP 1D",         mastery: 0.60, startMastery: 0.25, endMastery: 0.60, col: 2, row: 3 },
  { id: "dp-2d",        name: "DP 2D",         mastery: 0.40, startMastery: 0.10, endMastery: 0.40, col: 3, row: 3 },
  { id: "greedy",       name: "Greedy",        mastery: 0.50, startMastery: 0.20, endMastery: 0.50, col: 4, row: 3 },
  { id: "interval",     name: "Interval",      mastery: 0.45, startMastery: 0.15, endMastery: 0.45, col: 1, row: 4 },
  { id: "matrix",       name: "Matrix",        mastery: 0.55, startMastery: 0.20, endMastery: 0.55, col: 3, row: 4 },
];
```

- [ ] **Step 7: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/vitest.config.ts apps/video/__tests__ apps/video/src/fixtures/ && git commit -m "feat(video): fixtures for Two Sum + 22 concepts with mastery progression + smoke test"
```

---

### Task 5: Walkthrough script fixture

**Files:**
- Create: `apps/video/src/fixtures/walkthrough-script.ts`

- [ ] **Step 1: Create `apps/video/src/fixtures/walkthrough-script.ts`**

```typescript
/**
 * Frame-based timing for the Walkthrough composition.
 * At 30 fps: 1 second = 30 frames.
 *
 * Each entry specifies when a chat line should start appearing. The scene
 * component computes typing progress from the current frame.
 */

export interface ChatTurn {
  role: "assistant" | "user";
  text: string;
  startFrame: number;  // relative to scene start
  typingDurationFrames: number; // how long the letter-by-letter typing takes
  phaseTag?: string;
}

/** BeginnerWalkthrough scene chat (0:50–1:15 of Walkthrough, 25s = 750 frames). */
export const beginnerWalkthroughTurns: ChatTurn[] = [
  {
    role: "assistant",
    phaseTag: "[S]",
    text:
      "Let's forget algorithms for a moment. Take nums = [2, 7, 11, 15], target = 9. Point at 2 — what number do you need to find to sum to 9?",
    startFrame: 0,
    typingDurationFrames: 180, // 6s to type
  },
  {
    role: "user",
    text: "7?",
    startFrame: 210,
    typingDurationFrames: 12,
  },
  {
    role: "assistant",
    phaseTag: "[S]",
    text: "Exactly. Now — how would you REMEMBER which numbers you've already looked at?",
    startFrame: 260,
    typingDurationFrames: 120,
  },
  {
    role: "user",
    text: "Maybe a hash table?",
    startFrame: 420,
    typingDurationFrames: 60,
  },
  {
    role: "assistant",
    phaseTag: "[K]",
    text: "Perfect pattern-recognition. Hash Table lets you answer \"have I seen 7 before?\" in O(1).",
    startFrame: 530,
    typingDurationFrames: 180,
  },
];

/** PhaseTransitionKnowledge scene chat (1:15-1:40, 25s = 750 frames). */
export const knowledgePhaseTurns: ChatTurn[] = [
  {
    role: "assistant",
    phaseTag: "[K]",
    text:
      "So for each number x in nums, you ask: has `target - x` already been stored? If yes, return both indices.",
    startFrame: 0,
    typingDurationFrames: 210,
  },
  {
    role: "user",
    text: "Got it. Let me code this.",
    startFrame: 270,
    typingDurationFrames: 75,
  },
  {
    role: "assistant",
    phaseTag: "[I]",
    text: "Go. I'll review when you're done.",
    startFrame: 390,
    typingDurationFrames: 90,
  },
];
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/fixtures/walkthrough-script.ts && git commit -m "feat(video): walkthrough chat script with frame timings"
```

---

## Phase 3 — Animation helpers (Task 6)

### Task 6: Animation helpers

**Files:**
- Create: `apps/video/src/animations/typeLetter.ts`
- Create: `apps/video/src/animations/bubbleIn.ts`
- Create: `apps/video/src/animations/barFill.ts`

- [ ] **Step 1: Create `apps/video/src/animations/typeLetter.ts`**

```typescript
/**
 * Given a target string and the current progress (0..1), return the prefix
 * that should be visible. Used for letter-by-letter typing animations.
 *
 * Example: typeUpTo("hello", 0.4) → "he" (2 of 5 chars)
 */
export function typeUpTo(fullText: string, progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const count = Math.floor(fullText.length * clamped);
  return fullText.slice(0, count);
}

/**
 * Compute typing progress given the current frame within a scene.
 * Returns 0 before start, 1 after end, linear interpolation in between.
 */
export function typingProgress(
  frame: number,
  startFrame: number,
  durationFrames: number
): number {
  if (frame <= startFrame) return 0;
  if (frame >= startFrame + durationFrames) return 1;
  return (frame - startFrame) / durationFrames;
}
```

- [ ] **Step 2: Create `apps/video/src/animations/bubbleIn.ts`**

```typescript
import { spring, SpringConfig } from "remotion";

/**
 * Spring-driven entrance animation for a chat bubble or card.
 * Returns a number in roughly [0, 1] that can drive opacity, translateY, or scale.
 */
export function bubbleIn(params: {
  frame: number;
  startFrame: number;
  fps: number;
  config?: Partial<SpringConfig>;
}): number {
  const { frame, startFrame, fps, config } = params;
  const localFrame = Math.max(0, frame - startFrame);
  return spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.8, ...config },
  });
}
```

- [ ] **Step 3: Create `apps/video/src/animations/barFill.ts`**

```typescript
import { interpolate } from "remotion";

/**
 * Interpolates a mastery bar fill from startPct → endPct over a window.
 * Returns a percentage (0..1).
 */
export function barFill(params: {
  frame: number;
  startFrame: number;
  durationFrames: number;
  startPct: number;
  endPct: number;
}): number {
  const { frame, startFrame, durationFrames, startPct, endPct } = params;
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [startPct, endPct],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/animations/ && git commit -m "feat(video): animation helpers (typeLetter, bubbleIn, barFill)"
```

---

## Phase 4 — Hero-exclusive scenes (Tasks 7-8)

### Task 7: HookKineticText scene

**Files:**
- Create: `apps/video/src/scenes/HookKineticText.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/HookKineticText.tsx`**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 0:00–0:03 (90 frames @ 30fps)
 * Displays the hook in two tempo-split lines:
 *   "Stop memorizing."  (frames 0-45)
 *   "Start thinking."   (frames 30-90, overlaps)
 */
export function HookKineticText() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const line1Opacity = interpolate(frame, [0, 12, 45, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const line1Y = interpolate(frame, [0, 15], [30, 0], { extrapolateRight: "clamp" });

  const line2Opacity = interpolate(frame, [30, 45, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [30, 48], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...type.h1, color: colors.slate, opacity: line1Opacity, transform: `translateY(${line1Y}px)` }}>
          Stop memorizing.
        </div>
        <div
          style={{
            ...type.h1,
            color: colors.emerald,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            marginTop: 16,
          }}
        >
          Start thinking.
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Register in Root.tsx temporarily to preview**

Open `apps/video/src/Root.tsx`. Replace its body with:

```tsx
import { Composition } from "remotion";
import { HookKineticText } from "./scenes/HookKineticText";

export const Root = () => {
  return (
    <>
      <Composition
        id="HookKineticTextPreview"
        component={HookKineticText}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

- [ ] **Step 3: Preview**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && timeout 30 npm run video:preview || true
```

Open browser to `http://localhost:3000` → click `HookKineticTextPreview`. Expected: "Stop memorizing." fades in, then "Start thinking." fades under it. Total 3s. Ctrl+C when verified.

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/HookKineticText.tsx apps/video/src/Root.tsx && git commit -m "feat(video): HookKineticText scene"
```

---

### Task 8: Outro scene

**Files:**
- Create: `apps/video/src/scenes/Outro.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/Outro.tsx`**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * Closing card — ~210 frames (7s) at 30 fps.
 * Fades in logo + URL + CTA, holds, then fades out.
 */
export function Outro() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const y = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity, transform: `translateY(${y}px)` }}>
        <div style={{ ...type.h1, color: colors.text }}>
          AI Pair Programmer
        </div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 24 }}>
          Socratic AI coding tutor · beginner-friendly
        </div>
        <div style={{ ...type.code, color: colors.emerald, marginTop: 40 }}>
          github.com/chadcoco1444/ai-pair-programmer
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/Outro.tsx && git commit -m "feat(video): Outro scene"
```

---

## Phase 5 — Walkthrough-exclusive scenes (Tasks 9-10)

### Task 9: PainStatement scene

**Files:**
- Create: `apps/video/src/scenes/PainStatement.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/PainStatement.tsx`**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { typeUpTo, typingProgress } from "../animations/typeLetter";

/**
 * 0:00–0:15 of Walkthrough (450 frames).
 * Typewriter-style pain statement on black.
 */
export function PainStatement() {
  const frame = useCurrentFrame();
  const statLine = "70% of self-taught developers";
  const tailLine = "quit LeetCode within a month.";

  const statProgress = typingProgress(frame, 30, 120);
  const tailProgress = typingProgress(frame, 180, 150);

  const cursorBlink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  const tailVisible = frame >= 180;

  const fadeOutOpacity = interpolate(frame, [400, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ background: colors.bg, alignItems: "center", justifyContent: "center", opacity: fadeOutOpacity }}
    >
      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        <div style={{ ...type.h2, color: colors.slate }}>
          {typeUpTo(statLine, statProgress)}
          {!tailVisible && <span style={{ opacity: cursorBlink, color: colors.emerald }}>|</span>}
        </div>
        <div style={{ ...type.h2, color: colors.text, marginTop: 24 }}>
          {typeUpTo(tailLine, tailProgress)}
          {tailVisible && tailProgress < 1 && (
            <span style={{ opacity: cursorBlink, color: colors.emerald }}>|</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/PainStatement.tsx && git commit -m "feat(video): PainStatement scene"
```

---

### Task 10: Thesis scene

**Files:**
- Create: `apps/video/src/scenes/Thesis.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/Thesis.tsx`**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 0:15–0:25 of Walkthrough (300 frames).
 * Thesis statement — "The AI should ask questions. Not hand you answers."
 */
export function Thesis() {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [0, 24, 260, 290], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [0, 24], [30, 0], { extrapolateRight: "clamp" });

  const line2Opacity = interpolate(frame, [60, 90, 260, 290], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [60, 90], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            ...type.h2,
            color: colors.text,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          The AI should ask questions.
        </div>
        <div
          style={{
            ...type.h2,
            color: colors.emerald,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            marginTop: 24,
          }}
        >
          Not hand you answers.
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/Thesis.tsx && git commit -m "feat(video): Thesis scene"
```

---

## Phase 6 — Shared scenes (Tasks 11-19)

### Task 11: SocraticChat scene (Hero-only variant, short)

**Files:**
- Create: `apps/video/src/scenes/SocraticChat.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/SocraticChat.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChatBubble } from "../ui/ChatBubble";
import { colors } from "../theme/colors";
import { typeUpTo, typingProgress } from "../animations/typeLetter";
import { bubbleIn } from "../animations/bubbleIn";

/**
 * 0:03–0:11 of Hero (240 frames).
 * AI asks, student replies — a compressed Socratic demo.
 */
export function SocraticChat() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const aiText = "What's your first instinct for this problem?";
  const userText = "Brute force: two loops?";

  const aiBubble = bubbleIn({ frame, startFrame: 0, fps });
  const aiProgress = typingProgress(frame, 15, 105);
  const userBubble = bubbleIn({ frame, startFrame: 150, fps });
  const userProgress = typingProgress(frame, 165, 45);

  const tailOpacity = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, padding: "120px 180px", opacity: tailOpacity }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ opacity: aiBubble, transform: `translateY(${(1 - aiBubble) * 24}px)` }}>
          <ChatBubble role="assistant" phaseTag="[S]">
            {typeUpTo(aiText, aiProgress)}
          </ChatBubble>
        </div>
        {frame >= 150 && (
          <div style={{ opacity: userBubble, transform: `translateY(${(1 - userBubble) * 24}px)` }}>
            <ChatBubble role="user">{typeUpTo(userText, userProgress)}</ChatBubble>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/SocraticChat.tsx && git commit -m "feat(video): SocraticChat scene"
```

---

### Task 12: BeginnerWalkthrough scene (imports renderArray)

**Files:**
- Create: `apps/video/src/scenes/BeginnerWalkthrough.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/BeginnerWalkthrough.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChatBubble } from "../ui/ChatBubble";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { typeUpTo, typingProgress } from "../animations/typeLetter";
import { bubbleIn } from "../animations/bubbleIn";
import { renderArray } from "../../../web/src/lib/input-visualizer/renderers/array";
import { beginnerWalkthroughTurns } from "../fixtures/walkthrough-script";

/**
 * Shared scene:
 *   Hero 0:11–0:26 (450 frames @ 30fps) — compressed 3-question walkthrough
 *   Walkthrough 0:50–1:15 (750 frames) — longer version with fuller turns
 *
 * Uses the existing renderArray SVG renderer unmodified.
 */
interface BeginnerWalkthroughProps {
  /** Use "hero" for the 450-frame compressed version, "walk" for 750-frame full. */
  variant: "hero" | "walk";
}

export function BeginnerWalkthrough({ variant }: BeginnerWalkthroughProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrayReveal = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const arrayY = interpolate(frame, [0, 24], [20, 0], { extrapolateRight: "clamp" });

  // Hero variant: show only first 3 turns compressed
  // Walk variant: show all 5 turns at the full script pace
  const turns = variant === "hero" ? beginnerWalkthroughTurns.slice(0, 3) : beginnerWalkthroughTurns;
  const timeScale = variant === "hero" ? 0.6 : 1.0;

  return (
    <AbsoluteFill style={{ background: colors.bg, padding: "60px 100px" }}>
      {/* Top: Input Visualizer */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 30,
          opacity: arrayReveal,
          transform: `translateY(${arrayY}px)`,
        }}
      >
        <div style={{ transform: "scale(1.8)", transformOrigin: "center top" }}>
          {renderArray([2, 7, 11, 15])}
        </div>
      </div>

      <div style={{ ...type.bodySmall, color: colors.slate, textAlign: "center", marginBottom: 30 }}>
        nums = [2, 7, 11, 15], target = 9
      </div>

      {/* Chat turns */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxHeight: 500, overflow: "hidden" }}>
        {turns.map((turn, i) => {
          const scaledStart = Math.round(turn.startFrame * timeScale) + 60;
          const scaledDuration = Math.round(turn.typingDurationFrames * timeScale);
          const bubble = bubbleIn({ frame, startFrame: scaledStart, fps });
          const progress = typingProgress(frame, scaledStart + 6, scaledDuration);
          if (frame < scaledStart) return null;
          return (
            <div key={i} style={{ opacity: bubble, transform: `translateY(${(1 - bubble) * 20}px)` }}>
              <ChatBubble role={turn.role} phaseTag={turn.phaseTag}>
                {typeUpTo(turn.text, progress)}
              </ChatBubble>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Verify the cross-workspace import works**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video" && npx tsc --noEmit
```

Expected: 0 errors (relative `../../../web/src/lib/input-visualizer/renderers/array` should resolve since both workspaces share hoisted `react` types).

If it fails with "Cannot find module" or JSX config mismatch, add the following to `apps/video/tsconfig.json`:

```json
"include": ["src", "__tests__", "remotion.config.ts", "vitest.config.ts", "../web/src/lib/input-visualizer/**/*"]
```

and re-run `npx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/BeginnerWalkthrough.tsx apps/video/tsconfig.json && git commit -m "feat(video): BeginnerWalkthrough scene reusing Input Visualizer renderArray"
```

---

### Task 13: SuggestionChipsReveal scene

**Files:**
- Create: `apps/video/src/scenes/SuggestionChipsReveal.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/SuggestionChipsReveal.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChipPill } from "../ui/ChipPill";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { bubbleIn } from "../animations/bubbleIn";

const CHIPS = [
  "💡 How should I approach this?",
  "🔎 Review my code",
  "🧩 Give me a hint",
  "📖 Explain this concept",
  "⏱️ Time complexity?",
  "🚨 Edge cases?",
];

/**
 * 0:40–0:50 of Walkthrough (300 frames).
 * 6 chips stagger in from below, then hold.
 */
export function SuggestionChipsReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
        opacity: tailOpacity,
      }}
    >
      <div style={{ opacity: headerOpacity, textAlign: "center", marginBottom: 60 }}>
        <div style={{ ...type.h3, color: colors.text }}>Don't know where to start?</div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 14 }}>
          Pick a starter prompt:
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, auto)",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {CHIPS.map((label, i) => {
          const start = 40 + i * 24;
          const enter = bubbleIn({ frame, startFrame: start, fps });
          return (
            <div
              key={label}
              style={{
                opacity: enter,
                transform: `translateY(${(1 - enter) * 20}px)`,
              }}
            >
              <ChipPill accent={i === 0}>{label}</ChipPill>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/SuggestionChipsReveal.tsx && git commit -m "feat(video): SuggestionChipsReveal scene"
```

---

### Task 14: PracticePageOpen scene

**Files:**
- Create: `apps/video/src/scenes/PracticePageOpen.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/PracticePageOpen.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MacWindow } from "../ui/MacWindow";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { renderArray } from "../../../web/src/lib/input-visualizer/renderers/array";
import { twoSum } from "../fixtures/two-sum";

/**
 * 0:25–0:40 of Walkthrough (450 frames).
 * Window animates in, description fades in paragraph by paragraph, Input
 * Visualizer slides up at ~4s mark.
 */
export function PracticePageOpen() {
  const frame = useCurrentFrame();

  const winOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const winScale = interpolate(frame, [0, 30], [0.94, 1], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descOpacity = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vizOpacity = interpolate(frame, [130, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vizY = interpolate(frame, [130, 180], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tailOpacity = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        opacity: tailOpacity,
      }}
    >
      <div style={{ opacity: winOpacity, transform: `scale(${winScale})` }}>
        <MacWindow title="/practice/two-sum" width={1500} titleColor={colors.slate}>
          <div style={{ padding: 30 }}>
            <div style={{ opacity: titleOpacity }}>
              <div style={{ ...type.h3, color: colors.text }}>{twoSum.title}</div>
              <div style={{ display: "inline-block", ...type.label, color: colors.emerald,
                background: colors.emeraldSoft, padding: "4px 12px", borderRadius: 999,
                border: `1px solid ${colors.emerald}`, marginTop: 12 }}>
                {twoSum.difficulty}
              </div>
            </div>
            <div style={{ ...type.body, color: colors.slateLight, marginTop: 26, opacity: descOpacity }}>
              {twoSum.description}
            </div>
            <div style={{ marginTop: 30, opacity: vizOpacity, transform: `translateY(${vizY}px)` }}>
              <div style={{ ...type.label, color: colors.slate, marginBottom: 10 }}>VISUALIZED EXAMPLE</div>
              <div style={{ transform: "scale(1.5)", transformOrigin: "left top" }}>
                {renderArray([2, 7, 11, 15])}
              </div>
            </div>
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/PracticePageOpen.tsx && git commit -m "feat(video): PracticePageOpen scene"
```

---

### Task 15: PhaseTransitionKnowledge scene

**Files:**
- Create: `apps/video/src/scenes/PhaseTransitionKnowledge.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/PhaseTransitionKnowledge.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChatBubble } from "../ui/ChatBubble";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { typeUpTo, typingProgress } from "../animations/typeLetter";
import { bubbleIn } from "../animations/bubbleIn";
import { knowledgePhaseTurns } from "../fixtures/walkthrough-script";

/**
 * 1:15–1:40 of Walkthrough (750 frames).
 * Phase tag animates S → K → I alongside the chat.
 */
export function PhaseTransitionKnowledge() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phaseOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  let phaseLabel = "[S] Socratic";
  let phaseColor = colors.slate;
  if (frame >= 30) { phaseLabel = "[K] Knowledge"; phaseColor = colors.emerald; }
  if (frame >= 420) { phaseLabel = "[I] Iterative"; phaseColor = colors.amber; }

  return (
    <AbsoluteFill style={{ background: colors.bg, padding: "60px 120px" }}>
      <div style={{ textAlign: "center", marginBottom: 40, opacity: phaseOpacity }}>
        <span
          style={{
            ...type.h3,
            color: phaseColor,
            padding: "8px 24px",
            border: `2px solid ${phaseColor}`,
            borderRadius: 999,
            display: "inline-block",
          }}
        >
          {phaseLabel}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {knowledgePhaseTurns.map((turn, i) => {
          const bubble = bubbleIn({ frame, startFrame: turn.startFrame, fps });
          const progress = typingProgress(frame, turn.startFrame + 10, turn.typingDurationFrames);
          if (frame < turn.startFrame) return null;
          return (
            <div key={i} style={{ opacity: bubble, transform: `translateY(${(1 - bubble) * 20}px)` }}>
              <ChatBubble role={turn.role} phaseTag={turn.phaseTag}>
                {typeUpTo(turn.text, progress)}
              </ChatBubble>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/PhaseTransitionKnowledge.tsx && git commit -m "feat(video): PhaseTransitionKnowledge scene"
```

---

### Task 16: MonacoTyping scene

**Files:**
- Create: `apps/video/src/scenes/MonacoTyping.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/MonacoTyping.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MacWindow } from "../ui/MacWindow";
import { CodeLine } from "../ui/CodeLine";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 1:40–2:00 of Walkthrough (600 frames).
 * Simulates typing a Two Sum solution line by line.
 */
type Token = Parameters<typeof CodeLine>[0]["tokens"][number];

interface Line {
  tokens: Token[];
  indent: number;
  revealAt: number; // frame when this line appears
}

const LINES: Line[] = [
  { indent: 0, revealAt: 30,  tokens: [{ kind: "keyword", text: "def " }, { kind: "ident", text: "twoSum" }, { kind: "plain", text: "(nums, target):" }] },
  { indent: 1, revealAt: 90,  tokens: [{ kind: "ident", text: "seen" }, { kind: "plain", text: " = {}" }] },
  { indent: 1, revealAt: 150, tokens: [{ kind: "keyword", text: "for " }, { kind: "ident", text: "i" }, { kind: "plain", text: ", " }, { kind: "ident", text: "x" }, { kind: "keyword", text: " in " }, { kind: "ident", text: "enumerate" }, { kind: "plain", text: "(nums):" }] },
  { indent: 2, revealAt: 220, tokens: [{ kind: "ident", text: "need" }, { kind: "plain", text: " = target - x" }] },
  { indent: 2, revealAt: 280, tokens: [{ kind: "keyword", text: "if " }, { kind: "ident", text: "need" }, { kind: "keyword", text: " in " }, { kind: "ident", text: "seen" }, { kind: "plain", text: ":" }] },
  { indent: 3, revealAt: 350, tokens: [{ kind: "keyword", text: "return " }, { kind: "plain", text: "[" }, { kind: "ident", text: "seen" }, { kind: "plain", text: "[" }, { kind: "ident", text: "need" }, { kind: "plain", text: "], i]" }] },
  { indent: 2, revealAt: 420, tokens: [{ kind: "ident", text: "seen" }, { kind: "plain", text: "[x] = i" }] },
];

export function MonacoTyping() {
  const frame = useCurrentFrame();
  const tailOpacity = interpolate(frame, [560, 600], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        opacity: tailOpacity,
      }}
    >
      <MacWindow title="solution.py" titleColor={colors.emerald} width={1400}>
        <div style={{ padding: 10, fontFamily: type.code.fontFamily }}>
          {LINES.map((line, i) => {
            const visible = frame >= line.revealAt;
            const opacity = interpolate(frame, [line.revealAt, line.revealAt + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (!visible) return <div key={i} style={{ height: 36 }} />;
            return (
              <div key={i} style={{ opacity, marginBottom: 4 }}>
                <CodeLine tokens={line.tokens} indent={line.indent} />
              </div>
            );
          })}
        </div>
      </MacWindow>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/MonacoTyping.tsx && git commit -m "feat(video): MonacoTyping scene with syntax-highlighted Two Sum code"
```

---

### Task 17: SubmissionAccepted scene

**Files:**
- Create: `apps/video/src/scenes/SubmissionAccepted.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/SubmissionAccepted.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 2:00 beat of Walkthrough (roughly 300 frames).
 * Big green ACCEPTED check + runtime stats pop in.
 */
export function SubmissionAccepted() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkScale = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const statsOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [260, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: tailOpacity,
      }}
    >
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: `scale(${checkScale})` }}>
        <circle cx="110" cy="110" r="100" fill={colors.emeraldSoft} stroke={colors.emerald} strokeWidth="4" />
        <path d="M60 115 L95 150 L160 75" stroke={colors.emerald} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div style={{ ...type.h2, color: colors.emerald, marginTop: 40 }}>ACCEPTED</div>
      <div
        style={{
          ...type.body,
          color: colors.slateLight,
          marginTop: 20,
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
        }}
      >
        <span>Runtime: <b style={{ color: colors.text }}>48 ms</b></span>
        <span>Memory: <b style={{ color: colors.text }}>17.2 MB</b></span>
        <span>Beats: <b style={{ color: colors.text }}>92%</b></span>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/SubmissionAccepted.tsx && git commit -m "feat(video): SubmissionAccepted scene"
```

---

### Task 18: SkillTreeMastery scene

**Files:**
- Create: `apps/video/src/scenes/SkillTreeMastery.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/SkillTreeMastery.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { ConceptNode } from "../ui/ConceptNode";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { concepts } from "../fixtures/concepts";
import { barFill } from "../animations/barFill";

/**
 * Shared scene:
 *   Hero 0:26–0:33 (210 frames) — skill tree with mastery filling
 *   Walkthrough 2:00–2:15 (450 frames) — longer hold, same animation
 */
interface SkillTreeMasteryProps {
  variant: "hero" | "walk";
}

export function SkillTreeMastery({ variant }: SkillTreeMasteryProps) {
  const frame = useCurrentFrame();

  const fillDuration = variant === "hero" ? 180 : 360;
  const headerOpacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = variant === "hero"
    ? interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp" })
    : interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp" });

  const NODE_W = 240;
  const NODE_H = 62;
  const GAP_X = 36;
  const GAP_Y = 26;
  const GRID_OFFSET_X = (1920 - (5 * NODE_W + 4 * GAP_X)) / 2;
  const GRID_OFFSET_Y = 200;

  return (
    <AbsoluteFill style={{ background: colors.bg, opacity: tailOpacity }}>
      <div style={{ textAlign: "center", paddingTop: 80, opacity: headerOpacity }}>
        <div style={{ ...type.h3, color: colors.text }}>Your skill tree</div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 10 }}>
          Mastery updates after every submission
        </div>
      </div>
      <div style={{ position: "relative", width: 1920, height: 500, marginTop: 40 }}>
        {concepts.map((c) => {
          const mastery = barFill({
            frame,
            startFrame: 30,
            durationFrames: fillDuration,
            startPct: c.startMastery,
            endPct: c.endMastery,
          });
          const x = GRID_OFFSET_X + c.col * (NODE_W + GAP_X);
          const y = GRID_OFFSET_Y + c.row * (NODE_H + GAP_Y);
          return <ConceptNode key={c.id} name={c.name} mastery={mastery} x={x} y={y} width={NODE_W} height={NODE_H} />;
        })}
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/SkillTreeMastery.tsx && git commit -m "feat(video): SkillTreeMastery scene with 22 animated concept nodes"
```

---

### Task 19: DailyRecommendation scene

**Files:**
- Create: `apps/video/src/scenes/DailyRecommendation.tsx`

- [ ] **Step 1: Create `apps/video/src/scenes/DailyRecommendation.tsx`**

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 2:15–2:25 of Walkthrough (300 frames).
 * Banner slides up from bottom recommending a next problem.
 */
export function DailyRecommendation() {
  const frame = useCurrentFrame();

  const bannerY = interpolate(frame, [0, 30], [400, 0], { extrapolateRight: "clamp" });
  const bannerOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, alignItems: "center", justifyContent: "center", opacity: tailOpacity }}>
      <div
        style={{
          width: 1200,
          padding: "38px 46px",
          background: colors.card,
          border: `1px solid ${colors.emerald}`,
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(34,197,94,0.12)",
          transform: `translateY(${bannerY}px)`,
          opacity: bannerOpacity,
        }}
      >
        <div style={{ ...type.label, color: colors.emerald, letterSpacing: 2 }}>DAILY RECOMMENDATION</div>
        <div style={{ ...type.h3, color: colors.text, marginTop: 14 }}>3Sum</div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 10 }}>
          Extends what you learned in Two Sum · Two Pointer · Medium
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <div style={{ ...type.label, color: colors.amber, padding: "4px 12px",
            border: `1px solid ${colors.amber}`, borderRadius: 999 }}>MEDIUM</div>
          <div style={{ ...type.label, color: colors.slate, padding: "4px 12px",
            border: `1px solid ${colors.border}`, borderRadius: 999 }}>Array</div>
          <div style={{ ...type.label, color: colors.slate, padding: "4px 12px",
            border: `1px solid ${colors.border}`, borderRadius: 999 }}>Two Pointer</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/scenes/DailyRecommendation.tsx && git commit -m "feat(video): DailyRecommendation scene"
```

---

## Phase 7 — Compositions (Tasks 20-21)

### Task 20: Hero composition

**Files:**
- Modify: `apps/video/src/Root.tsx`
- Create: `apps/video/src/compositions/Hero.tsx`

- [ ] **Step 1: Create `apps/video/src/compositions/Hero.tsx`**

```tsx
import { AbsoluteFill, Sequence } from "remotion";
import { colors } from "../theme/colors";
import { HookKineticText } from "../scenes/HookKineticText";
import { SocraticChat } from "../scenes/SocraticChat";
import { BeginnerWalkthrough } from "../scenes/BeginnerWalkthrough";
import { SkillTreeMastery } from "../scenes/SkillTreeMastery";
import { Outro } from "../scenes/Outro";

/**
 * Hero composition
 *   Total: 1200 frames @ 30fps = 40s
 *   0-90   (0:00-0:03)  HookKineticText
 *   90-330 (0:03-0:11)  SocraticChat
 *   330-780 (0:11-0:26) BeginnerWalkthrough (hero variant)
 *   780-990 (0:26-0:33) SkillTreeMastery (hero variant)
 *   990-1200 (0:33-0:40) Outro
 */
export function Hero() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Sequence from={0} durationInFrames={90}>
        <HookKineticText />
      </Sequence>
      <Sequence from={90} durationInFrames={240}>
        <SocraticChat />
      </Sequence>
      <Sequence from={330} durationInFrames={450}>
        <BeginnerWalkthrough variant="hero" />
      </Sequence>
      <Sequence from={780} durationInFrames={210}>
        <SkillTreeMastery variant="hero" />
      </Sequence>
      <Sequence from={990} durationInFrames={210}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Update `apps/video/src/Root.tsx` to register Hero**

```tsx
import { Composition } from "remotion";
import { Hero } from "./compositions/Hero";

export const Root = () => {
  return (
    <>
      <Composition
        id="Hero"
        component={Hero}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

- [ ] **Step 3: Preview Hero**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && timeout 30 npm run video:preview || true
```

Open `http://localhost:3000/Hero`. Watch the full 40s playback. Expected: 5 scenes in the order above, no layout overflow, no console errors. Ctrl+C.

- [ ] **Step 4: Test render (short duration first)**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video" && npx remotion render src/index.ts Hero out/hero.mp4 --frames=0-120
```

Expected: `out/hero.mp4` produced (~4s clip). Use this to verify encoding works before committing to the full 40s render.

- [ ] **Step 5: Full render**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && npm run video:render:hero
```

Expected: `apps/video/out/hero.mp4` produced in ~2-5 minutes depending on machine.

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/compositions/Hero.tsx apps/video/src/Root.tsx && git commit -m "feat(video): Hero composition — 5 scenes stitched to 40s"
```

(Note: do NOT commit `apps/video/out/` — it's gitignored.)

---

### Task 21: Walkthrough composition + BGM

**Files:**
- Create: `apps/video/public/bgm.mp3` (placeholder silent audio)
- Create: `apps/video/src/compositions/Walkthrough.tsx`
- Modify: `apps/video/src/Root.tsx` (register Walkthrough)

- [ ] **Step 1: Generate placeholder silent BGM**

Remotion requires an audio file to exist for `staticFile("bgm.mp3")` to resolve. Create a silent 160-second MP3:

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video/public"
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 160 -q:a 9 -acodec libmp3lame bgm.mp3
```

Expected: `apps/video/public/bgm.mp3` ~1 MB silent placeholder.

If ffmpeg is not installed: Remotion ships with its own ffmpeg at `node_modules/@remotion/renderer/...`. Alternatively, download any short royalty-free MP3 from Pixabay manually as described in `apps/video/README.md` (created in Task 22).

- [ ] **Step 2: Create `apps/video/src/compositions/Walkthrough.tsx`**

```tsx
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { colors } from "../theme/colors";
import { PainStatement } from "../scenes/PainStatement";
import { Thesis } from "../scenes/Thesis";
import { PracticePageOpen } from "../scenes/PracticePageOpen";
import { SuggestionChipsReveal } from "../scenes/SuggestionChipsReveal";
import { BeginnerWalkthrough } from "../scenes/BeginnerWalkthrough";
import { PhaseTransitionKnowledge } from "../scenes/PhaseTransitionKnowledge";
import { MonacoTyping } from "../scenes/MonacoTyping";
import { SubmissionAccepted } from "../scenes/SubmissionAccepted";
import { SkillTreeMastery } from "../scenes/SkillTreeMastery";
import { DailyRecommendation } from "../scenes/DailyRecommendation";
import { Outro } from "../scenes/Outro";
import { Caption } from "../ui/Caption";

/**
 * Walkthrough composition
 *   Total: 4650 frames @ 30fps = 155s (2:35)
 *   0-450      (0:00-0:15)  PainStatement
 *   450-750    (0:15-0:25)  Thesis
 *   750-1200   (0:25-0:40)  PracticePageOpen
 *   1200-1500  (0:40-0:50)  SuggestionChipsReveal
 *   1500-2250  (0:50-1:15)  BeginnerWalkthrough (walk variant)
 *   2250-3000  (1:15-1:40)  PhaseTransitionKnowledge
 *   3000-3600  (1:40-2:00)  MonacoTyping
 *   3600-3900  (2:00-2:10)  SubmissionAccepted
 *   3900-4200  (2:10-2:20)  SkillTreeMastery (walk variant, compressed to 300f)
 *   4200-4500  (2:20-2:30)  DailyRecommendation
 *   4500-4650  (2:30-2:35)  Outro
 */
export function Walkthrough() {
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <Audio src={staticFile("bgm.mp3")} volume={0.5} />

      <Sequence from={0} durationInFrames={450}>
        <PainStatement />
      </Sequence>
      <Sequence from={450} durationInFrames={300}>
        <Thesis />
      </Sequence>

      <Sequence from={750} durationInFrames={450}>
        <PracticePageOpen />
        <Caption>Open any problem. Your test cases are visualized inline.</Caption>
      </Sequence>

      <Sequence from={1200} durationInFrames={300}>
        <SuggestionChipsReveal />
        <Caption>Not sure where to begin? Six starter prompts are built in.</Caption>
      </Sequence>

      <Sequence from={1500} durationInFrames={750}>
        <BeginnerWalkthrough variant="walk" />
        <Caption>The AI walks you through a real input — 3 concrete questions.</Caption>
      </Sequence>

      <Sequence from={2250} durationInFrames={750}>
        <PhaseTransitionKnowledge />
        <Caption>Your answers unlock the algorithmic pattern — Hash Table.</Caption>
      </Sequence>

      <Sequence from={3000} durationInFrames={600}>
        <MonacoTyping />
        <Caption>Code in Python · JavaScript · C · C++.</Caption>
      </Sequence>

      <Sequence from={3600} durationInFrames={300}>
        <SubmissionAccepted />
        <Caption>Runs in a Docker sandbox. No network. No surprises.</Caption>
      </Sequence>

      <Sequence from={3900} durationInFrames={300}>
        <SkillTreeMastery variant="walk" />
        <Caption>Every submission updates your mastery map.</Caption>
      </Sequence>

      <Sequence from={4200} durationInFrames={300}>
        <DailyRecommendation />
        <Caption>Tomorrow's problem is chosen for your weakest spot.</Caption>
      </Sequence>

      <Sequence from={4500} durationInFrames={150}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 3: Update `apps/video/src/Root.tsx` to register Walkthrough**

```tsx
import { Composition } from "remotion";
import { Hero } from "./compositions/Hero";
import { Walkthrough } from "./compositions/Walkthrough";

export const Root = () => {
  return (
    <>
      <Composition
        id="Hero"
        component={Hero}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Walkthrough"
        component={Walkthrough}
        durationInFrames={4650}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

- [ ] **Step 4: Preview Walkthrough**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && timeout 30 npm run video:preview || true
```

Open `http://localhost:3000/Walkthrough`. Scrub through scenes; verify captions show, each scene renders, transitions feel right. Ctrl+C.

- [ ] **Step 5: Test render (first 30s only)**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer/apps/video" && npx remotion render src/index.ts Walkthrough out/walkthrough-test.mp4 --frames=0-900
```

Expected: ~30s clip produced. Verify captions/audio/scenes.

- [ ] **Step 6: Full render**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && npm run video:render:walkthrough
```

Expected: `apps/video/out/walkthrough.mp4` in ~5-10 minutes.

- [ ] **Step 7: Commit**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/src/compositions/Walkthrough.tsx apps/video/src/Root.tsx apps/video/public/bgm.mp3 && git commit -m "feat(video): Walkthrough composition — 11 scenes with BGM and captions"
```

---

## Phase 8 — Docs + final renders (Task 22)

### Task 22: README + verify + commit final renders

**Files:**
- Create: `apps/video/README.md`
- Create: `apps/video/out/hero.mp4` (committed once verified)
- Create: `apps/video/out/walkthrough.mp4`
- Modify: root `.gitignore` (carve out exception for `apps/video/out/*.mp4`)

- [ ] **Step 1: Create `apps/video/README.md`**

```markdown
# @skill/video

Remotion workspace producing marketing videos for AI Pair Programmer.

## Compositions

| Composition | Duration | Use | Output |
|-------------|----------|-----|--------|
| `Hero` | 40 s | Landing page autoplay muted | `out/hero.mp4` |
| `Walkthrough` | 2 min 35 s | YouTube / Product Hunt | `out/walkthrough.mp4` |

## Commands (run from repo root)

- `npm run video:preview` — Remotion Studio at http://localhost:3000
- `npm run video:render:hero` — produces `out/hero.mp4`
- `npm run video:render:walkthrough` — produces `out/walkthrough.mp4`
- `npm test --workspace=apps/video` — fixture smoke test

## BGM

`public/bgm.mp3` ships as a silent 160 s placeholder. Replace with any royalty-free lofi / ambient track (≥155 s, MP3, 44.1 kHz stereo) to get the Walkthrough audio. Suggested source: https://pixabay.com/music/

```bash
# Example: generate silent placeholder with ffmpeg
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 160 -q:a 9 -acodec libmp3lame public/bgm.mp3
```

## Fixtures are frozen

`src/fixtures/` is a manual snapshot of real seed data. Update it when seed content changes — it is **not** fetched from the database at render time. This keeps renders deterministic.

## Reused code

The `BeginnerWalkthrough` and `PracticePageOpen` scenes directly import `renderArray` from `apps/web/src/lib/input-visualizer/renderers/array`. Keep that module pure-JSX (no React hooks) or the import will break.
```

- [ ] **Step 2: Modify root `.gitignore` to allow `apps/video/out/*.mp4`**

Open root `.gitignore`. If it has a broad `out/` or `*.mp4` rule, add an exception:

```
# Allow committed final video renders
!apps/video/out/
apps/video/out/*
!apps/video/out/hero.mp4
!apps/video/out/walkthrough.mp4
!apps/video/out/.gitkeep
```

Also remove `out` from `apps/video/.gitignore` (created in Task 1) or add the same exception there. Edit `apps/video/.gitignore` to:

```
node_modules
.DS_Store
out/*
!out/hero.mp4
!out/walkthrough.mp4
!out/.gitkeep
```

- [ ] **Step 3: Re-render both videos if not already fresh**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && npm run video:render:hero && npm run video:render:walkthrough
```

Expected: two MP4s. Hero ~15 MB, Walkthrough ~50 MB.

- [ ] **Step 4: Play both videos end-to-end in a media player and review**

Open `apps/video/out/hero.mp4` and `apps/video/out/walkthrough.mp4` in VLC / QuickTime / system default. Verify:

- Hero ~40 s, all 5 scenes show, legible at 1080p
- Walkthrough ~2:35, captions readable bottom third, BGM audible
- No black frames, no broken layout, no cut-off text
- Files play on mobile (AirDrop/send to phone if possible)

If any scene looks off, fix the relevant scene file and re-render that composition only.

- [ ] **Step 5: Commit the videos + README**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git add apps/video/README.md apps/video/.gitignore .gitignore apps/video/out/hero.mp4 apps/video/out/walkthrough.mp4 && git commit -m "feat(video): README + committed Hero and Walkthrough MP4 renders"
```

- [ ] **Step 6: Push**

```bash
cd "c:/Users/88698/Desktop/Workspace/AI Pair Programmer" && git push
```

---

## Summary

**Total tasks:** 22

| Phase | Tasks | Deliverable |
|-------|-------|-------------|
| 1 Scaffold | 1-3 | `apps/video/` workspace, theme tokens, UI micro-components |
| 2 Fixtures | 4-5 | Two Sum + concepts + chat script, smoke test |
| 3 Animations | 6 | Typing / bubble / bar helpers |
| 4 Hero-only | 7-8 | HookKineticText, Outro |
| 5 Walkthrough-only | 9-10 | PainStatement, Thesis |
| 6 Shared scenes | 11-19 | SocraticChat, BeginnerWalkthrough (+renderArray reuse!), SuggestionChipsReveal, PracticePageOpen, PhaseTransitionKnowledge, MonacoTyping, SubmissionAccepted, SkillTreeMastery, DailyRecommendation |
| 7 Compositions | 20-21 | Hero.tsx + Walkthrough.tsx with BGM |
| 8 Docs + render | 22 | README, committed MP4 outputs |

## Self-review notes

**Spec coverage check:**

- ✅ Hero 40s composition → Task 20
- ✅ Walkthrough 2:35 composition → Task 21
- ✅ 13 scene components → Tasks 7-19 (each its own task)
- ✅ 6 UI micro-components → Task 3
- ✅ 3 fixture files → Tasks 4, 5
- ✅ Theme tokens matching `apps/web` → Task 2
- ✅ Reuse `renderArray` from `apps/web` → Tasks 12, 14 (import path verified in Task 12 Step 2)
- ✅ BGM silent placeholder → Task 21 Step 1
- ✅ No captions in Hero / captions in Walkthrough → Task 20 has no `<Caption>`, Task 21 mounts them per scene
- ✅ Fixture smoke test → Task 4
- ✅ `npm run video:preview` / `video:render:hero` / `video:render:walkthrough` → Task 1 Step 1 (package.json) + Step 8 (root scripts)
- ✅ `apps/video/README.md` explaining how to swap BGM → Task 22 Step 1
- ✅ Committed final MP4s → Task 22 Steps 3, 5

**Type consistency:**

- `FixtureTestCase` / `FixtureProblem` defined in Task 4 and used in Tasks 14, 12 via `twoSum` — consistent
- `ChatTurn` shape defined in Task 5, used in Tasks 12, 15 — consistent (`role`, `text`, `startFrame`, `typingDurationFrames`, `phaseTag`)
- `ConceptWithProgression` defined in Task 4, used in Task 18 — consistent
- `BeginnerWalkthrough` variant prop (`"hero" | "walk"`) in Task 12 used by both compositions in Tasks 20, 21
- `SkillTreeMastery` variant prop (`"hero" | "walk"`) in Task 18 used by both compositions in Tasks 20, 21

**Placeholder scan:** No `TBD`, no `// TODO`, no "similar to above", every code step has complete runnable code.

**DRY / YAGNI verification:**

- `BeginnerWalkthrough` and `SkillTreeMastery` are used in BOTH compositions — proper reuse
- `Outro` is used in BOTH — proper reuse
- `Caption` is defined once, mounted per-scene in Walkthrough only — no duplication
- Theme tokens + typography in ONE place, imported everywhere
- No scene has render logic duplicated from another scene
