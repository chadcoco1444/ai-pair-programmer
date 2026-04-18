import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface ChatBubbleProps {
  role: "assistant" | "user";
  children: ReactNode;
  phaseTag?: string;
  maxWidth?: number;
  style?: CSSProperties;
}

export function ChatBubble({ role, children, phaseTag, maxWidth = 700, style }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", ...style }}>
      <div
        style={{
          maxWidth,
          padding: "18px 22px",
          borderRadius: 14,
          background: isUser ? colors.blue : colors.card,
          color: isUser ? "#fff" : colors.text,
          ...type.body,
          lineHeight: 1.55,
        }}
      >
        {phaseTag && !isUser && (
          <div style={{ ...type.label, color: colors.emerald, marginBottom: 6 }}>
            {phaseTag}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
