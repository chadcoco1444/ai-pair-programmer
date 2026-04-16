from typing import List


class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result = []
        candidates.sort()

        def backtrack(start: int, current: List[int], remaining: int):
            if remaining == 0:
                result.append(list(current))
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                current.append(candidates[i])
                backtrack(i, current, remaining - candidates[i])
                current.pop()

        backtrack(0, [], target)
        return result


def normalize(combinations: List[List[int]]) -> List[List[int]]:
    return sorted([sorted(c) for c in combinations])


def test():
    s = Solution()

    result = normalize(s.combinationSum([2, 3, 6, 7], 7))
    expected = normalize([[2, 2, 3], [7]])
    assert result == expected, f"Expected {expected}, got {result}"

    print("All tests passed for Combination Sum!")


if __name__ == "__main__":
    test()
