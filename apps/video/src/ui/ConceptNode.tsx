import { CSSProperties } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

type MasteryLevel = "untouched" | "learning" | "mastered";

interface ConceptNodeProps {
  name: string;
  mastery: number; // 0..1
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

function levelFor(mastery: number): MasteryLevel {
  if (mastery >= 0.7) return "mastered";
  if (mastery >= 0.4) return "learning";
  return "untouched";
}

const levelStyles: Record<MasteryLevel, { bg: string; border: string; text: string }> = {
  mastered: { bg: colors.emeraldSoft, border: colors.emerald, text: colors.emerald },
  learning: { bg: "#451a03", border: colors.amber, text: colors.amber },
  untouched: { bg: colors.card, border: colors.border, text: colors.slate },
};

export function ConceptNode({ name, mastery, x, y, width = 180, height = 54, style }: ConceptNodeProps) {
  const level = levelFor(mastery);
  const s = levelStyles[level];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 10,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        padding: "8px 12px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ ...type.codeSmall, color: s.text, fontWeight: 600, textAlign: "center" }}>{name}</div>
      <div style={{ ...type.label, color: colors.slateDim, textAlign: "center", fontSize: 11 }}>
        {Math.round(mastery * 100)}%
      </div>
    </div>
  );
}
