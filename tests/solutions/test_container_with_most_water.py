"""
Problem: Container With Most Water
Category: Array
Difficulty: Medium
"""

class Solution:
    def maxArea(self, height):
        left, right = 0, len(height) - 1
        max_water = 0

        while left < right:
            width = right - left
            water = width * min(height[left], height[right])
            max_water = max(max_water, water)

            # Move the pointer with the shorter height
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1

        return max_water

# === Tests ===

def test():
    sol = Solution()

    # Test 1: standard case
    result = sol.maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])
    assert result == 49, f"Test 1 failed: {result}"

    # Test 2: two elements
    result = sol.maxArea([1, 1])
    assert result == 1, f"Test 2 failed: {result}"

    # Test 3: increasing heights
    result = sol.maxArea([1, 2, 3, 4, 5])
    assert result == 6, f"Test 3 failed: {result}"

    # Test 4: symmetric
    result = sol.maxArea([4, 3, 2, 1, 4])
    assert result == 16, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
