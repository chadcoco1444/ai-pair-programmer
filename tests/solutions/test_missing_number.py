"""
Problem: Missing Number
Category: Binary
Difficulty: Easy
"""

class Solution:
    def missingNumber(self, nums):
        # XOR all indices and values; the unpaired number is the missing one
        n = len(nums)
        result = n  # Start with n since indices only go 0..n-1
        for i, num in enumerate(nums):
            result ^= i ^ num
        return result

# === Tests ===

def test():
    sol = Solution()

    # Test 1: missing 2
    result = sol.missingNumber([3, 0, 1])
    assert result == 2, f"Test 1 failed: {result}"

    # Test 2: missing 2
    result = sol.missingNumber([0, 1])
    assert result == 2, f"Test 2 failed: {result}"

    # Test 3: missing 8
    result = sol.missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1])
    assert result == 8, f"Test 3 failed: {result}"

    # Test 4: missing 0
    result = sol.missingNumber([1])
    assert result == 0, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
