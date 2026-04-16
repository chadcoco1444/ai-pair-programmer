"""
Problem: Find Minimum in Rotated Sorted Array
Category: Array
Difficulty: Medium
"""

class Solution:
    def findMin(self, nums):
        left, right = 0, len(nums) - 1

        while left < right:
            mid = (left + right) // 2
            if nums[mid] > nums[right]:
                # Minimum is in the right half
                left = mid + 1
            else:
                # Minimum is in the left half (including mid)
                right = mid

        return nums[left]

# === Tests ===

def test():
    sol = Solution()

    # Test 1: rotated array
    result = sol.findMin([3, 4, 5, 1, 2])
    assert result == 1, f"Test 1 failed: {result}"

    # Test 2: more rotations
    result = sol.findMin([4, 5, 6, 7, 0, 1, 2])
    assert result == 0, f"Test 2 failed: {result}"

    # Test 3: no rotation (sorted)
    result = sol.findMin([11, 13, 15, 17])
    assert result == 11, f"Test 3 failed: {result}"

    # Test 4: single element
    result = sol.findMin([1])
    assert result == 1, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
