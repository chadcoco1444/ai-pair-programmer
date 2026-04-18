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
