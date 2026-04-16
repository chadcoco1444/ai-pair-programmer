"""
Longest Consecutive Sequence - Blind 75 Graph #5
Find the length of the longest consecutive elements sequence.
Approach: HashSet — O(n) by only starting sequences at their beginning.
"""


class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        num_set = set(nums)
        longest = 0

        for num in num_set:
            # Only start counting if this is the beginning of a sequence
            if num - 1 not in num_set:
                current = num
                length = 1
                while current + 1 in num_set:
                    current += 1
                    length += 1
                longest = max(longest, length)

        return longest


def test():
    sol = Solution()

    # Test 1: [100,4,200,1,3,2] -> 4 (sequence: 1,2,3,4)
    assert sol.longestConsecutive([100, 4, 200, 1, 3, 2]) == 4, "Test 1 failed"

    # Test 2: [0,3,7,2,5,8,4,6,0,1] -> 9 (sequence: 0,1,2,3,4,5,6,7,8)
    assert sol.longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) == 9, "Test 2 failed"

    # Test 3: Empty array
    assert sol.longestConsecutive([]) == 0, "Test 3 failed"

    # Test 4: Single element
    assert sol.longestConsecutive([5]) == 1, "Test 4 failed"

    # Test 5: All same elements
    assert sol.longestConsecutive([1, 1, 1]) == 1, "Test 5 failed"

    # Test 6: Already consecutive
    assert sol.longestConsecutive([1, 2, 3, 4, 5]) == 5, "Test 6 failed"

    print("All test_longest_consecutive_sequence tests passed!")


if __name__ == "__main__":
    test()
