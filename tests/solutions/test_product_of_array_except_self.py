"""
Problem: Product of Array Except Self
Category: Array
Difficulty: Medium
"""

class Solution:
    def productExceptSelf(self, nums):
        n = len(nums)
        result = [1] * n

        # Left pass: result[i] = product of all elements to the left of i
        prefix = 1
        for i in range(n):
            result[i] = prefix
            prefix *= nums[i]

        # Right pass: multiply by product of all elements to the right of i
        suffix = 1
        for i in range(n - 1, -1, -1):
            result[i] *= suffix
            suffix *= nums[i]

        return result

# === Tests ===

def test():
    sol = Solution()

    # Test 1: standard case
    result = sol.productExceptSelf([1, 2, 3, 4])
    assert result == [24, 12, 8, 6], f"Test 1 failed: {result}"

    # Test 2: contains zero
    result = sol.productExceptSelf([-1, 1, 0, -3, 3])
    assert result == [0, 0, 9, 0, 0], f"Test 2 failed: {result}"

    # Test 3: two elements
    result = sol.productExceptSelf([2, 3])
    assert result == [3, 2], f"Test 3 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
