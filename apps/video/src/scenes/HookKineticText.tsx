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
