"""
Non-overlapping Intervals - Blind 75 Interval #3
Find the minimum number of intervals to remove to make the rest non-overlapping.
Approach: Greedy — sort by end time, keep intervals with earliest end time.
"""


class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        if not intervals:
            return 0

        # Sort by end time
        intervals.sort(key=lambda x: x[1])
        removals = 0
        prev_end = intervals[0][1]

        for i in range(1, len(intervals)):
            if intervals[i][0] < prev_end:
                # Overlap — remove current interval (keep the one with smaller end)
                removals += 1
            else:
                # No overlap — update prev_end
                prev_end = intervals[i][1]

        return removals


def test():
    sol = Solution()

    # Test 1: [[1,2],[2,3],[3,4],[1,3]] -> 1 (remove [1,3])
    assert sol.eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]) == 1, "Test 1 failed"

    # Test 2: [[1,2],[1,2],[1,2]] -> 2 (keep one, remove two)
    assert sol.eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]]) == 2, "Test 2 failed"

    # Test 3: [[1,2],[2,3]] -> 0 (no overlaps, touching is fine)
    assert sol.eraseOverlapIntervals([[1, 2], [2, 3]]) == 0, "Test 3 failed"

    # Test 4: Empty list
    assert sol.eraseOverlapIntervals([]) == 0, "Test 4 failed"

    # Test 5: Single interval
    assert sol.eraseOverlapIntervals([[1, 5]]) == 0, "Test 5 failed"

    # Test 6: All overlapping — need to remove all but one
    assert sol.eraseOverlapIntervals([[1, 10], [2, 5], [3, 7]]) == 2, "Test 6 failed"

    print("All test_non_overlapping_intervals tests passed!")


if __name__ == "__main__":
    test()
