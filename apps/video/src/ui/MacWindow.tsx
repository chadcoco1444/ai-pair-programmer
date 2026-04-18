import { CSSProperties, ReactNode } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

interface MacWindowProps {
  title: string;
  titleColor?: string;
  width?: number;
  height?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function MacWindow({ title, titleColor = colors.slate, width, height, children, style }: MacWindowProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: colors.card,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, background: colors.red }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: colors.amber }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: colors.emerald }} />
        <div style={{ ...type.codeSmall, color: titleColor, marginLeft: 10 }}>{title}</div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
