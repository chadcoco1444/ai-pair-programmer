from typing import List


class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        if len(nums) == 1:
            return nums[0]
        prev2, prev1 = 0, 0
        for num in nums:
            curr = max(prev1, prev2 + num)
            prev2 = prev1
            prev1 = curr
        return prev1


def test():
    s = Solution()
    assert s.rob([1, 2, 3, 1]) == 4, f"Expected 4, got {s.rob([1, 2, 3, 1])}"
    assert s.rob([2, 7, 9, 3, 1]) == 12, f"Expected 12, got {s.rob([2, 7, 9, 3, 1])}"
    print("All tests passed for House Robber!")


if __name__ == "__main__":
    test()
