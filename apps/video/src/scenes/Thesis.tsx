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
