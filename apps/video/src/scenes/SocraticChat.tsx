import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ChatBubble } from "../ui/ChatBubble";
import { colors } from "../theme/colors";
import { typeUpTo, typingProgress } from "../animations/typeLetter";
import { bubbleIn } from "../animations/bubbleIn";

/**
 * 0:03–0:11 of Hero (240 frames).
 * AI asks, student replies — a compressed Socratic demo.
 */
export function SocraticChat() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const aiText = "What's your first instinct for this problem?";
  const userText = "Brute force: two loops?";

  const aiBubble = bubbleIn({ frame, startFrame: 0, fps });
  const aiProgress = typingProgress(frame, 15, 105);
  const userBubble = bubbleIn({ frame, startFrame: 150, fps });
  const userProgress = typingProgress(frame, 165, 45);

  const tailOpacity = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.bg, padding: "120px 180px", opacity: tailOpacity }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ opacity: aiBubble, transform: `translateY(${(1 - aiBubble) * 24}px)` }}>
          <ChatBubble role="assistant" phaseTag="[S]">
            {typeUpTo(aiText, aiProgress)}
          </ChatBubble>
        </div>
        {frame >= 150 && (
          <div style={{ opacity: userBubble, transform: `translateY(${(1 - userBubble) * 24}px)` }}>
            <ChatBubble role="user">{typeUpTo(userText, userProgress)}</ChatBubble>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
