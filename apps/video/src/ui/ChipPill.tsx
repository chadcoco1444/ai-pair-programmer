import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface ChipPillProps {
  children: ReactNode;
  accent?: boolean;
  style?: CSSProperties;
}

export function ChipPill({ children, accent = false, style }: ChipPillProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 999,
        border: `1px solid ${accent ? colors.emerald : colors.border}`,
        background: accent ? colors.emeraldSoft : colors.card,
        color: accent ? colors.emerald : colors.text,
        ...type.bodySmall,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
