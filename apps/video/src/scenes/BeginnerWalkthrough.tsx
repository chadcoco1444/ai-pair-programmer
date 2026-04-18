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
