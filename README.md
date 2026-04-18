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
- **Beginner Mode** — `BEGINNER` and `INTERMEDIATE` users get an automatic concrete walk-through on their first message: the AI picks a real input from the problem and asks three hand-simulation questions before touching any algorithm name.
- **Input Visualizer** — Every problem page renders its test-case inputs as inline SVGs. Arrays become index-labelled boxes, trees become node diagrams with edges, matrices become grids, linked lists show arrow chains. New shape? Add one renderer file.
- **AI Tutor Suggestion Chips** — Six starter prompts above the chat (Approach / Review / Hint / Explain / Complexity / Edge cases) with code injection, so beginners don't stare at an empty input.
- **Multi-language Sandbox Execution** — Submit Python, JavaScript, C, or C++ and get instant results. Code runs in isolated Docker containers with memory/CPU limits and no network access.
- **Interactive Learn Map** — Skill-tree-style knowledge graph of 22 visible algorithm concepts (31 total in the seed). Click a concept to see related problems, your mastery level, prerequisites, and the next recommended step.
- **Adaptive Recommendations** — Every submission updates your concept mastery. The daily recommendation surfaces the next problem that fills your weakest spot.
- **71 Curated Problems** — The full Blind 75 list (minus a few design-style problems), across Array, DP, Graph, Tree, String, Linked List, Interval, Matrix, Binary, and Heap.

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
| **S** — Socratic | Ask questions to probe understanding. Never assume what the learner knows or doesn't. For `BEGINNER`/`INTERMEDIATE` users, the first Socratic exchange is a forced concrete walk-through on a specific input. |
| **K** — Knowledge | Progressively reveal algorithmic patterns. Let the learner discover them. |
| **I** — Iterative | Start with brute force → identify bottlenecks → optimize. |
| **L1** — Logic | Hit the solution with killer test cases. Force edge-case reasoning. |
| **L2** — Evolution | Update mastery scores, recommend the next concept. |

---

## 🗺️ Learn Map

<p align="center">
  <img src="docs/learn-map.svg" alt="Learn Map preview" width="100%"/>
</p>

The `/learn` page renders a top-down skill tree of 22 concepts (concepts without linked problems are hidden), colored by your mastery:

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
cd apps/web && npx vitest run          # 136 tests (SKILL prompts, input-visualizer, chips, routers, ...)
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
