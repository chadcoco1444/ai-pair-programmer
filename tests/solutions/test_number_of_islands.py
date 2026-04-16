"""
Number of Islands - Blind 75 Graph #4
Count the number of islands in a 2D binary grid.
Approach: DFS flood fill — mark visited cells.
"""
import copy


class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0

        rows, cols = len(grid), len(grid[0])
        count = 0

        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
                return
            grid[r][c] = "0"  # mark visited
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    count += 1
                    dfs(r, c)

        return count


def test():
    sol = Solution()

    # Test 1: Grid with 1 island
    grid1 = [
        ["1", "1", "1", "1", "0"],
        ["1", "1", "0", "1", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "0", "0", "0"],
    ]
    assert sol.numIslands(copy.deepcopy(grid1)) == 1, "Test 1 failed"

    # Test 2: Grid with 3 islands
    grid2 = [
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"],
    ]
    assert sol.numIslands(copy.deepcopy(grid2)) == 3, "Test 2 failed"

    # Test 3: Empty grid
    assert sol.numIslands([]) == 0, "Test 3 failed"

    # Test 4: All water
    grid4 = [["0", "0"], ["0", "0"]]
    assert sol.numIslands(copy.deepcopy(grid4)) == 0, "Test 4 failed"

    # Test 5: All land
    grid5 = [["1", "1"], ["1", "1"]]
    assert sol.numIslands(copy.deepcopy(grid5)) == 1, "Test 5 failed"

    print("All test_number_of_islands tests passed!")


if __name__ == "__main__":
    test()
