"""
Problem: Reverse Bits
Category: Binary
Difficulty: Easy
"""

class Solution:
    def reverseBits(self, n):
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)
            n >>= 1
        return result

# === Tests ===

def test():
    sol = Solution()

    # Test 1: 43261596 -> 964176192
    # Input:  00000010100101000001111010011100
    # Output: 00111001011110000010100101000000
    result = sol.reverseBits(0b00000010100101000001111010011100)
    assert result == 964176192, f"Test 1 failed: {result}"

    # Test 2: 4294967293 -> 3221225471
    # Input:  11111111111111111111111111111101
    # Output: 10111111111111111111111111111111
    result = sol.reverseBits(0b11111111111111111111111111111101)
    assert result == 3221225471, f"Test 2 failed: {result}"

    # Test 3: 0 -> 0
    result = sol.reverseBits(0)
    assert result == 0, f"Test 3 failed: {result}"

    # Test 4: 1 -> 2147483648  (bit 0 becomes bit 31)
    result = sol.reverseBits(1)
    assert result == 2147483648, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
