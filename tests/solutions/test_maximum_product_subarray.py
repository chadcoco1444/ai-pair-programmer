"""
Problem: Maximum Product Subarray
Category: Array
Difficulty: Medium
"""

class Solution:
    def maxProduct(self, nums):
        max_prod = nums[0]
        min_prod = nums[0]
        result = nums[0]

        for num in nums[1:]:
            # When multiplied by a negative, max becomes min and vice versa
            candidates = (num, max_prod * num, min_prod * num)
            max_prod = max(candidates)
            min_prod = min(candidates)
            result = max(result, max_prod)

        return result

# === Tests ===

def test():
    sol = Solution()

    # Test 1: standard case with negative numbers
    result = sol.maxProduct([2, 3, -2, 4])
    assert result == 6, f"Test 1 failed: {result}"

    # Test 2: contains zero
    result = sol.maxProduct([-2, 0, -1])
    assert result == 0, f"Test 2 failed: {result}"

    # Test 3: two negatives make a positive
    result = sol.maxProduct([-2, 3, -4])
    assert result == 24, f"Test 3 failed: {result}"

    # Test 4: single element
    result = sol.maxProduct([-2])
    assert result == -2, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
