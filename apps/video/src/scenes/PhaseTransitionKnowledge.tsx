import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChatBubble } from "../ui/ChatBubble";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { typeUpTo, typingProgress } from "../animations/typeLetter";
import { bubbleIn } from "../animations/bubbleIn";
import { knowledgePhaseTurns } from "../fixtures/walkthrough-script";

/**
 * 1:15–1:40 of Walkthrough (750 frames).
 * Phase tag animates S → K → I alongside the chat.
 */
export function PhaseTransitionKnowledge() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phaseOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  let phaseLabel = "[S] Socratic";
  let phaseColor: string = colors.slate;
  if (frame >= 30) { phaseLabel = "[K] Knowledge"; phaseColor = colors.emerald; }
  if (frame >= 420) { phaseLabel = "[I] Iterative"; phaseColor = colors.amber; }

  return (
    <AbsoluteFill style={{ background: colors.bg, padding: "60px 120px" }}>
      <div style={{ textAlign: "center", marginBottom: 40, opacity: phaseOpacity }}>
        <span
          style={{
            ...type.h3,
            color: phaseColor,
            padding: "8px 24px",
            border: `2px solid ${phaseColor}`,
            borderRadius: 999,
            display: "inline-block",
          }}
        >
          {phaseLabel}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {knowledgePhaseTurns.map((turn, i) => {
          const bubble = bubbleIn({ frame, startFrame: turn.startFrame, fps });
          const progress = typingProgress(frame, turn.startFrame + 10, turn.typingDurationFrames);
          if (frame < turn.startFrame) return null;
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
