"""
Problem: Maximum Subarray
Category: Array
Difficulty: Medium
"""

class Solution:
    def maxSubArray(self, nums):
        max_sum = nums[0]
        current_sum = nums[0]
        for num in nums[1:]:
            current_sum = max(num, current_sum + num)
            max_sum = max(max_sum, current_sum)
        return max_sum

# === Tests ===

def test():
    sol = Solution()

    # Test 1: mixed positive and negative
    result = sol.maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])
    assert result == 6, f"Test 1 failed: {result}"

    # Test 2: single element
    result = sol.maxSubArray([1])
    assert result == 1, f"Test 2 failed: {result}"

    # Test 3: all positive
    result = sol.maxSubArray([5, 4, -1, 7, 8])
    assert result == 23, f"Test 3 failed: {result}"

    # Test 4: all negative
    result = sol.maxSubArray([-3, -2, -1])
    assert result == -1, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
