import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 2:00 beat of Walkthrough (roughly 300 frames).
 * Big green ACCEPTED check + runtime stats pop in.
 */
export function SubmissionAccepted() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const checkScale = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const statsOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [260, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        opacity: tailOpacity,
      }}
    >
      <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: `scale(${checkScale})` }}>
        <circle cx="110" cy="110" r="100" fill={colors.emeraldSoft} stroke={colors.emerald} strokeWidth="4" />
        <path d="M60 115 L95 150 L160 75" stroke={colors.emerald} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div style={{ ...type.h2, color: colors.emerald, marginTop: 40 }}>ACCEPTED</div>
      <div
        style={{
          ...type.body,
          color: colors.slateLight,
          marginTop: 20,
          display: "flex",
          gap: 40,
          opacity: statsOpacity,
        }}
      >
        <span>Runtime: <b style={{ color: colors.text }}>48 ms</b></span>
        <span>Memory: <b style={{ color: colors.text }}>17.2 MB</b></span>
        <span>Beats: <b style={{ color: colors.text }}>92%</b></span>
      </div>
    </AbsoluteFill>
  );
}
