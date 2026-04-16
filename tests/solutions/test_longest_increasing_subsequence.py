from typing import List
import bisect


class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        # Patience sort (O(n log n))
        tails = []
        for num in nums:
            pos = bisect.bisect_left(tails, num)
            if pos == len(tails):
                tails.append(num)
            else:
                tails[pos] = num
        return len(tails)


def test():
    s = Solution()
    assert s.lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]) == 4, \
        f"Expected 4, got {s.lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])}"
    assert s.lengthOfLIS([0, 1, 0, 3, 2, 3]) == 4, \
        f"Expected 4, got {s.lengthOfLIS([0, 1, 0, 3, 2, 3])}"
    assert s.lengthOfLIS([7, 7, 7, 7, 7]) == 1, \
        f"Expected 1, got {s.lengthOfLIS([7, 7, 7, 7, 7])}"
    print("All tests passed for Longest Increasing Subsequence!")


if __name__ == "__main__":
    test()
