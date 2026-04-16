"""
Merge Intervals - Blind 75 Interval #2
Merge all overlapping intervals.
Approach: Sort by start time, then iterate and merge overlapping intervals.
"""


class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        if not intervals:
            return []

        intervals.sort(key=lambda x: x[0])
        merged = [intervals[0]]

        for start, end in intervals[1:]:
            if start <= merged[-1][1]:
                # Overlapping — extend the current interval if needed
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])

        return merged


def test():
    sol = Solution()

    # Test 1: [[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]]
    assert sol.merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [
        [1, 6],
        [8, 10],
        [15, 18],
    ], "Test 1 failed"

    # Test 2: [[1,4],[4,5]] -> [[1,5]] (touching intervals merge)
    assert sol.merge([[1, 4], [4, 5]]) == [[1, 5]], "Test 2 failed"

    # Test 3: Single interval
    assert sol.merge([[1, 3]]) == [[1, 3]], "Test 3 failed"

    # Test 4: No overlapping
    assert sol.merge([[1, 2], [3, 4], [5, 6]]) == [
        [1, 2],
        [3, 4],
        [5, 6],
    ], "Test 4 failed"

    # Test 5: All intervals merge into one
    assert sol.merge([[1, 10], [2, 6], [3, 8]]) == [[1, 10]], "Test 5 failed"

    # Test 6: Unsorted input
    assert sol.merge([[2, 6], [1, 3], [8, 10], [15, 18]]) == [
        [1, 6],
        [8, 10],
        [15, 18],
    ], "Test 6 failed"

    print("All test_merge_intervals tests passed!")


if __name__ == "__main__":
    test()
