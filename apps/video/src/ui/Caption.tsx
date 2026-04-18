import { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface CaptionProps {
  children: ReactNode;
  position?: "bottom" | "top";
  style?: CSSProperties;
}

export function Caption({ children, position = "bottom", style }: CaptionProps) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          [position]: 72,
          display: "flex",
          justifyContent: "center",
          ...style,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            padding: "14px 28px",
            background: "rgba(15,23,42,0.88)",
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            color: colors.text,
            textAlign: "center",
            ...type.caption,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}
