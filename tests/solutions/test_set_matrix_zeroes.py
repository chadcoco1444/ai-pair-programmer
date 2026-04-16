"""
Set Matrix Zeroes - Blind 75 Matrix #1
If an element is 0, set its entire row and column to 0.
Approach: Use first row and first column as markers — O(1) extra space.
"""
import copy


class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> None:
        """Modifies matrix in-place."""
        rows, cols = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
        first_col_zero = any(matrix[r][0] == 0 for r in range(rows))

        # Use first row/col as markers for the rest of the matrix
        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[r][c] == 0:
                    matrix[r][0] = 0
                    matrix[0][c] = 0

        # Zero out cells based on markers
        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0

        # Zero out first row if needed
        if first_row_zero:
            for c in range(cols):
                matrix[0][c] = 0

        # Zero out first col if needed
        if first_col_zero:
            for r in range(rows):
                matrix[r][0] = 0


def test():
    sol = Solution()

    # Test 1: [[1,1,1],[1,0,1],[1,1,1]] -> [[1,0,1],[0,0,0],[1,0,1]]
    matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
    sol.setZeroes(matrix)
    assert matrix == [[1, 0, 1], [0, 0, 0], [1, 0, 1]], f"Test 1 failed: {matrix}"

    # Test 2: [[0,1,2,0],[3,4,5,2],[1,3,1,5]] -> [[0,0,0,0],[0,4,5,0],[0,3,1,0]]
    matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]
    sol.setZeroes(matrix)
    assert matrix == [
        [0, 0, 0, 0],
        [0, 4, 5, 0],
        [0, 3, 1, 0],
    ], f"Test 2 failed: {matrix}"

    # Test 3: No zeros — matrix unchanged
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    original = copy.deepcopy(matrix)
    sol.setZeroes(matrix)
    assert matrix == original, "Test 3 failed"

    # Test 4: All zeros
    matrix = [[0, 0], [0, 0]]
    sol.setZeroes(matrix)
    assert matrix == [[0, 0], [0, 0]], "Test 4 failed"

    # Test 5: Single element zero
    matrix = [[0]]
    sol.setZeroes(matrix)
    assert matrix == [[0]], "Test 5 failed"

    print("All test_set_matrix_zeroes tests passed!")


if __name__ == "__main__":
    test()
