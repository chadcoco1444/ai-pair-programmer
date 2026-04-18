# English Localization + README Revamp + SVG Assets Design

**Date**: 2026-04-18
**Status**: Approved — ready for implementation plan

## Problem

The AI Pair Programmer repo currently:
- Has Chinese-only `README.md` (140 lines) with outdated feature descriptions
- Has Chinese text mixed throughout user-facing UI strings, code comments, and YAML hints
- Has a placeholder `docs/architecture.svg` referenced in README
- Lacks visual marketing assets for a public/open-source audience

Goal: Turn this into a fully English, visually-rich public-facing repo that foreigners can understand and evaluate at a glance, while preserving internal Chinese design docs under `docs/superpowers/**`.

## Scope

**Translate to English**:
1. `README.md` — full rewrite with expanded feature descriptions, installation, architecture, contributing
2. UI strings in React components (`apps/web/src/app/**` + `apps/web/src/components/**`)
3. Code comments and docstrings (all `apps/web/src/**` + `services/executor/src/**`)
4. YAML hints in all 71 problem files (`seed/problems/**/*.yaml`)
5. Future commit messages (English from this point)

**Create new**:
1. Six SVG marketing assets under `docs/` (described below)

**Leave as-is**:
- `docs/superpowers/**` — internal working docs, remain Chinese
- Git history, past commit messages
- `.claude/skills/**` — local skills, not published
- `seed/problems/**/*.yaml` — `description` field already English (LeetCode originals)

## Architecture

No architecture change — this is purely content work. Structure:

```
Repo/
├── README.md                          # REWRITE in English
├── docs/
│   ├── hero.svg                       # NEW: top banner
│   ├── architecture.svg               # REPLACE: tech stack + data flow
│   ├── features.svg                   # NEW: 6 feature cards
│   ├── skill-framework.svg            # NEW: S-K-I-L-L 5 stage flow
│   ├── learn-map.svg                  # NEW: skill tree preview
│   ├── execution-flow.svg             # NEW: submit pipeline
│   └── superpowers/                   # LEAVE Chinese (internal)
├── apps/web/src/                      # TRANSLATE comments + UI strings
├── services/executor/src/             # TRANSLATE comments
└── seed/problems/**/*.yaml            # TRANSLATE hints only
```

## README Structure (Full Spec)

```markdown
# AI Pair Programmer

<p align="center"><img src="docs/hero.svg" /></p>

> One-line tagline: Socratic AI coding tutor that teaches you to think, not
> memorize — with instant Docker-sandboxed execution in 4 languages.

[Badges: MIT, Next.js 15, Docker, Tests passing 284/284]

## ✨ Features

<p align="center"><img src="docs/features.svg" /></p>

Six-card grid: Socratic AI · Multi-language Sandbox · Learn Map · Adaptive
Recommendations · 71 Curated Problems · Code Editor with AI Chat.

## 🏗️ Architecture

<p align="center"><img src="docs/architecture.svg" /></p>

Tech stack table + data flow explanation.

## 🚀 Quick Start

Prerequisites, one-command setup, .env template, dev commands.

## 📚 The SKILL Framework

<p align="center"><img src="docs/skill-framework.svg" /></p>

5-stage pedagogy breakdown.

## 🗺️ Learn Map

<p align="center"><img src="docs/learn-map.svg" /></p>

Interactive skill tree with concept drawer UX description.

## ⚡ Execution Pipeline

<p align="center"><img src="docs/execution-flow.svg" /></p>

Submit → parse args → compile (C/C++ cached) → sandbox → judge flow.

## 📊 Problem Catalog

Table by category with counts and difficulty breakdown.

## 🛠️ Commands

npm scripts reference table.

## 📁 Project Structure

Directory tree.

## 🧪 Testing

- 284/284 E2E (Python + JS + C++ + C, 71 each)
- 83/83 unit tests
- Instructions to run all suites

## 🤝 Contributing

Fork → feature branch → PR. Pre-commit test script.

## 📄 License

MIT
```

## SVG Specifications

All SVGs use a consistent flat-geometric style: single-color/duotone, clean
lines, minimal, Linear/Vercel aesthetic. Shared palette:

- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Border: `#334155` (slate-700)
- Accent: `#22c55e` (emerald-500)
- Text: `#f8fafc` (slate-50)
- Muted: `#94a3b8` (slate-400)

Fonts: Fira Code for mono elements, Fira Sans for text. Both loaded via
`<style>` block or inline `font-family`.

### 1. `hero.svg` (1200×400)

- Dark background with subtle 24px dot grid
- Left half (0-600px):
  - Title "AI Pair Programmer" in Fira Code 40px, emerald pulsing dot
  - Tagline in Fira Sans 18px muted
  - Subtle tagline badges ("71 problems · 4 languages · 284 tests")
- Right half (600-1200px):
  - User avatar icon → arrow → AI chat bubble → arrow → Executor box →
    4 language container icons (Python/JS/C/C++) fanning out
  - Dotted connection lines in muted border color

### 2. `architecture.svg` (1000×600)

Three horizontal layers stacked top-to-bottom, each a rounded rect with
component icons inside:

**Layer 1 — Client** (top, 1000×160):
- Next.js logo icon | React Flow icon | Monaco icon | NextAuth icon
- Label "Frontend (Next.js 15 + React 19)"

**Layer 2 — API/Services** (middle, 1000×180):
- tRPC icon | Prisma icon | NextAuth icon
- Label "API (tRPC v11 type-safe)"

**Layer 3 — Infrastructure** (bottom, 1000×220):
- PostgreSQL icon | Redis icon | BullMQ icon | Executor box → Docker icon
  (sub-branching to 4 language tags)
- Label "Data + Execution"

Connecting arrows between layers show request flow. Small right-side legend
maps icons to tech names.

### 3. `features.svg` (1200×800)

3-column × 2-row grid of feature cards, each 380×350:

1. **Socratic AI** — chat bubble icon with question mark + emerald accent
2. **Sandbox Execution** — Docker whale icon + "Python/JS/C/C++" tags
3. **Learn Map** — small graph icon (3 nodes + 2 edges)
4. **Adaptive Recommendations** — sparkle icon + stat bars
5. **71 Problems** — stack-of-books icon + "Blind 75"
6. **Code Editor** — terminal icon with cursor

Each card: surface background, border, emerald-accented icon, heading in
Fira Code bold, 2-line description in Fira Sans muted.

### 4. `skill-framework.svg` (1000×300)

Horizontal 5-stage flow:
```
(S) → (K) → (I) → (L1) → (L2)
```

Each stage is an emerald-outlined circle (60px) with the letter inside
(Fira Code bold), label below ("Socratic", "Knowledge", "Iterative",
"Logic", "Evolution"), one-line description beneath. Arrows between stages
in muted border color with emerald fade.

### 5. `learn-map.svg` (800×500)

Simulated skill tree:
- Top row: "Array" (emerald filled, 100%)
- Second row: "Two Pointer" (amber, 60%), "Stack" (emerald, 100%)
- Third row: "Sliding Window" (slate, 20%), "Monotonic Stack" (slate, 10%)
- Connecting prerequisite lines

Right-side floating drawer overlay showing:
- Heading "Dynamic Programming"
- Mastery bar 60%
- 2-3 problem rows with ✓/○ status icons

### 6. `execution-flow.svg` (1200×400)

Left-to-right pipeline with 6 boxes:

```
[Editor] → [parseTestInput] → [Queue (BullMQ)] → [Compile cache (C/C++)] → [Docker Sandbox] → [Judge]
```

Each box: surface bg with icon + label + one-line sub-caption.

Above the flow: thin timeline showing "Submit" on left, "Result" on right.

Below: small callout on "Compile cache: 3-5s → reused across 5 test cases
= 5× speedup for C/C++".

## Translation Strategy

### UI Strings

Search + replace pattern per file. Common translations:

| Chinese | English |
|---------|---------|
| 題目 | Problems |
| 儀表板 | Dashboard |
| 個人檔案 | Profile |
| 學習地圖 | Learn Map |
| 提交歷史 | Submission History |
| 掌握度 | Mastery |
| 通過率 | Acceptance Rate |
| 提交 | Submit |
| 執行 | Run |
| 載入中 | Loading... |
| 已解 | Solved |
| 未解 | Unsolved |
| 每日推薦 | Daily Recommendations |
| 弱點統計 | Weakness Stats |

### Code Comments

- `// 提交程式碼` → `// Submit code`
- `// 取得所有測資` → `// Fetch all test cases`
- `// 建立提交記錄` → `// Create submission record`
- Keep semantic meaning — translate idiomatically, not literally.

### YAML Hints

Each of the 71 problem files has a `hints` array. Translate to clear
English preserving technical accuracy. Don't alter problem description
(already English) or test case input/expected.

## Risks

- **Scope creep**: translating every comment in every file is a lot. Mitigation:
  prioritize user-facing first, then comments in service/router layer, then
  leaf components.
- **Semantic drift**: literal translation may lose nuance. Mitigation: keep
  voice consistent with existing English (SKILL framework names, tech jargon).
- **YAML format**: hints may have Markdown-like formatting. Preserve structure,
  only translate body.
- **Future Chinese contributions**: add a CONTRIBUTING.md note (or README
  section) requesting English for all new content.

## Testing

- Run `npx vitest run` after each batch — existing 83 tests should pass
- Visually check rendered SVGs by opening each in browser
- Verify README renders correctly on GitHub (check preview)
- No automated translation correctness test — manual review

## Success Criteria

1. README fully English, renders 6 SVGs inline correctly
2. No Chinese text in user-facing React components or error messages
3. No Chinese comments in published code (apps/web/src/**, services/executor/src/**)
4. All 71 YAML files have English hints
5. 6 SVGs render correctly on GitHub dark + light backgrounds
6. All tests still pass (284 E2E + 83 unit)
7. `docs/superpowers/**` untouched

## Non-Goals (Out of Scope)

- ❌ Translating past git commit messages (history is history)
- ❌ i18n / multi-language support (English-only for now)
- ❌ Full design system documentation beyond current scope
- ❌ Redesigning existing UI beyond language change
- ❌ `.claude/skills/**` changes (local, not published)
