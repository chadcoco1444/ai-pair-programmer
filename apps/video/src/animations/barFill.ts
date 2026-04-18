import { interpolate } from "remotion";

/**
 * Interpolates a mastery bar fill from startPct → endPct over a window.
 * Returns a percentage (0..1).
 */
export function barFill(params: {
  frame: number;
  startFrame: number;
  durationFrames: number;
  startPct: number;
  endPct: number;
}): number {
  const { frame, startFrame, durationFrames, startPct, endPct } = params;
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [startPct, endPct],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}
