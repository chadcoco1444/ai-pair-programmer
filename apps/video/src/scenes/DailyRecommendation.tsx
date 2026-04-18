import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 2:15–2:25 of Walkthrough (300 frames).
 * Banner slides up from bottom recommending a next problem.
 */
export function DailyRecommendation() {
  const frame = useCurrentFrame();

  const bannerY = interpolate(frame, [0, 30], [400, 0], { extrapolateRight: "clamp" });
  const bannerOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, alignItems: "center", justifyContent: "center", opacity: tailOpacity }}>
      <div
        style={{
          width: 1200,
          padding: "38px 46px",
          background: colors.card,
          border: `1px solid ${colors.emerald}`,
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(34,197,94,0.12)",
          transform: `translateY(${bannerY}px)`,
          opacity: bannerOpacity,
        }}
      >
        <div style={{ ...type.label, color: colors.emerald, letterSpacing: 2 }}>DAILY RECOMMENDATION</div>
        <div style={{ ...type.h3, color: colors.text, marginTop: 14 }}>3Sum</div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 10 }}>
          Extends what you learned in Two Sum · Two Pointer · Medium
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <div style={{ ...type.label, color: colors.amber, padding: "4px 12px",
            border: `1px solid ${colors.amber}`, borderRadius: 999 }}>MEDIUM</div>
          <div style={{ ...type.label, color: colors.slate, padding: "4px 12px",
            border: `1px solid ${colors.border}`, borderRadius: 999 }}>Array</div>
          <div style={{ ...type.label, color: colors.slate, padding: "4px 12px",
            border: `1px solid ${colors.border}`, borderRadius: 999 }}>Two Pointer</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
