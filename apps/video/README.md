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
