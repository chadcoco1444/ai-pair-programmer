"""
Pacific Atlantic Water Flow - Blind 75 Graph #3
Find all cells from which water can flow to both Pacific and Atlantic oceans.
Approach: BFS from both ocean borders inward (reverse flow).
"""
from collections import deque


class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        if not heights or not heights[0]:
            return []

        rows, cols = len(heights), len(heights[0])
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

        def bfs(starts):
            visited = set(starts)
            queue = deque(starts)
            while queue:
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if (
                        0 <= nr < rows
                        and 0 <= nc < cols
                        and (nr, nc) not in visited
                        and heights[nr][nc] >= heights[r][c]
                    ):
                        visited.add((nr, nc))
                        queue.append((nr, nc))
            return visited

        pacific_starts = [(r, 0) for r in range(rows)] + [
            (0, c) for c in range(cols)
        ]
        atlantic_starts = [(r, cols - 1) for r in range(rows)] + [
            (rows - 1, c) for c in range(cols)
        ]

        pacific = bfs(pacific_starts)
        atlantic = bfs(atlantic_starts)

        return sorted([list(cell) for cell in pacific & atlantic])


def test():
    sol = Solution()

    # Test 1: Standard 5x5 matrix
    heights = [
        [1, 2, 2, 3, 5],
        [3, 2, 3, 4, 4],
        [2, 4, 5, 3, 1],
        [6, 7, 1, 4, 5],
        [5, 1, 1, 2, 4],
    ]
    result = sol.pacificAtlantic(heights)
    expected = sorted([[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]])
    assert result == expected, f"Test 1 failed: {result} != {expected}"

    # Test 2: Single cell
    assert sol.pacificAtlantic([[1]]) == [[0, 0]], "Test 2 failed"

    # Test 3: 1x2 grid
    result = sol.pacificAtlantic([[1, 2]])
    expected = sorted([[0, 0], [0, 1]])
    assert result == expected, f"Test 3 failed: {result}"

    print("All test_pacific_atlantic_water_flow tests passed!")


if __name__ == "__main__":
    test()
