import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MacWindow } from "../ui/MacWindow";
import { colors } from "../theme/colors";
import { type } from "../theme/typography";
import { renderTree } from "../../../web/src/lib/input-visualizer/renderers/tree";
import { maxDepth } from "../fixtures/max-depth";

/**
 * 0:25–0:40 of Walkthrough (450 frames).
 * Window animates in, description fades in paragraph by paragraph, Input
 * Visualizer slides up at ~4s mark.
 */
export function PracticePageOpen() {
  const frame = useCurrentFrame();

  const winOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const winScale = interpolate(frame, [0, 30], [0.94, 1], { extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descOpacity = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vizOpacity = interpolate(frame, [130, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vizY = interpolate(frame, [130, 180], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const tailOpacity = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp" });

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
      <div style={{ opacity: winOpacity, transform: `scale(${winScale})` }}>
        <MacWindow title="/practice/maximum-depth-of-binary-tree" width={1500} titleColor={colors.slate}>
          <div style={{ padding: 30 }}>
            <div style={{ opacity: titleOpacity }}>
              <div style={{ ...type.h3, color: colors.text }}>{maxDepth.title}</div>
              <div style={{ display: "inline-block", ...type.label, color: colors.emerald,
                background: colors.emeraldSoft, padding: "4px 12px", borderRadius: 999,
                border: `1px solid ${colors.emerald}`, marginTop: 12 }}>
                {maxDepth.difficulty}
              </div>
            </div>
            <div style={{ ...type.body, color: colors.slateLight, marginTop: 26, opacity: descOpacity }}>
              {maxDepth.description}
            </div>
            <div style={{ marginTop: 30, opacity: vizOpacity, transform: `translateY(${vizY}px)` }}>
              <div style={{ ...type.label, color: colors.slate, marginBottom: 10 }}>VISUALIZED EXAMPLE</div>
              <div style={{ transform: "scale(1.2)", transformOrigin: "left top" }}>
                {renderTree([3, 9, 20, null, null, 15, 7])}
              </div>
            </div>
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
}
