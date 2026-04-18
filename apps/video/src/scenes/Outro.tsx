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
