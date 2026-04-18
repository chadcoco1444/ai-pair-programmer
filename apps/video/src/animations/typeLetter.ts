/**
 * Given a target string and the current progress (0..1), return the prefix
 * that should be visible. Used for letter-by-letter typing animations.
 *
 * Example: typeUpTo("hello", 0.4) → "he" (2 of 5 chars)
 */
export function typeUpTo(fullText: string, progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const count = Math.floor(fullText.length * clamped);
  return fullText.slice(0, count);
}

/**
 * Compute typing progress given the current frame within a scene.
 * Returns 0 before start, 1 after end, linear interpolation in between.
 */
export function typingProgress(
  frame: number,
  startFrame: number,
  durationFrames: number
): number {
  if (durationFrames <= 0) return frame >= startFrame ? 1 : 0;
  if (frame <= startFrame) return 0;
  if (frame >= startFrame + durationFrames) return 1;
  return (frame - startFrame) / durationFrames;
}
