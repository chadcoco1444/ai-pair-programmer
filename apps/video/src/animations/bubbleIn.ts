import { spring, SpringConfig } from "remotion";

/**
 * Spring-driven entrance animation for a chat bubble or card.
 * Returns a number in roughly [0, 1] that can drive opacity, translateY, or scale.
 */
export function bubbleIn(params: {
  frame: number;
  startFrame: number;
  fps: number;
  config?: Partial<SpringConfig>;
}): number {
  const { frame, startFrame, fps, config } = params;
  const localFrame = Math.max(0, frame - startFrame);
  return spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.8, ...config },
  });
}
