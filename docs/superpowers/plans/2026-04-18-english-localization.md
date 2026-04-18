# English Localization + README + SVG Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate all user-facing Chinese to English (UI strings, code comments, YAML hints), rewrite README in English with expanded content, and ship 6 flat-geometric SVG marketing assets.

**Architecture:** Pure content work — no behavior changes. Translation via search-replace batches (UI first, then comments, then YAML). SVGs hand-written flat-geometric style using shared palette (slate-900 + emerald-500). README inlines SVGs via `<img src>`.

**Tech Stack:** Markdown, SVG, TypeScript, Python, YAML. No new dependencies.

**Spec**: `docs/superpowers/specs/2026-04-18-english-localization-design.md`

---

## File Structure

```
docs/
├── hero.svg                  # NEW
├── architecture.svg          # REPLACE existing
├── features.svg              # NEW
├── skill-framework.svg       # NEW
├── learn-map.svg             # NEW
└── execution-flow.svg        # NEW

README.md                     # FULL REWRITE

apps/web/src/
├── app/**/*.tsx              # Translate UI strings
├── components/**/*.tsx       # Translate UI strings
├── server/**/*.ts            # Translate comments
└── lib/**/*.ts               # Translate comments

services/executor/src/
└── **/*.ts                   # Translate comments

seed/problems/**/*.yaml       # Translate hints only (not description)
```

---

## Phase 1: SVG Assets (6 files)

### Task 1: hero.svg

**Files:**
- Create: `docs/hero.svg` (1200×400 viewBox)

- [ ] **Step 1: Create `docs/hero.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#1e293b" />
    </pattern>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22c55e" stop-opacity="1"/>
      <stop offset="1" stop-color="#22c55e" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="#0f172a"/>
  <rect width="1200" height="400" fill="url(#grid)"/>

  <!-- Left: title block -->
  <g transform="translate(80, 120)">
    <circle cx="0" cy="0" r="6" fill="#22c55e">
      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="20" y="6" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="42" font-weight="700">
      AI Pair Programmer
    </text>
    <text x="0" y="48" fill="#94a3b8" font-family="'Fira Sans', sans-serif" font-size="18">
      Socratic AI coding tutor · 4 languages · Docker-sandboxed
    </text>
    <!-- Badges -->
    <g transform="translate(0, 96)" font-family="'Fira Code', monospace" font-size="12">
      <rect x="0" y="0" width="110" height="28" rx="14" fill="#1e293b" stroke="#334155"/>
      <text x="55" y="18" fill="#f8fafc" text-anchor="middle">71 problems</text>
      <rect x="120" y="0" width="110" height="28" rx="14" fill="#1e293b" stroke="#334155"/>
      <text x="175" y="18" fill="#f8fafc" text-anchor="middle">4 languages</text>
      <rect x="240" y="0" width="110" height="28" rx="14" fill="#1e293b" stroke="#334155"/>
      <text x="295" y="18" fill="#f8fafc" text-anchor="middle">284 E2E tests</text>
      <rect x="360" y="0" width="110" height="28" rx="14" fill="#1e293b" stroke="#334155"/>
      <text x="415" y="18" fill="#22c55e" text-anchor="middle">MIT</text>
    </g>
  </g>

  <!-- Right: pipeline diagram -->
  <g transform="translate(680, 140)" font-family="'Fira Code', monospace" font-size="11">
    <!-- User -->
    <circle cx="30" cy="60" r="22" fill="#1e293b" stroke="#334155"/>
    <text x="30" y="64" fill="#f8fafc" text-anchor="middle">User</text>
    <!-- Arrow 1 -->
    <path d="M58 60 L100 60" stroke="#334155" stroke-width="1.5" fill="none" stroke-dasharray="2,3"/>
    <!-- Chat -->
    <rect x="100" y="40" width="80" height="40" rx="8" fill="#1e293b" stroke="#22c55e"/>
    <text x="140" y="64" fill="#f8fafc" text-anchor="middle">AI Chat</text>
    <!-- Arrow 2 -->
    <path d="M180 60 L220 60" stroke="#334155" stroke-width="1.5" fill="none" stroke-dasharray="2,3"/>
    <!-- Executor -->
    <rect x="220" y="40" width="90" height="40" rx="8" fill="#1e293b" stroke="#22c55e"/>
    <text x="265" y="64" fill="#f8fafc" text-anchor="middle">Executor</text>
    <!-- 4 language boxes fanning out -->
    <g transform="translate(330, 0)">
      <rect x="0" y="5" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155"/>
      <text x="30" y="21" fill="#22c55e" text-anchor="middle">Python</text>
      <rect x="0" y="40" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155"/>
      <text x="30" y="56" fill="#22c55e" text-anchor="middle">JS</text>
      <rect x="0" y="75" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155"/>
      <text x="30" y="91" fill="#22c55e" text-anchor="middle">C++</text>
      <rect x="0" y="110" width="60" height="24" rx="4" fill="#1e293b" stroke="#334155"/>
      <text x="30" y="126" fill="#22c55e" text-anchor="middle">C</text>
    </g>
    <!-- Fan lines from Executor to each box -->
    <path d="M310 60 L330 17" stroke="#334155" stroke-width="1" fill="none"/>
    <path d="M310 60 L330 52" stroke="#334155" stroke-width="1" fill="none"/>
    <path d="M310 60 L330 87" stroke="#334155" stroke-width="1" fill="none"/>
    <path d="M310 60 L330 122" stroke="#334155" stroke-width="1" fill="none"/>
  </g>
</svg>
```

- [ ] **Step 2: Open in browser to verify**

Open `docs/hero.svg` in browser (or VS Code preview). Verify:
- Grid shows faintly
- Title renders in Fira Code (or fallback monospace)
- 4 badges visible
- Right-side pipeline legible

- [ ] **Step 3: Commit**

```bash
git add docs/hero.svg
git commit -m "feat(docs): add hero.svg banner for README"
```

---

### Task 2: architecture.svg (replace existing)

**Files:**
- Modify: `docs/architecture.svg` (overwrite, viewBox 1000×600)

- [ ] **Step 1: Overwrite `docs/architecture.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600" font-family="'Fira Sans', sans-serif">
  <rect width="1000" height="600" fill="#0f172a"/>

  <!-- Layer 1: Client -->
  <g transform="translate(50, 40)">
    <rect width="900" height="140" rx="12" fill="#1e293b" stroke="#334155"/>
    <text x="20" y="28" fill="#94a3b8" font-size="12" font-family="'Fira Code', monospace">LAYER 1 — CLIENT</text>
    <text x="20" y="54" fill="#f8fafc" font-size="20" font-weight="600">Frontend (Next.js 15 · React 19)</text>
    <!-- Component pills -->
    <g font-size="12" font-family="'Fira Code', monospace">
      <rect x="20" y="72" width="140" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="90" y="92" fill="#f8fafc" text-anchor="middle">Next.js Router</text>
      <rect x="170" y="72" width="130" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="235" y="92" fill="#f8fafc" text-anchor="middle">React Flow</text>
      <rect x="310" y="72" width="120" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="370" y="92" fill="#f8fafc" text-anchor="middle">Monaco</text>
      <rect x="440" y="72" width="140" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="510" y="92" fill="#f8fafc" text-anchor="middle">Tailwind</text>
      <rect x="590" y="72" width="120" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="650" y="92" fill="#f8fafc" text-anchor="middle">NextAuth</text>
    </g>
  </g>

  <!-- Arrow down -->
  <g stroke="#22c55e" stroke-width="2" fill="none">
    <path d="M500 190 L500 215"/>
    <path d="M495 210 L500 218 L505 210"/>
  </g>

  <!-- Layer 2: API -->
  <g transform="translate(50, 225)">
    <rect width="900" height="120" rx="12" fill="#1e293b" stroke="#334155"/>
    <text x="20" y="28" fill="#94a3b8" font-size="12" font-family="'Fira Code', monospace">LAYER 2 — API</text>
    <text x="20" y="54" fill="#f8fafc" font-size="20" font-weight="600">Type-safe API (tRPC v11)</text>
    <g font-size="12" font-family="'Fira Code', monospace">
      <rect x="20" y="72" width="120" height="32" rx="16" fill="#0f172a" stroke="#22c55e"/>
      <text x="80" y="92" fill="#22c55e" text-anchor="middle">tRPC routers</text>
      <rect x="150" y="72" width="100" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="200" y="92" fill="#f8fafc" text-anchor="middle">Prisma</text>
      <rect x="260" y="72" width="140" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="330" y="92" fill="#f8fafc" text-anchor="middle">Gemini API</text>
      <rect x="410" y="72" width="130" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="475" y="92" fill="#f8fafc" text-anchor="middle">OAuth</text>
    </g>
  </g>

  <!-- Arrow down -->
  <g stroke="#22c55e" stroke-width="2" fill="none">
    <path d="M500 355 L500 380"/>
    <path d="M495 375 L500 383 L505 375"/>
  </g>

  <!-- Layer 3: Infrastructure -->
  <g transform="translate(50, 390)">
    <rect width="900" height="180" rx="12" fill="#1e293b" stroke="#334155"/>
    <text x="20" y="28" fill="#94a3b8" font-size="12" font-family="'Fira Code', monospace">LAYER 3 — INFRASTRUCTURE</text>
    <text x="20" y="54" fill="#f8fafc" font-size="20" font-weight="600">Data + Execution</text>
    <g font-size="12" font-family="'Fira Code', monospace">
      <!-- Data -->
      <rect x="20" y="72" width="140" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="90" y="92" fill="#f8fafc" text-anchor="middle">PostgreSQL 16</text>
      <rect x="170" y="72" width="100" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="220" y="92" fill="#f8fafc" text-anchor="middle">Redis 7</text>
      <rect x="280" y="72" width="100" height="32" rx="16" fill="#0f172a" stroke="#334155"/>
      <text x="330" y="92" fill="#f8fafc" text-anchor="middle">BullMQ</text>
      <!-- Executor + 4 sandboxes -->
      <rect x="400" y="72" width="120" height="32" rx="16" fill="#0f172a" stroke="#22c55e"/>
      <text x="460" y="92" fill="#22c55e" text-anchor="middle">Executor</text>
      <path d="M520 88 L560 88" stroke="#22c55e" stroke-width="1.5" fill="none"/>
      <rect x="560" y="72" width="100" height="32" rx="16" fill="#0f172a" stroke="#22c55e"/>
      <text x="610" y="92" fill="#22c55e" text-anchor="middle">Docker</text>
      <!-- Sandboxes -->
      <rect x="680" y="72" width="50" height="32" rx="8" fill="#0f172a" stroke="#334155"/>
      <text x="705" y="92" fill="#f8fafc" text-anchor="middle">Py</text>
      <rect x="740" y="72" width="50" height="32" rx="8" fill="#0f172a" stroke="#334155"/>
      <text x="765" y="92" fill="#f8fafc" text-anchor="middle">JS</text>
      <rect x="680" y="115" width="50" height="32" rx="8" fill="#0f172a" stroke="#334155"/>
      <text x="705" y="135" fill="#f8fafc" text-anchor="middle">C++</text>
      <rect x="740" y="115" width="50" height="32" rx="8" fill="#0f172a" stroke="#334155"/>
      <text x="765" y="135" fill="#f8fafc" text-anchor="middle">C</text>
    </g>
  </g>
</svg>
```

- [ ] **Step 2: Verify in browser** — 3 horizontal layers, arrows between, components visible.

- [ ] **Step 3: Commit**

```bash
git add docs/architecture.svg
git commit -m "feat(docs): replace architecture.svg with new 3-layer design"
```

---

### Task 3: features.svg

**Files:**
- Create: `docs/features.svg` (1200×800)

- [ ] **Step 1: Create `docs/features.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800" font-family="'Fira Sans', sans-serif">
  <rect width="1200" height="800" fill="#0f172a"/>

  <!-- Card template: 380x350, gap 30 -->
  <!-- Row 1 -->
  <g transform="translate(40, 40)">
    <!-- Card 1: Socratic AI -->
    <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
    <!-- Icon: chat bubble with ? -->
    <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
      <path d="M4 20 Q4 4 20 4 L44 4 Q60 4 60 20 Q60 36 44 36 L28 36 L16 48 L20 36 Q4 36 4 20 Z"/>
      <text x="32" y="28" fill="#22c55e" font-family="'Fira Code', monospace" font-size="20" font-weight="700" text-anchor="middle">?</text>
    </g>
    <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">Socratic AI</text>
    <text x="30" y="170" fill="#94a3b8" font-size="14">AI doesn't feed answers.</text>
    <text x="30" y="190" fill="#94a3b8" font-size="14">It asks questions to guide thinking.</text>

    <!-- Card 2: Sandbox -->
    <g transform="translate(400, 0)">
      <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
      <!-- Icon: Docker whale (simplified) -->
      <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
        <rect x="6" y="20" width="10" height="10"/>
        <rect x="18" y="20" width="10" height="10"/>
        <rect x="30" y="20" width="10" height="10"/>
        <rect x="18" y="8" width="10" height="10"/>
        <path d="M2 36 Q32 50 52 36" stroke-width="2.5"/>
      </g>
      <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">Sandbox Execution</text>
      <text x="30" y="170" fill="#94a3b8" font-size="14">Docker-isolated runtime.</text>
      <text x="30" y="190" fill="#94a3b8" font-size="14">Python · JS · C · C++ supported.</text>
      <!-- Language tags -->
      <g transform="translate(30, 220)" font-family="'Fira Code', monospace" font-size="11">
        <rect x="0" y="0" width="58" height="24" rx="12" fill="#0f172a" stroke="#334155"/>
        <text x="29" y="16" fill="#22c55e" text-anchor="middle">Python</text>
        <rect x="68" y="0" width="58" height="24" rx="12" fill="#0f172a" stroke="#334155"/>
        <text x="97" y="16" fill="#22c55e" text-anchor="middle">JS</text>
        <rect x="136" y="0" width="58" height="24" rx="12" fill="#0f172a" stroke="#334155"/>
        <text x="165" y="16" fill="#22c55e" text-anchor="middle">C++</text>
        <rect x="204" y="0" width="58" height="24" rx="12" fill="#0f172a" stroke="#334155"/>
        <text x="233" y="16" fill="#22c55e" text-anchor="middle">C</text>
      </g>
    </g>

    <!-- Card 3: Learn Map -->
    <g transform="translate(800, 0)">
      <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
      <!-- Icon: small graph -->
      <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
        <circle cx="12" cy="12" r="7"/>
        <circle cx="48" cy="12" r="7"/>
        <circle cx="30" cy="44" r="7"/>
        <path d="M18 16 L28 38"/>
        <path d="M42 16 L36 38"/>
      </g>
      <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">Learn Map</text>
      <text x="30" y="170" fill="#94a3b8" font-size="14">Interactive skill tree.</text>
      <text x="30" y="190" fill="#94a3b8" font-size="14">Click concepts to explore problems.</text>
    </g>
  </g>

  <!-- Row 2 -->
  <g transform="translate(40, 420)">
    <!-- Card 4: Adaptive Recs -->
    <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
    <!-- Icon: sparkle -->
    <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
      <path d="M32 4 L36 22 L54 26 L36 30 L32 48 L28 30 L10 26 L28 22 Z"/>
    </g>
    <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">Adaptive Recs</text>
    <text x="30" y="170" fill="#94a3b8" font-size="14">Daily problem recommendation.</text>
    <text x="30" y="190" fill="#94a3b8" font-size="14">Based on mastery + weakness patterns.</text>
    <!-- Stat bars -->
    <g transform="translate(30, 220)">
      <rect x="0" y="0" width="200" height="6" rx="3" fill="#0f172a"/>
      <rect x="0" y="0" width="140" height="6" rx="3" fill="#22c55e"/>
      <text x="210" y="8" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="11">70%</text>
      <rect x="0" y="16" width="200" height="6" rx="3" fill="#0f172a"/>
      <rect x="0" y="16" width="90" height="6" rx="3" fill="#f59e0b"/>
      <text x="210" y="24" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="11">45%</text>
      <rect x="0" y="32" width="200" height="6" rx="3" fill="#0f172a"/>
      <rect x="0" y="32" width="30" height="6" rx="3" fill="#64748b"/>
      <text x="210" y="40" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="11">15%</text>
    </g>

    <!-- Card 5: 71 Problems -->
    <g transform="translate(400, 0)">
      <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
      <!-- Icon: stacked books -->
      <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
        <rect x="6" y="6" width="40" height="8"/>
        <rect x="6" y="16" width="40" height="8"/>
        <rect x="6" y="26" width="40" height="8"/>
        <rect x="6" y="36" width="40" height="8"/>
      </g>
      <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">71 Curated Problems</text>
      <text x="30" y="170" fill="#94a3b8" font-size="14">Full Blind 75 coverage.</text>
      <text x="30" y="190" fill="#94a3b8" font-size="14">Array · DP · Graph · Tree · String...</text>
      <!-- Big number -->
      <text x="30" y="250" fill="#22c55e" font-family="'Fira Code', monospace" font-size="48" font-weight="700">71</text>
      <text x="30" y="280" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="12">problems across 10 categories</text>
    </g>

    <!-- Card 6: Code Editor -->
    <g transform="translate(800, 0)">
      <rect width="360" height="340" rx="16" fill="#1e293b" stroke="#334155"/>
      <!-- Icon: terminal cursor -->
      <g transform="translate(30, 30)" stroke="#22c55e" stroke-width="2" fill="none">
        <rect x="4" y="6" width="52" height="40" rx="4"/>
        <path d="M14 20 L20 26 L14 32"/>
        <path d="M26 34 L40 34"/>
      </g>
      <text x="30" y="140" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="20" font-weight="700">Code Editor</text>
      <text x="30" y="170" fill="#94a3b8" font-size="14">Monaco with AI chat.</text>
      <text x="30" y="190" fill="#94a3b8" font-size="14">Submit inline, see results live.</text>
      <!-- Mini code sample -->
      <g transform="translate(30, 220)" font-family="'Fira Code', monospace" font-size="11">
        <rect width="300" height="70" rx="6" fill="#0f172a"/>
        <text x="12" y="20" fill="#94a3b8">def twoSum(nums, target):</text>
        <text x="12" y="38" fill="#f8fafc">    m = {}</text>
        <text x="12" y="56" fill="#22c55e">    # AC: 2ms · 14MB</text>
      </g>
    </g>
  </g>
</svg>
```

- [ ] **Step 2: Verify in browser.**

- [ ] **Step 3: Commit**

```bash
git add docs/features.svg
git commit -m "feat(docs): add features.svg 6-card grid"
```

---

### Task 4: skill-framework.svg

**Files:**
- Create: `docs/skill-framework.svg` (1000×300)

- [ ] **Step 1: Create `docs/skill-framework.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" width="1000" height="300" font-family="'Fira Sans', sans-serif">
  <rect width="1000" height="300" fill="#0f172a"/>

  <!-- 5 stages, each 180 wide with 20 gap -->
  <!-- S -->
  <g transform="translate(40, 80)">
    <circle cx="40" cy="40" r="34" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
    <text x="40" y="50" fill="#22c55e" font-family="'Fira Code', monospace" font-size="28" font-weight="700" text-anchor="middle">S</text>
    <text x="40" y="100" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Socratic</text>
    <text x="40" y="120" fill="#94a3b8" font-size="11" text-anchor="middle">Ask, don't tell</text>
  </g>
  <!-- Arrow -->
  <g transform="translate(120, 120)" stroke="#334155" stroke-width="1.5" fill="none">
    <path d="M0 0 L48 0 M40 -5 L48 0 L40 5"/>
  </g>

  <!-- K -->
  <g transform="translate(220, 80)">
    <circle cx="40" cy="40" r="34" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
    <text x="40" y="50" fill="#22c55e" font-family="'Fira Code', monospace" font-size="28" font-weight="700" text-anchor="middle">K</text>
    <text x="40" y="100" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Knowledge</text>
    <text x="40" y="120" fill="#94a3b8" font-size="11" text-anchor="middle">Link patterns</text>
  </g>
  <g transform="translate(300, 120)" stroke="#334155" stroke-width="1.5" fill="none">
    <path d="M0 0 L48 0 M40 -5 L48 0 L40 5"/>
  </g>

  <!-- I -->
  <g transform="translate(400, 80)">
    <circle cx="40" cy="40" r="34" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
    <text x="40" y="50" fill="#22c55e" font-family="'Fira Code', monospace" font-size="28" font-weight="700" text-anchor="middle">I</text>
    <text x="40" y="100" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Iterative</text>
    <text x="40" y="120" fill="#94a3b8" font-size="11" text-anchor="middle">Brute → optimize</text>
  </g>
  <g transform="translate(480, 120)" stroke="#334155" stroke-width="1.5" fill="none">
    <path d="M0 0 L48 0 M40 -5 L48 0 L40 5"/>
  </g>

  <!-- L1 -->
  <g transform="translate(580, 80)">
    <circle cx="40" cy="40" r="34" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
    <text x="40" y="50" fill="#22c55e" font-family="'Fira Code', monospace" font-size="24" font-weight="700" text-anchor="middle">L1</text>
    <text x="40" y="100" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Logic</text>
    <text x="40" y="120" fill="#94a3b8" font-size="11" text-anchor="middle">Killer cases</text>
  </g>
  <g transform="translate(660, 120)" stroke="#334155" stroke-width="1.5" fill="none">
    <path d="M0 0 L48 0 M40 -5 L48 0 L40 5"/>
  </g>

  <!-- L2 -->
  <g transform="translate(760, 80)">
    <circle cx="40" cy="40" r="34" fill="#0f172a" stroke="#22c55e" stroke-width="2.5"/>
    <text x="40" y="50" fill="#22c55e" font-family="'Fira Code', monospace" font-size="24" font-weight="700" text-anchor="middle">L2</text>
    <text x="40" y="100" fill="#f8fafc" font-size="14" font-weight="600" text-anchor="middle">Evolution</text>
    <text x="40" y="120" fill="#94a3b8" font-size="11" text-anchor="middle">Update mastery</text>
  </g>

  <!-- Title -->
  <text x="500" y="40" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="18" font-weight="700" text-anchor="middle">The SKILL Teaching Framework</text>
  <text x="500" y="220" fill="#94a3b8" font-size="12" text-anchor="middle">Progressive pedagogy — guide, don't spoon-feed</text>
</svg>
```

- [ ] **Step 2: Verify**
- [ ] **Step 3: Commit**

```bash
git add docs/skill-framework.svg
git commit -m "feat(docs): add skill-framework.svg 5-stage flow"
```

---

### Task 5: learn-map.svg

**Files:**
- Create: `docs/learn-map.svg` (800×500)

- [ ] **Step 1: Create `docs/learn-map.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" font-family="'Fira Sans', sans-serif">
  <rect width="800" height="500" fill="#0f172a"/>

  <!-- Graph area (left 480px) -->
  <g transform="translate(40, 60)">
    <!-- Title -->
    <text x="0" y="-20" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700">SKILL TREE</text>

    <!-- Row 1: Array (mastered) -->
    <rect x="170" y="30" width="130" height="44" rx="8" fill="#064e3b" stroke="#22c55e"/>
    <text x="235" y="54" fill="#22c55e" font-family="'Fira Code', monospace" font-size="13" font-weight="600" text-anchor="middle">Array</text>
    <text x="235" y="68" fill="#94a3b8" font-size="9" text-anchor="middle">10/10 · 100%</text>

    <!-- Edges to row 2 -->
    <path d="M210 74 L120 130" stroke="#334155" stroke-width="1.5" fill="none"/>
    <path d="M260 74 L340 130" stroke="#334155" stroke-width="1.5" fill="none"/>

    <!-- Row 2: Two Pointer (learning), Stack (mastered) -->
    <rect x="60" y="130" width="130" height="44" rx="8" fill="#451a03" stroke="#f59e0b"/>
    <text x="125" y="154" fill="#f59e0b" font-family="'Fira Code', monospace" font-size="13" font-weight="600" text-anchor="middle">Two Pointer</text>
    <text x="125" y="168" fill="#94a3b8" font-size="9" text-anchor="middle">3/5 · 60%</text>

    <rect x="280" y="130" width="130" height="44" rx="8" fill="#064e3b" stroke="#22c55e"/>
    <text x="345" y="154" fill="#22c55e" font-family="'Fira Code', monospace" font-size="13" font-weight="600" text-anchor="middle">Stack</text>
    <text x="345" y="168" fill="#94a3b8" font-size="9" text-anchor="middle">4/4 · 100%</text>

    <!-- Edges to row 3 -->
    <path d="M125 174 L90 230" stroke="#334155" stroke-width="1.5" fill="none"/>
    <path d="M345 174 L400 230" stroke="#334155" stroke-width="1.5" fill="none"/>

    <!-- Row 3: Sliding Window (untouched), Monotonic Stack (untouched) -->
    <rect x="30" y="230" width="140" height="44" rx="8" fill="#0f172a" stroke="#334155"/>
    <text x="100" y="254" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="12" font-weight="600" text-anchor="middle">Sliding Window</text>
    <text x="100" y="268" fill="#64748b" font-size="9" text-anchor="middle">0/3 · 0%</text>

    <rect x="340" y="230" width="150" height="44" rx="8" fill="#0f172a" stroke="#334155"/>
    <text x="415" y="254" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="12" font-weight="600" text-anchor="middle">Monotonic Stack</text>
    <text x="415" y="268" fill="#64748b" font-size="9" text-anchor="middle">0/2 · 0%</text>

    <!-- Row 4: DP (locked - prereqs unmet) -->
    <rect x="160" y="330" width="180" height="44" rx="8" fill="#0f172a" stroke="#1e293b" stroke-dasharray="4,3"/>
    <text x="250" y="354" fill="#475569" font-family="'Fira Code', monospace" font-size="12" font-weight="600" text-anchor="middle">Dynamic Programming</text>
    <text x="250" y="368" fill="#475569" font-size="9" text-anchor="middle">locked</text>
    <path d="M235 230 L220 330" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="3,3" fill="none"/>
  </g>

  <!-- Right drawer -->
  <g transform="translate(540, 40)">
    <rect width="220" height="420" rx="12" fill="#1e293b" stroke="#334155"/>
    <text x="20" y="30" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700">Two Pointer</text>
    <text x="20" y="50" fill="#94a3b8" font-size="11">Traverse from both ends</text>

    <!-- Mastery bar -->
    <text x="20" y="90" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="10">MASTERY</text>
    <rect x="20" y="96" width="180" height="6" rx="3" fill="#0f172a"/>
    <rect x="20" y="96" width="108" height="6" rx="3" fill="#f59e0b"/>
    <text x="200" y="104" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="11" text-anchor="end">60%</text>

    <!-- Problems -->
    <text x="20" y="140" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="10">PROBLEMS</text>
    <g transform="translate(20, 150)" font-size="11">
      <!-- Row 1 -->
      <circle cx="8" cy="18" r="5" fill="#22c55e"/>
      <path d="M5 18 L7 20 L11 15" stroke="#0f172a" stroke-width="1.5" fill="none"/>
      <text x="22" y="22" fill="#f8fafc">Two Sum</text>
      <text x="180" y="22" fill="#22c55e" font-family="'Fira Code', monospace" text-anchor="end">Easy</text>
      <!-- Row 2 -->
      <circle cx="8" cy="46" r="5" fill="#22c55e"/>
      <path d="M5 46 L7 48 L11 43" stroke="#0f172a" stroke-width="1.5" fill="none"/>
      <text x="22" y="50" fill="#f8fafc">3Sum</text>
      <text x="180" y="50" fill="#f59e0b" font-family="'Fira Code', monospace" text-anchor="end">Medium</text>
      <!-- Row 3 -->
      <circle cx="8" cy="74" r="5" fill="#1e293b" stroke="#475569"/>
      <text x="22" y="78" fill="#94a3b8">Container Water</text>
      <text x="180" y="78" fill="#f59e0b" font-family="'Fira Code', monospace" text-anchor="end">Medium</text>
    </g>

    <!-- Recommendations -->
    <text x="20" y="280" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="10">NEXT STEP</text>
    <rect x="20" y="292" width="180" height="28" rx="14" fill="#064e3b" stroke="#22c55e"/>
    <text x="110" y="310" fill="#22c55e" font-family="'Fira Code', monospace" font-size="11" text-anchor="middle">Practice Container Water</text>
  </g>
</svg>
```

- [ ] **Step 2: Verify in browser.**
- [ ] **Step 3: Commit**

```bash
git add docs/learn-map.svg
git commit -m "feat(docs): add learn-map.svg skill tree preview"
```

---

### Task 6: execution-flow.svg

**Files:**
- Create: `docs/execution-flow.svg` (1200×400)

- [ ] **Step 1: Create `docs/execution-flow.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400" font-family="'Fira Sans', sans-serif">
  <rect width="1200" height="400" fill="#0f172a"/>

  <!-- Title -->
  <text x="600" y="40" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="16" font-weight="700" text-anchor="middle">Execution Pipeline</text>

  <!-- 6 boxes at y=120, w=170, h=90, gaps 20 -->
  <!-- Box 1: Editor -->
  <g transform="translate(20, 120)">
    <rect width="170" height="90" rx="10" fill="#1e293b" stroke="#334155"/>
    <text x="85" y="30" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 1</text>
    <text x="85" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700" text-anchor="middle">Editor</text>
    <text x="85" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">Monaco code submit</text>
  </g>

  <g stroke="#22c55e" stroke-width="1.5" fill="none">
    <path d="M200 165 L210 165 M202 160 L210 165 L202 170"/>
  </g>

  <!-- Box 2: Parse args -->
  <g transform="translate(220, 120)">
    <rect width="170" height="90" rx="10" fill="#1e293b" stroke="#334155"/>
    <text x="85" y="30" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 2</text>
    <text x="85" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700" text-anchor="middle">parseTestInput</text>
    <text x="85" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">YAML → JSON args</text>
  </g>

  <g stroke="#22c55e" stroke-width="1.5" fill="none">
    <path d="M400 165 L410 165 M402 160 L410 165 L402 170"/>
  </g>

  <!-- Box 3: Queue -->
  <g transform="translate(420, 120)">
    <rect width="170" height="90" rx="10" fill="#1e293b" stroke="#334155"/>
    <text x="85" y="30" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 3</text>
    <text x="85" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700" text-anchor="middle">Queue (BullMQ)</text>
    <text x="85" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">Redis-backed, 1 worker</text>
  </g>

  <g stroke="#22c55e" stroke-width="1.5" fill="none">
    <path d="M600 165 L610 165 M602 160 L610 165 L602 170"/>
  </g>

  <!-- Box 4: Compile cache -->
  <g transform="translate(620, 120)">
    <rect width="170" height="90" rx="10" fill="#1e293b" stroke="#22c55e"/>
    <text x="85" y="30" fill="#22c55e" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 4 · CACHED</text>
    <text x="85" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="13" font-weight="700" text-anchor="middle">Compile (C/C++)</text>
    <text x="85" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">1× per submission, 5× speedup</text>
  </g>

  <g stroke="#22c55e" stroke-width="1.5" fill="none">
    <path d="M800 165 L810 165 M802 160 L810 165 L802 170"/>
  </g>

  <!-- Box 5: Docker Sandbox -->
  <g transform="translate(820, 120)">
    <rect width="170" height="90" rx="10" fill="#1e293b" stroke="#334155"/>
    <text x="85" y="30" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 5</text>
    <text x="85" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700" text-anchor="middle">Docker Sandbox</text>
    <text x="85" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">Isolated, no network, 256MB</text>
  </g>

  <g stroke="#22c55e" stroke-width="1.5" fill="none">
    <path d="M1000 165 L1010 165 M1002 160 L1010 165 L1002 170"/>
  </g>

  <!-- Box 6: Judge -->
  <g transform="translate(1020, 120)">
    <rect width="160" height="90" rx="10" fill="#1e293b" stroke="#22c55e"/>
    <text x="80" y="30" fill="#22c55e" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">STEP 6</text>
    <text x="80" y="52" fill="#f8fafc" font-family="'Fira Code', monospace" font-size="14" font-weight="700" text-anchor="middle">Judge</text>
    <text x="80" y="72" fill="#94a3b8" font-size="10" text-anchor="middle">Deep-sort + TreeNode</text>
  </g>

  <!-- Footer callout -->
  <g transform="translate(600, 300)">
    <rect x="-250" y="0" width="500" height="50" rx="8" fill="#064e3b" stroke="#22c55e"/>
    <text x="0" y="22" fill="#22c55e" font-family="'Fira Code', monospace" font-size="11" font-weight="700" text-anchor="middle">COMPILE CACHE</text>
    <text x="0" y="38" fill="#f8fafc" font-size="11" text-anchor="middle">3-5s compile → reused across all test cases = 5× speedup for C/C++</text>
  </g>
</svg>
```

- [ ] **Step 2: Verify**
- [ ] **Step 3: Commit**

```bash
git add docs/execution-flow.svg
git commit -m "feat(docs): add execution-flow.svg pipeline diagram"
```

---

## Phase 2: README Rewrite

### Task 7: Rewrite README.md

**Files:**
- Modify: `README.md` (full rewrite, ~250 lines)

- [ ] **Step 1: Overwrite `README.md`**

```markdown
# AI Pair Programmer

<p align="center">
  <img src="docs/hero.svg" alt="AI Pair Programmer" width="100%"/>
</p>

<p align="center">
  <em>Socratic AI coding tutor that teaches you to <b>think</b>, not memorize —<br/>
  with instant Docker-sandboxed execution in 4 languages.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-22c55e" alt="MIT License"/>
  <img src="https://img.shields.io/badge/Next.js-15-0f172a" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/tests-284%2F284-22c55e" alt="284 tests passing"/>
  <img src="https://img.shields.io/badge/problems-71%20Blind%2075-22c55e" alt="71 problems"/>
  <img src="https://img.shields.io/badge/languages-4-0f172a" alt="4 languages"/>
</p>

---

## ✨ Features

<p align="center">
  <img src="docs/features.svg" alt="Features overview" width="100%"/>
</p>

- **Socratic AI Tutor** — The AI doesn't feed you answers. It asks questions that expose your assumptions and guides you toward your own insights, using the five-stage SKILL framework.
- **Multi-language Sandbox Execution** — Submit Python, JavaScript, C, or C++ and get instant results. Code runs in isolated Docker containers with memory/CPU limits and no network access.
- **Interactive Learn Map** — Skill-tree-style knowledge graph of 31 algorithm concepts. Click a concept to see related problems, your mastery level, prerequisites, and the next recommended step.
- **Adaptive Recommendations** — Every submission updates your concept mastery. The daily recommendation surfaces the next problem that fills your weakest spot.
- **71 Curated Problems** — The full Blind 75 list (minus a few design-style problems), across Array, DP, Graph, Tree, String, Linked List, Interval, Matrix, Binary, and Heap.
- **AI Chat Sidebar** — Every problem page has an AI chat paired with a Monaco code editor, so you can ask questions without leaving the workspace.

---

## 🏗️ Architecture

<p align="center">
  <img src="docs/architecture.svg" alt="Architecture" width="100%"/>
</p>

Three layers:

1. **Client** — Next.js 15 (App Router) + React 19. React Flow for the skill tree, Monaco for the editor, Tailwind for styling, NextAuth.js v5 for Google/GitHub OAuth.
2. **API** — tRPC v11 (type-safe), Prisma ORM, Google Gemini 2.0 Flash for AI chat. All requests are type-checked end-to-end.
3. **Infrastructure** — PostgreSQL 16 + Redis 7 (BullMQ). A standalone Executor service pulls submissions off the queue and runs them in language-specific Docker containers (Python, JS, C/C++).

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Monaco Editor, React Flow |
| API | tRPC v11, NextAuth.js v5 |
| Database | PostgreSQL 16 + Prisma ORM |
| Cache / Queue | Redis 7 + BullMQ |
| AI | Google Gemini 2.0 Flash (free tier available) |
| Code Execution | Docker sandboxes + BullMQ worker |
| Testing | Vitest (unit) + custom Python E2E harness |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### One-command setup

```bash
git clone https://github.com/chadcoco1444/ai-pair-programmer.git
cd ai-pair-programmer
npm run setup
```

This installs dependencies, starts PostgreSQL and Redis, applies the Prisma schema, seeds the 71 Blind 75 problems, and builds the language Docker images.

### Configure API keys

Edit `.env` and fill in:

```env
# AI tutor — free tier at https://aistudio.google.com/apikey
GEMINI_API_KEY="your-key"

# OAuth — set at least one provider
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Optional — PostgreSQL/Redis defaults work with docker-compose
DATABASE_URL="postgresql://skill:skill_password@localhost:5433/skill_platform?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Start the dev environment

```bash
npm run dev:web
```

This starts PostgreSQL, Redis, the Executor service, and Next.js in a single command. Open http://localhost:3001.

---

## 📚 The SKILL Teaching Framework

<p align="center">
  <img src="docs/skill-framework.svg" alt="SKILL framework" width="100%"/>
</p>

> **S**ystematic **K**nowledge & **I**ntegrated **L**ogic **L**earning

A five-stage pedagogy designed to build lasting algorithmic intuition.

| Stage | Behavior |
|-------|----------|
| **S** — Socratic | Ask questions to probe understanding. Never assume what the learner knows or doesn't. |
| **K** — Knowledge | Progressively reveal algorithmic patterns. Let the learner discover them. |
| **I** — Iterative | Start with brute force → identify bottlenecks → optimize. |
| **L1** — Logic | Hit the solution with killer test cases. Force edge-case reasoning. |
| **L2** — Evolution | Update mastery scores, recommend the next concept. |

---

## 🗺️ Learn Map

<p align="center">
  <img src="docs/learn-map.svg" alt="Learn Map preview" width="100%"/>
</p>

The `/learn` page renders a top-down skill tree of 31 concepts, colored by your mastery:

- 🟢 **Mastered** (>70%) — Emerald
- 🟡 **Learning** (40–70%) — Amber
- ⚪ **Untouched** (<40%) — Slate
- 🔒 **Locked** — Dimmed when prerequisite concepts aren't mastered yet

Clicking a node opens a drawer with:

- Concept description + mastery bar
- Prerequisite and follow-up concepts (clickable chips)
- Problems list with solved/unsolved indicators
- Your recent submissions
- Weakness stats for that concept

---

## ⚡ Execution Pipeline

<p align="center">
  <img src="docs/execution-flow.svg" alt="Execution pipeline" width="100%"/>
</p>

1. **Editor** — User submits code via Monaco.
2. **parseTestInput** — Free-form YAML input gets parsed into `any[]` argument arrays, server-side.
3. **Queue** — BullMQ job enters the Redis queue, picked up by a single-concurrency worker (avoiding Docker snapshot races).
4. **Compile (cached)** — For C/C++, the source compiles once. The resulting image is reused across all test cases. 5× speedup.
5. **Docker Sandbox** — Isolated container with no network, 256 MB memory cap, 50 PIDs, read-only root FS, dropped capabilities.
6. **Judge** — Output compared with expected using deep-sorted array comparison + TreeNode value matching for robust correctness checks.

---

## 📊 Problem Catalog

| Category | Count | Difficulty |
|----------|-------|------------|
| Array | 10 | 3 Easy · 7 Medium |
| Binary | 5 | 4 Easy · 1 Medium |
| Dynamic Programming | 11 | 1 Easy · 10 Medium |
| Graph | 7 | 7 Medium |
| Heap | 2 | 1 Medium · 1 Hard |
| Interval | 3 | 3 Medium |
| Linked List | 6 | 3 Easy · 2 Medium · 1 Hard |
| Matrix | 4 | 4 Medium |
| String | 10 | 3 Easy · 7 Medium |
| Tree | 13 | 4 Easy · 6 Medium · 3 Hard |
| **Total** | **71** | **18 Easy · 47 Medium · 6 Hard** |

---

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (deps, Docker, schema, seed, images) |
| `npm run dev:web` | Start the full dev environment |
| `npm run stop` | Stop all Docker services |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Python E2E tests (71 problems) |
| `npm run test:e2e:js` | Run JavaScript E2E tests |
| `npm run test:e2e:cpp` | Run C++ E2E tests |
| `npm run test:e2e:c` | Run C E2E tests |
| `npm run test:e2e:all` | Run all four language E2E suites |
| `npm run db:seed` | Re-import seed data |
| `npm run db:reset` | Drop and recreate DB, then re-seed |
| `npm run db:studio` | Open Prisma Studio |

---

## 📁 Project Structure

```
ai-pair-programmer/
├── apps/web/                      # Next.js application
│   ├── src/app/                   # App Router pages (home, practice, learn, dashboard, profile)
│   ├── src/components/            # React components (chat, editor, charts)
│   ├── src/server/
│   │   ├── services/              # SKILL orchestrator, adaptive learning, knowledge graph
│   │   └── routers/               # tRPC: user, problem, concept, conversation, submission, learning
│   ├── src/hooks/                 # useChat (SSE), useSubmission
│   └── prisma/                    # Schema + seed script
├── services/executor/             # Sandbox execution engine
│   ├── src/                       # Express API + BullMQ worker + Docker sandbox
│   └── images/                    # Language Docker images (Python, C/C++, JS)
├── packages/shared/               # Shared types and constants
├── seed/                          # Problems + knowledge graph YAML
├── tests/                         # E2E test scripts + solutions in all 4 languages
│   ├── solutions/                 # 71 Python solutions
│   ├── solutions_js/              # 71 JavaScript solutions
│   ├── solutions_cpp/             # 71 C++ solutions + json_helper.h
│   └── solutions_c/               # 71 C solutions + json_helper.h
├── scripts/                       # setup.mjs, dev.mjs, stop.mjs
└── docker-compose.yml
```

---

## 🧪 Testing

The project has two test layers:

**Unit tests** — Vitest, located next to the code they verify.

```bash
cd apps/web && npx vitest run          # 83 tests
cd services/executor && npx vitest run # 37 tests
```

**E2E tests** — Python harness (`tests/e2e_executor_*.py`) that submits every solution file to the live executor and checks the verdict. 71 problems × 4 languages = **284 tests total**.

```bash
npm run test:e2e:all
```

All 284 E2E tests pass on the main branch. See `.claude/skills/e2e-solution-regression.md` for the regression workflow.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/my-feature`
2. Follow the code style: ESLint + Prettier run on commit
3. Add tests for new functionality
4. Run the full test suite before pushing:
   ```bash
   cd apps/web && npx vitest run
   npm run test:e2e:all
   ```
5. Open a PR with a clear description

For larger features, open a discussion first under `/docs/superpowers/specs/` (spec) then `/docs/superpowers/plans/` (plan) before coding.

---

## 📄 License

MIT © 2026. See [LICENSE](LICENSE) for details.
```

- [ ] **Step 2: Verify**

Open `README.md` in a Markdown preview or push to a branch and view on GitHub. Verify:
- 6 SVGs render inline
- Tables display
- Code blocks highlight
- No Chinese text remaining

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README in English with features, architecture, SVGs"
```

---

## Phase 3: UI String Translations

### Task 8: Translate UI strings in /apps/web/src/app

**Files:**
- Modify every `.tsx` file under `apps/web/src/app/` containing Chinese characters

- [ ] **Step 1: Find all Chinese-containing files**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer"
grep -rln "[\xe4-\xe9][\x80-\xbf][\x80-\xbf]" apps/web/src/app 2>/dev/null
```

Alternative on Windows:
```bash
python -c "import os, re; [print(f) for r,_,fs in os.walk('apps/web/src/app') for f in fs if f.endswith(('.ts','.tsx')) and re.search(r'[\u4e00-\u9fff]', open(os.path.join(r,f), encoding='utf-8').read())]"
```

- [ ] **Step 2: For each file, replace Chinese strings with English**

Use these canonical translations:

| Chinese | English |
|---------|---------|
| 題目 | Problems |
| 儀表板 | Dashboard |
| 個人檔案 | Profile |
| 學習地圖 | Learn Map |
| 提交歷史 | Submission History |
| 最近提交 | Recent Submissions |
| 掌握度 | Mastery |
| 掌握概念 | Concepts Mastered |
| 通過率 | Acceptance Rate |
| 通過題數 | Problems Solved |
| 提交 | Submit |
| 執行 | Run |
| 載入中 | Loading... |
| 載入圖譜 | Loading graph... |
| 已解 | Solved |
| 未解 | Unsolved |
| 每日推薦 | Daily Recommendations |
| 今日推薦 | Today's Recommendation |
| 弱點統計 | Weakness Stats |
| 先修 | Prerequisites |
| 後續 | Follow-ups |
| 題目 (n/m) | Problems (n/m) |
| 升級進度 | Level Progress |
| 達標 | Met |
| 需要加強的地方 | Areas to Improve |
| 還沒有提交記錄 | No submissions yet |
| 暫無推薦 | No recommendations yet |
| 暫無推薦 — 先完成幾題以解鎖個人化推薦 | No recommendations yet — solve a few problems to unlock personalized picks |
| 點選概念查看題目 | Click a concept to see problems |
| 依 prerequisite 排列 | Arranged by prerequisite |
| 去解題 → | Start solving → |
| 語言 | Language |
| 耗時 | Runtime |
| 記憶體 | Memory |
| 時間 | Time |
| 狀態 | Status |

For each file:
1. Open with Read
2. Identify every Chinese string literal or JSX text
3. Replace with the English equivalent from the table (or translate idiomatically if not listed)
4. Preserve all code structure, imports, hooks, handlers

Test with `npx vitest run` after each file to catch regressions.

- [ ] **Step 3: Commit after each file or logical group**

```bash
git add apps/web/src/app/<path>
git commit -m "i18n: translate <page> UI strings to English"
```

Suggested groupings (one commit each):
- `apps/web/src/app/page.tsx` (landing)
- `apps/web/src/app/practice/**` (list + detail)
- `apps/web/src/app/learn/**` (page + components)
- `apps/web/src/app/dashboard/**`
- `apps/web/src/app/profile/**`

---

### Task 9: Translate UI strings in /apps/web/src/components

**Files:**
- Modify every `.tsx` file under `apps/web/src/components/` containing Chinese

- [ ] **Step 1: Find files**

Same find strategy as Task 8, scoped to `apps/web/src/components`.

- [ ] **Step 2: Translate using the same canonical table + general judgment**

Components likely to have Chinese:
- `nav-bar.tsx` (should be English from prior work — verify)
- `auth-button.tsx` (verify)
- `chat/chat-message.tsx`
- `chat/chat-panel.tsx`
- `dashboard/knowledge-graph-viz.tsx`
- `dashboard/concept-panel.tsx`

- [ ] **Step 3: Run tests**

```bash
cd apps/web && npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components
git commit -m "i18n: translate shared components to English"
```

---

### Task 10: Translate server comments + messages

**Files:**
- Modify `.ts` files under `apps/web/src/server/`
- Modify `.ts` files under `services/executor/src/`

- [ ] **Step 1: Find files with Chinese comments**

Same method as Task 8, scoped to these directories.

- [ ] **Step 2: Translate comments + any error messages**

Common patterns to translate:

| Chinese comment | English comment |
|-----------------|-----------------|
| `// 提交程式碼` | `// Submit code` |
| `// 取得所有測資（含隱藏）` | `// Fetch all test cases (including hidden)` |
| `// 建立輔助函式，過濾 Postgres 不支援的 null byte` | `// Helper to strip null bytes (unsupported in Postgres)` |
| `// 建立提交記錄` | `// Create submission record` |
| `// 呼叫執行引擎` | `// Call execution engine` |
| `// 更新提交記錄` | `// Update submission record` |
| `// 執行引擎不可用時` | `// Handle executor service unavailable` |
| `// 查詢提交歷史` | `// Fetch submission history` |
| `// 查詢單一提交詳情` | `// Fetch a single submission` |
| `編譯失敗` | `Compile failed` |
| `不支援的語言: ...` | `Unsupported language: ...` |
| `任務 ${id} 完成` | `Job ${id} completed` |
| `任務 ${id} 失敗` | `Job ${id} failed` |
| `執行引擎服務啟動於 port ${PORT}` | `Executor service listening on port ${PORT}` |
| `執行 Worker 已啟動，等待任務...` | `Executor worker started, waiting for jobs...` |
| `缺少必要欄位` | `Missing required fields` |
| `找不到任務` | `Job not found` |
| `任務已加入佇列` | `Job queued` |

- [ ] **Step 3: Run tests**

```bash
cd apps/web && npx vitest run
cd services/executor && npx vitest run
```

Both should still pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/server services/executor/src
git commit -m "i18n: translate server comments + log messages to English"
```

---

## Phase 4: YAML Hints Translation

### Task 11: Translate YAML hints

**Files:**
- Modify `seed/problems/**/*.yaml` (71 files)

- [ ] **Step 1: Identify files with Chinese hints**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer"
grep -rln "[\xe4-\xe9][\x80-\xbf][\x80-\xbf]" seed/problems 2>/dev/null
```

- [ ] **Step 2: Translate hints array in each file**

For each YAML file, translate ONLY the `hints:` list. Do not modify `description`, `testCases`, `starterCode`, `title`, `slug`, `tags`, `category`, `difficulty`.

Example diff:

Before:
```yaml
hints:
  - 考慮使用雙指針從兩端向中間縮小範圍。
  - 比較兩端的高度，移動較矮的那個。
  - 記錄過程中的最大面積。
```

After:
```yaml
hints:
  - Consider a two-pointer approach shrinking from both ends toward the middle.
  - Compare heights at both pointers and move the shorter one inward.
  - Track the maximum area seen during the scan.
```

- [ ] **Step 3: Re-seed the DB**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && npm run db:seed
```

Expected: "種子資料匯入完成！" (or the English equivalent once seed script is also translated — see Task 12).

- [ ] **Step 4: Run E2E sanity check**

```bash
npm run test:e2e
```

Expected: `Total: 71 | Pass: 71 | Fail: 0 | Skip: 0` (no regression — hints aren't checked by E2E, but good paranoia).

- [ ] **Step 5: Commit**

```bash
git add seed/problems
git commit -m "i18n: translate YAML hints to English for all 71 problems"
```

---

## Phase 5: Seed Script + Misc Scripts

### Task 12: Translate seed script + helper scripts

**Files:**
- Modify `apps/web/prisma/seed.ts`
- Modify `scripts/setup.mjs`, `scripts/dev.mjs`, `scripts/stop.mjs` (if they have Chinese)

- [ ] **Step 1: Find Chinese in these files**

```bash
grep -n "[\xe4-\xe9][\x80-\xbf][\x80-\xbf]" apps/web/prisma/seed.ts scripts/*.mjs 2>/dev/null
```

- [ ] **Step 2: Translate log messages**

Common replacements:

| Chinese | English |
|---------|---------|
| `匯入 N 個概念...` | `Importing ${n} concepts...` |
| `匯入題目: ${title}` | `Importing problem: ${title}` |
| `跳過概念連結 ${name}：找不到概念` | `Skipping concept link ${name}: concept not found` |
| `種子資料匯入完成！` | `Seed data imported successfully.` |
| `首次設定開始...` | `Starting first-time setup...` |
| `安裝依賴...` | `Installing dependencies...` |
| `啟動 Docker 服務...` | `Starting Docker services...` |
| `同步資料庫 schema...` | `Syncing database schema...` |
| `匯入種子資料...` | `Seeding database...` |
| `建置 Docker 映像...` | `Building Docker images...` |
| `設定完成！` | `Setup complete!` |

- [ ] **Step 3: Run setup + seed to verify**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && npm run db:seed
```

Expected: new English log messages.

- [ ] **Step 4: Commit**

```bash
git add apps/web/prisma/seed.ts scripts/
git commit -m "i18n: translate seed + setup scripts to English"
```

---

## Phase 6: Verification + Push

### Task 13: Final verification

- [ ] **Step 1: Grep for any remaining Chinese**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer"
python -c "import os, re, sys; found=False
for r,_,fs in os.walk('.'):
  if any(s in r for s in ['node_modules', '.git', 'docs/superpowers', '.claude/skills', 'design-system']): continue
  for f in fs:
    if not f.endswith(('.ts','.tsx','.js','.jsx','.py','.yaml','.md','.mjs','.css')): continue
    p=os.path.join(r,f)
    try:
      content=open(p, encoding='utf-8').read()
      matches=re.findall(r'[\u4e00-\u9fff]+', content)
      if matches:
        found=True
        print(f'{p}: {len(matches)} Chinese strings')
    except: pass
sys.exit(0 if not found else 1)"
```

Expected: no output except whitelisted paths (`docs/superpowers/`, `.claude/skills/`, `design-system/`).

If any remaining, translate them and repeat the step.

- [ ] **Step 2: Run full unit test suite**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\apps\web" && npx vitest run
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer\services\executor" && npx vitest run
```

Expected: ALL PASS (83 + 37 = 120 tests).

- [ ] **Step 3: Run all 4 E2E suites**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && npm run test:e2e:all
```

Expected: 284/284 pass across Python, JS, C++, C.

- [ ] **Step 4: Visual check**

Restart web dev and open each page in browser:

```bash
npm run dev:web
```

Open `http://localhost:3001` and navigate through:
- `/` — landing (English hero, features)
- `/practice` — problem list (English labels)
- `/practice/two-sum` — problem detail (English buttons, tabs)
- `/learn` — skill tree (English drawer, banner)
- `/dashboard` — bento cards (English stat labels)
- `/profile` — stats + table (English headers, statuses)

No Chinese strings should appear anywhere except explicitly whitelisted (user-generated content like their own name).

- [ ] **Step 5: Push**

```bash
cd "c:\Users\88698\Desktop\Workspace\AI Pair Programmer" && git push
```

---

## Summary

**Total tasks:** 13

- Phase 1: 6 tasks (SVGs)
- Phase 2: 1 task (README)
- Phase 3: 3 tasks (UI + server i18n)
- Phase 4: 1 task (YAML)
- Phase 5: 1 task (scripts)
- Phase 6: 1 task (verify + push)

**Key checkpoints:**

1. After Phase 1 — 6 SVG files render correctly, visible via browser preview
2. After Phase 2 — README renders on GitHub, all 6 SVGs inline
3. After Phase 3 — UI displays English throughout, all unit tests pass
4. After Phase 4 — DB reseeded with English hints, E2E still 71/71
5. After Phase 6 — no Chinese remaining (except whitelisted), all 284 E2E pass

**Non-goals reminder:**
- Git history untouched
- `docs/superpowers/**` stays Chinese
- `.claude/skills/**` not published
- No i18n framework added — English only
