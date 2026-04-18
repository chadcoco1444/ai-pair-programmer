import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MacWindow } from "../ui/MacWindow";
import { CodeLine } from "../ui/CodeLine";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 1:40–2:00 of Walkthrough (600 frames).
 * Simulates typing a Maximum Depth of Binary Tree solution line by line.
 */
type Token = Parameters<typeof CodeLine>[0]["tokens"][number];

interface Line {
  tokens: Token[];
  indent: number;
  revealAt: number; // frame when this line appears
}

const LINES: Line[] = [
  { indent: 0, revealAt: 30,  tokens: [{ kind: "keyword", text: "def " }, { kind: "ident", text: "maxDepth" }, { kind: "plain", text: "(root):" }] },
  { indent: 1, revealAt: 90,  tokens: [{ kind: "keyword", text: "if not " }, { kind: "ident", text: "root" }, { kind: "plain", text: ":" }] },
  { indent: 2, revealAt: 150, tokens: [{ kind: "keyword", text: "return " }, { kind: "number", text: "0" }] },
  { indent: 1, revealAt: 220, tokens: [{ kind: "ident", text: "left" }, { kind: "plain", text: " = " }, { kind: "ident", text: "maxDepth" }, { kind: "plain", text: "(" }, { kind: "ident", text: "root" }, { kind: "plain", text: ".left)" }] },
  { indent: 1, revealAt: 280, tokens: [{ kind: "ident", text: "right" }, { kind: "plain", text: " = " }, { kind: "ident", text: "maxDepth" }, { kind: "plain", text: "(" }, { kind: "ident", text: "root" }, { kind: "plain", text: ".right)" }] },
  { indent: 1, revealAt: 350, tokens: [{ kind: "keyword", text: "return " }, { kind: "number", text: "1" }, { kind: "plain", text: " + " }, { kind: "ident", text: "max" }, { kind: "plain", text: "(" }, { kind: "ident", text: "left" }, { kind: "plain", text: ", " }, { kind: "ident", text: "right" }, { kind: "plain", text: ")" }] },
];

export function MonacoTyping() {
  const frame = useCurrentFrame();
  const tailOpacity = interpolate(frame, [560, 600], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        opacity: tailOpacity,
      }}
    >
      <MacWindow title="solution.py" titleColor={colors.emerald} width={1400}>
        <div style={{ padding: 10, fontFamily: type.code.fontFamily }}>
          {LINES.map((line, i) => {
            const visible = frame >= line.revealAt;
            const opacity = interpolate(frame, [line.revealAt, line.revealAt + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (!visible) return <div key={i} style={{ height: 36 }} />;
            return (
              <div key={i} style={{ opacity, marginBottom: 4 }}>
                <CodeLine tokens={line.tokens} indent={line.indent} />
              </div>
            );
          })}
        </div>
      </MacWindow>
    </AbsoluteFill>
  );
}
