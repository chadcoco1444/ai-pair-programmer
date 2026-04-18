import { CSSProperties } from "react";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

type Token =
  | { kind: "plain"; text: string }
  | { kind: "keyword"; text: string }
  | { kind: "string"; text: string }
  | { kind: "comment"; text: string }
  | { kind: "ident"; text: string }
  | { kind: "number"; text: string };

interface CodeLineProps {
  tokens: Token[];
  indent?: number; // in "levels" (4 spaces each)
  style?: CSSProperties;
}

const tokenColors: Record<Token["kind"], string> = {
  plain: colors.text,
  keyword: "#c084fc",    // purple-400
  string: "#fbbf24",     // amber-300
  comment: colors.slateDim,
  ident: "#67e8f9",      // cyan-300
  number: "#fda4af",     // rose-300
};

export function CodeLine({ tokens, indent = 0, style }: CodeLineProps) {
  return (
    <div style={{ ...type.code, paddingLeft: indent * 32, whiteSpace: "pre", ...style }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: tokenColors[t.kind] }}>
          {t.text}
        </span>
      ))}
    </div>
  );
}
