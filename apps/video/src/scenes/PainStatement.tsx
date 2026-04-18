import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { typeUpTo, typingProgress } from "../animations/typeLetter";

/**
 * 0:00–0:15 of Walkthrough (450 frames).
 * Typewriter-style pain statement on black.
 */
export function PainStatement() {
  const frame = useCurrentFrame();
  const statLine = "70% of self-taught developers";
  const tailLine = "quit LeetCode within a month.";

  const statProgress = typingProgress(frame, 30, 120);
  const tailProgress = typingProgress(frame, 180, 150);

  const cursorBlink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  const tailVisible = frame >= 180;

  const fadeOutOpacity = interpolate(frame, [400, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ background: colors.bg, alignItems: "center", justifyContent: "center", opacity: fadeOutOpacity }}
    >
      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        <div style={{ ...type.h2, color: colors.slate }}>
          {typeUpTo(statLine, statProgress)}
          {!tailVisible && <span style={{ opacity: cursorBlink, color: colors.emerald }}>|</span>}
        </div>
        <div style={{ ...type.h2, color: colors.text, marginTop: 24 }}>
          {typeUpTo(tailLine, tailProgress)}
          {tailVisible && tailProgress < 1 && (
            <span style={{ opacity: cursorBlink, color: colors.emerald }}>|</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}
