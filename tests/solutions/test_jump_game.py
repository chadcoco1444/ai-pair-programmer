from typing import List


class Solution:
    def canJump(self, nums: List[int]) -> bool:
        max_reach = 0
        for i, num in enumerate(nums):
            if i > max_reach:
                return False
            max_reach = max(max_reach, i + num)
        return True


def test():
    s = Solution()
    assert s.canJump([2, 3, 1, 1, 4]) == True, \
        f"Expected True, got {s.canJump([2, 3, 1, 1, 4])}"
    assert s.canJump([3, 2, 1, 0, 4]) == False, \
        f"Expected False, got {s.canJump([3, 2, 1, 0, 4])}"
    print("All tests passed for Jump Game!")


if __name__ == "__main__":
    test()
