# Remotion Product Videos Design

**Date**: 2026-04-18
**Status**: Approved — ready for implementation plan

## Problem

The repo has great static assets (README + 6 SVGs) explaining what AI Pair Programmer is, but nothing shows what it feels like to **use** it. Beginners who land on the site or see a Twitter post need to see the Socratic walk-through, the inline input visualization, the skill tree mastery loop *in motion* before they'll invest setup time.

Goal: produce two polished product videos rendered with [Remotion](https://www.remotion.dev/) — a Hero cut for the landing page and a longer Walkthrough cut (~2:35) for YouTube / Product Hunt. Both are produced from the same scene components (DRY), showcase the actual beginner pedagogy features that just shipped, and can be re-rendered automatically whenever the product narrative changes.

## Features

### Hero video (~40s)

- **Use**: landing page hero, autoplay muted, loops
- **Aspect**: 1920×1080 @ 30 fps, MP4 (H.264)
- **Audio**: silent (intended for autoplay)
- **Captions**: on-screen kinetic text; no voiceover
- **Core message**: beginner-friendly Socratic AI with visualized inputs

Storyboard:

| Time | Scene |
|------|-------|
| 0:00–0:03 | Hook kinetic text: *"Stop memorizing. Start thinking."* |
| 0:03–0:11 | Socratic chat animation: AI bubble *"What's your first instinct?"*, student types, reply |
| 0:11–0:26 | Beginner walkthrough on Two Sum: `nums=[2,7,11,15], target=9` appears; array cells highlight as AI poses 3 concrete questions in sequence |
| 0:26–0:33 | Skill Tree: 22 concept nodes animate from slate → amber → emerald, mastery bar fills |
| 0:33–0:40 | Outro: logo, `github.com/chadcoco1444/ai-pair-programmer`, CTA |

### Walkthrough video (~2:35)

- **Use**: YouTube / Product Hunt feature image, README "Demo" link
- **Aspect**: 1920×1080 @ 30 fps, MP4 (H.264)
- **Audio**: royalty-free lofi/ambient BGM (Pixabay) at −20 dB under narration level (no narration, so BGM sits at normal listening volume −12 dB)
- **Captions**: burned-in English captions, timed to scenes
- **Core message**: full usage narrative — pain → thesis → product loop

Storyboard:

| Time | Scene |
|------|-------|
| 0:00–0:15 | Pain statement on black: *"70% of self-taught developers quit LeetCode within a month."* |
| 0:15–0:25 | Thesis: *"The AI should ask questions. Not hand you answers."* |
| 0:25–0:40 | Open `/practice/two-sum` — problem description renders + Input Visualizer array animates in |
| 0:40–0:50 | Click AI Tutor tab; 6 suggestion chips slide in |
| 0:50–1:15 | Click *"I don't know how to start"* chip → AI fires beginner walkthrough; 3 concrete questions type one at a time; student replies appear |
| 1:15–1:40 | Phase transitions to Knowledge; AI guides toward Hash Table pattern |
| 1:40–2:00 | Monaco editor simulated typing; Submit → sandbox ACCEPTED with green check |
| 2:00–2:15 | Cut to Learn Map; Array / Hash Table mastery bars fill from 40% → 85% |
| 2:15–2:25 | Daily Recommendation banner slides up with next problem |
| 2:25–2:35 | Outro: logo + URL + GitHub CTA |

## Architecture

### Install location: new workspace `apps/video/`

```
apps/video/
├── package.json                         # Remotion workspace
├── tsconfig.json
├── remotion.config.ts                   # render settings (codec, fps, res)
├── src/
│   ├── Root.tsx                         # Remotion composition registry
│   ├── compositions/
│   │   ├── Hero.tsx                     # 40s composition
│   │   └── Walkthrough.tsx              # 140s composition
│   ├── scenes/                          # shared scene React components
│   │   ├── HookKineticText.tsx
│   │   ├── SocraticChat.tsx
│   │   ├── BeginnerWalkthrough.tsx
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
│   ├── ui/                              # micro-components used across scenes
│   │   ├── ChatBubble.tsx
│   │   ├── ChipPill.tsx
│   │   ├── MacWindow.tsx
│   │   ├── CodeLine.tsx
│   │   ├── Caption.tsx
│   │   └── ConceptNode.tsx
│   ├── fixtures/
│   │   ├── two-sum.ts                   # frozen snapshot of Two Sum problem + test cases
│   │   ├── concepts.ts                  # 22 concept nodes with mastery progression
│   │   └── walkthrough-script.ts        # exact chat messages + timings
│   ├── theme/
│   │   ├── colors.ts                    # #0f172a/#1e293b/#22c55e/etc — same as main app
│   │   └── typography.ts                # Fira Code / Fira Sans loading
│   └── animations/                      # reusable Remotion helpers
│       ├── typeLetter.ts                # letter-by-letter typing with cursor
│       ├── bubbleIn.ts                  # chat bubble entrance
│       └── barFill.ts                   # mastery bar fill
└── public/
    └── bgm.mp3                          # royalty-free BGM
```

### Reuse of existing code

**Directly imported from `apps/web/src/lib/input-visualizer/renderers/`** (these are pure JSX functions, no React hooks, no Node-only dependencies — safe to consume from another React app):

- `renderArray` for the Two Sum visualization in scenes
- `renderTree` for optional later scene
- `renderMatrix` etc. — available if we add later demos

**Replicated** (not directly importable due to depending on the actual chat/editor infra):

- Chat bubble look: re-create with Tailwind classes copied from `apps/web/src/components/chat/chat-message.tsx`
- Monaco-looking editor: re-create a faux editor with syntax-highlighted code lines (no actual Monaco — heavy + stateful)
- SKILL phase badge: re-create the tiny `[S]` tag
- MacWindow chrome: re-create the traffic-light header

### Fixtures strategy

Hardcoded TypeScript fixture files (not read from DB, not fetched at build time). A one-time copy from real seed data ensures initial accuracy, and a README note in `apps/video/src/fixtures/` warns that this is a frozen snapshot. Drift is acceptable — if Two Sum's description changes in seed, the video lags until manually updated. That's the correct trade-off (deterministic renders beat real-time accuracy for marketing assets).

### Theme tokens

Imported as plain TS constants matching `apps/web`:

```typescript
export const colors = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  emerald: "#22c55e",
  amber: "#f59e0b",
  slate: "#94a3b8",
  text: "#f8fafc",
  textMuted: "#64748b",
};
```

Google Fonts loaded via `@remotion/google-fonts/FiraCode` and `@remotion/google-fonts/FiraSans`.

### Captions

English captions implemented as `<Caption>` component overlaid in the bottom third, styled as subtle bar with Fira Sans text. Each scene declares its caption inline. A downstream task could emit `.srt` sidecar for YouTube upload — **not in v1 scope**.

### Audio

`<Audio src={staticFile("bgm.mp3")} volume={0.5} startFrom={0} />` wrapped around the Walkthrough composition root. Hero composition has no `<Audio>` (silent). BGM file: user will drop in a royalty-free lofi/ambient track from Pixabay (~140s, so it spans Walkthrough without loop; Hero doesn't need one).

## Data Flow

### Build-time (local dev)

```
apps/video/src/Root.tsx
  ↓ registers compositions {id: "Hero", ...}, {id: "Walkthrough", ...}
  ↓
npm run video:preview
  ↓ launches Remotion Studio at :3000
  ↓ hot-reload on scene edits
```

### Render-time (producing final MP4)

```
npm run video:render:hero
  ↓ npx remotion render Hero out/hero.mp4
  ↓ Chrome headless renders each frame
  ↓ FFmpeg encodes H.264 at 30fps
  ↓ output: apps/video/out/hero.mp4 (~15 MB)

npm run video:render:walkthrough
  ↓ same flow, ~2:35 → ~50 MB
```

### Deployment flow (out of scope for v1)

The rendered files are committed to `apps/video/out/` (or uploaded to GitHub Releases / a CDN) and referenced from landing page / README. v1 stops at "files exist, playable locally."

## Error Handling

- **Fonts fail to load**: Remotion waits for fonts via `waitForFonts`; if Pixabay/Google blocks, fallback to system mono/sans and log a warning. Video still renders, just less pretty.
- **BGM file missing**: `staticFile("bgm.mp3")` throws at render time. Walkthrough render fails loudly. Plan includes a "drop BGM before render" checklist step.
- **Render crash on a single scene**: Remotion reports frame number; dev uses preview to isolate and fix. No retry logic needed for one-shot renders.

## Testing

No unit tests for video scenes (animation correctness is visual, not asserted). Validation is:

1. **Preview sanity** — `npm run video:preview` opens Remotion Studio; every scene renders without console errors.
2. **Full render** — both `npm run video:render:hero` and `npm run video:render:walkthrough` complete under 10 minutes on a developer laptop and produce playable MP4 files.
3. **Import smoke test** — one Vitest case verifies `apps/video/src/fixtures/two-sum.ts` matches the shape of the real `TestCase` rows (guards against drift breaking scenes).
4. **Visual acceptance** — both videos are watched end-to-end, captions readable, timings feel right, no broken layouts.

## Non-Goals (out of scope)

- ❌ AI TTS narration (chose silent + captions + BGM)
- ❌ Multiple language versions (English only)
- ❌ 4K output (1920×1080 is sufficient for landing + YouTube)
- ❌ Auto-upload to YouTube / S3 (manual upload in v1)
- ❌ Remotion Lambda cloud rendering (local `npx remotion render` is fine)
- ❌ Interactive scrubbing / scroll-driven play (standard MP4 only)
- ❌ Unit tests for scene components (visual validation only)
- ❌ Live data fetching from dev server (hardcoded fixtures only)
- ❌ `.srt` sidecar generation (captions burned in only)
- ❌ Short-form clips for TikTok / Twitter (option (d) from Q1 was deferred)

## Success Criteria

1. `apps/video/` installs cleanly with `npm install` from the repo root
2. `npm run video:preview` opens Remotion Studio, both compositions visible
3. `npm run video:render:hero` produces `apps/video/out/hero.mp4` (1920×1080, ~40s, <20 MB)
4. `npm run video:render:walkthrough` produces `apps/video/out/walkthrough.mp4` (1920×1080, ~2:20, <60 MB)
5. Hero video shows all 5 scenes with legible kinetic text; total duration within 38–44s
6. Walkthrough video shows all 10 scenes with readable captions; total duration within 2:15–2:35
7. Both videos share scene components from `src/scenes/` (DRY verified by grep: no duplicated scene logic across the two compositions)
8. Input Visualizer's `renderArray` is imported and reused in the Two Sum scene (not re-implemented)
9. Dark-mode color tokens + Fira fonts match the main web app exactly (visual consistency)
10. BGM audible in Walkthrough, silent in Hero; both videos play without audio glitches
