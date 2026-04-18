export interface FixtureTestCase {
  id: string;
  input: string;
  expected: string;
}

export interface FixtureProblem {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  testCases: readonly FixtureTestCase[];
  concepts: readonly string[];
}

/**
 * Frozen snapshot of the Maximum Depth of Binary Tree problem.
 * Used across Remotion scenes. Update manually when seed changes.
 */
export const maxDepth = {
  slug: "maximum-depth-of-binary-tree",
  title: "Maximum Depth of Binary Tree",
  difficulty: "EASY",
  description:
    "Given the `root` of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
  testCases: [
    { id: "tc-1", input: "root = [3,9,20,null,null,15,7]", expected: "3" },
    { id: "tc-2", input: "root = [1,null,2]", expected: "2" },
    { id: "tc-3", input: "root = []", expected: "0" },
  ],
  concepts: ["Tree", "DFS", "Recursion"],
} as const satisfies FixtureProblem;
