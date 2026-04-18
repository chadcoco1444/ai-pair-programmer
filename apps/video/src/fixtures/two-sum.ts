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
 * Frozen snapshot of the Two Sum problem. Mirrors what comes from
 * `getBySlug` in apps/web (shape only, not a runtime fetch). Drift is
 * acceptable — update this file manually when the seed changes.
 */
export const twoSum = {
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  description:
    "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  testCases: [
    {
      id: "tc-1",
      input: "nums = [2,7,11,15], target = 9",
      expected: "[0,1]",
    },
    {
      id: "tc-2",
      input: "nums = [3,2,4], target = 6",
      expected: "[1,2]",
    },
    {
      id: "tc-3",
      input: "nums = [3,3], target = 6",
      expected: "[0,1]",
    },
  ],
  concepts: ["Array", "Hash Table"],
} as const satisfies FixtureProblem;
