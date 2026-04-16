"""
Problem: Sum of Two Integers
Category: Binary
Difficulty: Medium
"""

class Solution:
    def getSum(self, a, b):
        # Python integers have arbitrary precision, so we must mask to 32 bits
        MASK = 0xFFFFFFFF
        MAX = 0x7FFFFFFF

        while b != 0:
            carry = (a & b) << 1
            a = (a ^ b) & MASK
            b = carry & MASK

        # If a > MAX, it's a negative number in 32-bit representation
        return a if a <= MAX else ~(a ^ MASK)

# === Tests ===

def test():
    sol = Solution()

    # Test 1: 1 + 2 = 3
    result = sol.getSum(1, 2)
    assert result == 3, f"Test 1 failed: {result}"

    # Test 2: 2 + 3 = 5
    result = sol.getSum(2, 3)
    assert result == 5, f"Test 2 failed: {result}"

    # Test 3: -1 + 1 = 0
    result = sol.getSum(-1, 1)
    assert result == 0, f"Test 3 failed: {result}"

    # Test 4: -3 + (-5) = -8
    result = sol.getSum(-3, -5)
    assert result == -8, f"Test 4 failed: {result}"

    # Test 5: 0 + 0 = 0
    result = sol.getSum(0, 0)
    assert result == 0, f"Test 5 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
