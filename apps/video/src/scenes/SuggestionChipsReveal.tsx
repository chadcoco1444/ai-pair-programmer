import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChipPill } from "../ui/ChipPill";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { bubbleIn } from "../animations/bubbleIn";

const CHIPS = [
  "💡 How should I approach this?",
  "🔎 Review my code",
  "🧩 Give me a hint",
  "📖 Explain this concept",
  "⏱️ Time complexity?",
  "🚨 Edge cases?",
];

/**
 * 0:40–0:50 of Walkthrough (300 frames).
 * 6 chips stagger in from below, then hold.
 */
export function SuggestionChipsReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const tailOpacity = interpolate(frame, [270, 300], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
        opacity: tailOpacity,
      }}
    >
      <div style={{ opacity: headerOpacity, textAlign: "center", marginBottom: 60 }}>
        <div style={{ ...type.h3, color: colors.text }}>Don't know where to start?</div>
        <div style={{ ...type.body, color: colors.slate, marginTop: 14 }}>
          Pick a starter prompt:
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, auto)",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {CHIPS.map((label, i) => {
          const start = 40 + i * 24;
          const enter = bubbleIn({ frame, startFrame: start, fps });
          return (
            <div
              key={label}
              style={{
                opacity: enter,
                transform: `translateY(${(1 - enter) * 20}px)`,
              }}
            >
              <ChipPill accent={i === 0}>{label}</ChipPill>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
