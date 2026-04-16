"""
Problem: 3Sum
Category: Array
Difficulty: Medium
"""

class Solution:
    def threeSum(self, nums):
        nums.sort()
        result = []

        for i in range(len(nums) - 2):
            # Skip duplicates for the first element
            if i > 0 and nums[i] == nums[i - 1]:
                continue

            left, right = i + 1, len(nums) - 1

            while left < right:
                total = nums[i] + nums[left] + nums[right]

                if total == 0:
                    result.append([nums[i], nums[left], nums[right]])
                    # Skip duplicates for second and third elements
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    right -= 1

        return result

# === Tests ===

def test():
    sol = Solution()

    # Test 1: standard case with multiple triplets
    result = sol.threeSum([-1, 0, 1, 2, -1, -4])
    expected = [[-1, -1, 2], [-1, 0, 1]]
    assert sorted(result) == sorted(expected), f"Test 1 failed: {result}"

    # Test 2: no valid triplet
    result = sol.threeSum([0, 1, 1])
    assert result == [], f"Test 2 failed: {result}"

    # Test 3: all zeros
    result = sol.threeSum([0, 0, 0])
    assert result == [[0, 0, 0]], f"Test 3 failed: {result}"

    # Test 4: empty after no valid triplets
    result = sol.threeSum([1, 2, -2, -1])
    assert result == [], f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
