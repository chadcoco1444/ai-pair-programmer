"""
Insert Interval - Blind 75 Interval #1
Insert a new interval into a sorted list of non-overlapping intervals.
Approach: Linear scan — add all non-overlapping intervals before and after,
merge overlapping ones in the middle.
"""


class Solution:
    def insert(
        self, intervals: list[list[int]], newInterval: list[int]
    ) -> list[list[int]]:
        result = []
        i = 0
        n = len(intervals)

        # Add all intervals that end before newInterval starts
        while i < n and intervals[i][1] < newInterval[0]:
            result.append(intervals[i])
            i += 1

        # Merge all overlapping intervals with newInterval
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        result.append(newInterval)

        # Add remaining intervals
        while i < n:
            result.append(intervals[i])
            i += 1

        return result


def test():
    sol = Solution()

    # Test 1: ([[1,3],[6,9]], [2,5]) -> [[1,5],[6,9]]
    assert sol.insert([[1, 3], [6, 9]], [2, 5]) == [[1, 5], [6, 9]], "Test 1 failed"

    # Test 2: ([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]) -> [[1,2],[3,10],[12,16]]
    assert sol.insert(
        [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]
    ) == [[1, 2], [3, 10], [12, 16]], "Test 2 failed"

    # Test 3: Empty intervals list
    assert sol.insert([], [5, 7]) == [[5, 7]], "Test 3 failed"

    # Test 4: New interval before all existing
    assert sol.insert([[3, 5], [7, 9]], [1, 2]) == [[1, 2], [3, 5], [7, 9]], "Test 4 failed"

    # Test 5: New interval after all existing
    assert sol.insert([[1, 3], [4, 6]], [8, 10]) == [[1, 3], [4, 6], [8, 10]], "Test 5 failed"

    # Test 6: New interval covers all existing
    assert sol.insert([[1, 2], [3, 4], [5, 6]], [0, 7]) == [[0, 7]], "Test 6 failed"

    print("All test_insert_interval tests passed!")


if __name__ == "__main__":
    test()
