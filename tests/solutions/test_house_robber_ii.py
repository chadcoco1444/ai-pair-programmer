from typing import List


class Solution:
    def rob(self, nums: List[int]) -> int:
        if not nums:
            return 0
        if len(nums) == 1:
            return nums[0]
        if len(nums) == 2:
            return max(nums)

        def rob_linear(houses: List[int]) -> int:
            prev2, prev1 = 0, 0
            for num in houses:
                curr = max(prev1, prev2 + num)
                prev2 = prev1
                prev1 = curr
            return prev1

        # Run twice: exclude last house OR exclude first house
        return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))


def test():
    s = Solution()
    assert s.rob([2, 3, 2]) == 3, f"Expected 3, got {s.rob([2, 3, 2])}"
    assert s.rob([1, 2, 3, 1]) == 4, f"Expected 4, got {s.rob([1, 2, 3, 1])}"
    assert s.rob([1, 2, 3]) == 3, f"Expected 3, got {s.rob([1, 2, 3])}"
    print("All tests passed for House Robber II!")


if __name__ == "__main__":
    test()
