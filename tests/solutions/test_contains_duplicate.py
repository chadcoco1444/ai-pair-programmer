"""
Problem: Contains Duplicate
Category: Array
Difficulty: Easy
"""

class Solution:
    def containsDuplicate(self, nums):
        seen = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False

# === Tests ===

def test():
    sol = Solution()

    # Test 1: has duplicate
    result = sol.containsDuplicate([1, 2, 3, 1])
    assert result == True, f"Test 1 failed: {result}"

    # Test 2: no duplicate
    result = sol.containsDuplicate([1, 2, 3, 4])
    assert result == False, f"Test 2 failed: {result}"

    # Test 3: multiple duplicates
    result = sol.containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])
    assert result == True, f"Test 3 failed: {result}"

    # Test 4: single element
    result = sol.containsDuplicate([1])
    assert result == False, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
