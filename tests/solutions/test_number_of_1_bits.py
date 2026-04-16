"""
Problem: Number of 1 Bits (Hamming Weight)
Category: Binary
Difficulty: Easy
"""

class Solution:
    def hammingWeight(self, n):
        count = 0
        while n:
            n &= n - 1  # Clears the lowest set bit
            count += 1
        return count

# === Tests ===

def test():
    sol = Solution()

    # Test 1: 00000000000000000000000000001011 -> 3 ones
    result = sol.hammingWeight(0b00000000000000000000000000001011)
    assert result == 3, f"Test 1 failed: {result}"

    # Test 2: 00000000000000000000000010000000 -> 1 one
    result = sol.hammingWeight(0b00000000000000000000000010000000)
    assert result == 1, f"Test 2 failed: {result}"

    # Test 3: 11111111111111111111111111111101 -> 31 ones
    result = sol.hammingWeight(0b11111111111111111111111111111101)
    assert result == 31, f"Test 3 failed: {result}"

    # Test 4: 0 -> 0 ones
    result = sol.hammingWeight(0)
    assert result == 0, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
