"""
Problem: Two Sum
Category: Array
Difficulty: Easy
"""

class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            if target - num in lookup:
                return [lookup[target - num], i]
            lookup[num] = i

# === Tests ===

def test():
    sol = Solution()

    # Test 1: basic case
    result = sol.twoSum([2, 7, 11, 15], 9)
    assert sorted(result) == [0, 1], f"Test 1 failed: {result}"

    # Test 2: non-adjacent pair
    result = sol.twoSum([3, 2, 4], 6)
    assert sorted(result) == [1, 2], f"Test 2 failed: {result}"

    # Test 3: duplicate values
    result = sol.twoSum([3, 3], 6)
    assert sorted(result) == [0, 1], f"Test 3 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
