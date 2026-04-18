/**
 * Frame-based timing for the Walkthrough composition.
 * At 30 fps: 1 second = 30 frames.
 *
 * Each entry specifies when a chat line should start appearing. The scene
 * component computes typing progress from the current frame.
 */

export interface ChatTurn {
  role: "assistant" | "user";
  text: string;
  startFrame: number;  // relative to scene start
  typingDurationFrames: number; // how long the letter-by-letter typing takes
  phaseTag?: string;
}

/** BeginnerWalkthrough scene chat (0:50–1:15 of Walkthrough, 25s = 750 frames). */
export const beginnerWalkthroughTurns: ChatTurn[] = [
  {
    role: "assistant",
    phaseTag: "[S]",
    text:
      "Let's forget algorithms for a moment. Take nums = [2, 7, 11, 15], target = 9. Point at 2 — what number do you need to find to sum to 9?",
    startFrame: 0,
    typingDurationFrames: 180, // 6s to type
  },
  {
    role: "user",
    text: "7?",
    startFrame: 210,
    typingDurationFrames: 12,
  },
  {
    role: "assistant",
    phaseTag: "[S]",
    text: "Exactly. Now — how would you REMEMBER which numbers you've already looked at?",
    startFrame: 260,
    typingDurationFrames: 120,
  },
  {
    role: "user",
    text: "Maybe a hash table?",
    startFrame: 420,
    typingDurationFrames: 60,
  },
  {
    role: "assistant",
    phaseTag: "[K]",
    text: "Perfect pattern-recognition. Hash Table lets you answer \"have I seen 7 before?\" in O(1).",
    startFrame: 530,
    typingDurationFrames: 180,
  },
];

/** PhaseTransitionKnowledge scene chat (1:15-1:40, 25s = 750 frames). */
export const knowledgePhaseTurns: ChatTurn[] = [
  {
    role: "assistant",
    phaseTag: "[K]",
    text:
      "So for each number x in nums, you ask: has `target - x` already been stored? If yes, return both indices.",
    startFrame: 0,
    typingDurationFrames: 210,
  },
  {
    role: "user",
    text: "Got it. Let me code this.",
    startFrame: 270,
    typingDurationFrames: 75,
  },
  {
    role: "assistant",
    phaseTag: "[I]",
    text: "Go. I'll review when you're done.",
    startFrame: 390,
    typingDurationFrames: 90,
  },
];
