import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MacWindow } from "../ui/MacWindow";
import { CodeLine } from "../ui/CodeLine";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";

/**
 * 1:40–2:00 of Walkthrough (600 frames).
 * Simulates typing a Two Sum solution line by line.
 */
type Token = Parameters<typeof CodeLine>[0]["tokens"][number];

interface Line {
  tokens: Token[];
  indent: number;
  revealAt: number; // frame when this line appears
}

const LINES: Line[] = [
  { indent: 0, revealAt: 30,  tokens: [{ kind: "keyword", text: "def " }, { kind: "ident", text: "twoSum" }, { kind: "plain", text: "(nums, target):" }] },
  { indent: 1, revealAt: 90,  tokens: [{ kind: "ident", text: "seen" }, { kind: "plain", text: " = {}" }] },
  { indent: 1, revealAt: 150, tokens: [{ kind: "keyword", text: "for " }, { kind: "ident", text: "i" }, { kind: "plain", text: ", " }, { kind: "ident", text: "x" }, { kind: "keyword", text: " in " }, { kind: "ident", text: "enumerate" }, { kind: "plain", text: "(nums):" }] },
  { indent: 2, revealAt: 220, tokens: [{ kind: "ident", text: "need" }, { kind: "plain", text: " = target - x" }] },
  { indent: 2, revealAt: 280, tokens: [{ kind: "keyword", text: "if " }, { kind: "ident", text: "need" }, { kind: "keyword", text: " in " }, { kind: "ident", text: "seen" }, { kind: "plain", text: ":" }] },
  { indent: 3, revealAt: 350, tokens: [{ kind: "keyword", text: "return " }, { kind: "plain", text: "[" }, { kind: "ident", text: "seen" }, { kind: "plain", text: "[" }, { kind: "ident", text: "need" }, { kind: "plain", text: "], i]" }] },
  { indent: 2, revealAt: 420, tokens: [{ kind: "ident", text: "seen" }, { kind: "plain", text: "[x] = i" }] },
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
