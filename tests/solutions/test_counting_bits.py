"""
Problem: Counting Bits
Category: Binary
Difficulty: Easy
"""

class Solution:
    def countBits(self, n):
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            # i & (i-1) clears the lowest set bit, so dp[i] = dp[i & (i-1)] + 1
            dp[i] = dp[i & (i - 1)] + 1
        return dp

# === Tests ===

def test():
    sol = Solution()

    # Test 1: n = 2 -> [0, 1, 1]
    result = sol.countBits(2)
    assert result == [0, 1, 1], f"Test 1 failed: {result}"

    # Test 2: n = 5 -> [0, 1, 1, 2, 1, 2]
    result = sol.countBits(5)
    assert result == [0, 1, 1, 2, 1, 2], f"Test 2 failed: {result}"

    # Test 3: n = 0 -> [0]
    result = sol.countBits(0)
    assert result == [0], f"Test 3 failed: {result}"

    # Test 4: n = 7 -> [0, 1, 1, 2, 1, 2, 2, 3]
    result = sol.countBits(7)
    assert result == [0, 1, 1, 2, 1, 2, 2, 3], f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
