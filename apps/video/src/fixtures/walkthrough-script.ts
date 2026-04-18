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
      "Forget algorithms for a moment. Take root = [3, 9, 20, null, null, 15, 7]. Point at the leaf 15. Counting from the root, how deep is that node?",
    startFrame: 0,
    typingDurationFrames: 180,
  },
  {
    role: "user",
    text: "3 levels deep.",
    startFrame: 210,
    typingDurationFrames: 30,
  },
  {
    role: "assistant",
    phaseTag: "[S]",
    text:
      "Good. Now — if you're standing at node 20 and you already know its two children have depths X and Y, what's the depth rooted at 20?",
    startFrame: 270,
    typingDurationFrames: 150,
  },
  {
    role: "user",
    text: "1 + max(X, Y)?",
    startFrame: 440,
    typingDurationFrames: 60,
  },
  {
    role: "assistant",
    phaseTag: "[K]",
    text:
      "Exactly. Every node's depth is 1 + max(left, right). Base case: a null child contributes depth 0.",
    startFrame: 540,
    typingDurationFrames: 180,
  },
];

/** PhaseTransitionKnowledge scene chat (1:15-1:40, 25s = 750 frames). */
export const knowledgePhaseTurns: ChatTurn[] = [
  {
    role: "assistant",
    phaseTag: "[K]",
    text:
      "So you define maxDepth(node): if node is null return 0, else return 1 + max(maxDepth(left), maxDepth(right)). DFS gives you O(n) time.",
    startFrame: 0,
    typingDurationFrames: 210,
  },
  {
    role: "user",
    text: "OK, coding it now.",
    startFrame: 270,
    typingDurationFrames: 60,
  },
  {
    role: "assistant",
    phaseTag: "[I]",
    text: "Go. I'll review once you've got a first version.",
    startFrame: 390,
    typingDurationFrames: 120,
  },
];
