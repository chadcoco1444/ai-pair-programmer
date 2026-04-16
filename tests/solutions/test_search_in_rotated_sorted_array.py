"""
Problem: Search in Rotated Sorted Array
Category: Array
Difficulty: Medium
"""

class Solution:
    def search(self, nums, target):
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = (left + right) // 2

            if nums[mid] == target:
                return mid

            # Left half is sorted
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            # Right half is sorted
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1

# === Tests ===

def test():
    sol = Solution()

    # Test 1: target in left portion
    result = sol.search([4, 5, 6, 7, 0, 1, 2], 0)
    assert result == 4, f"Test 1 failed: {result}"

    # Test 2: target not present
    result = sol.search([4, 5, 6, 7, 0, 1, 2], 3)
    assert result == -1, f"Test 2 failed: {result}"

    # Test 3: single element, not found
    result = sol.search([1], 0)
    assert result == -1, f"Test 3 failed: {result}"

    # Test 4: target at start
    result = sol.search([4, 5, 6, 7, 0, 1, 2], 4)
    assert result == 0, f"Test 4 failed: {result}"

    # Test 5: no rotation
    result = sol.search([1, 3], 3)
    assert result == 1, f"Test 5 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
