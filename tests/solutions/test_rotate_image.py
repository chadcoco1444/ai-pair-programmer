"""
Rotate Image - Blind 75 Matrix #3
Rotate an n×n matrix 90 degrees clockwise in-place.
Approach: Transpose the matrix, then reverse each row.
"""
import copy


class Solution:
    def rotate(self, matrix: list[list[int]]) -> None:
        """Modifies matrix in-place."""
        n = len(matrix)

        # Step 1: Transpose (swap matrix[i][j] and matrix[j][i])
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        # Step 2: Reverse each row
        for row in matrix:
            row.reverse()


def test():
    sol = Solution()

    # Test 1: [[1,2,3],[4,5,6],[7,8,9]] -> [[7,4,1],[8,5,2],[9,6,3]]
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    sol.rotate(matrix)
    assert matrix == [[7, 4, 1], [8, 5, 2], [9, 6, 3]], f"Test 1 failed: {matrix}"

    # Test 2: [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
    matrix = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]
    sol.rotate(matrix)
    expected = [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]
    assert matrix == expected, f"Test 2 failed: {matrix}"

    # Test 3: Single element
    matrix = [[1]]
    sol.rotate(matrix)
    assert matrix == [[1]], "Test 3 failed"

    # Test 4: 2x2 matrix
    matrix = [[1, 2], [3, 4]]
    sol.rotate(matrix)
    assert matrix == [[3, 1], [4, 2]], f"Test 4 failed: {matrix}"

    print("All test_rotate_image tests passed!")


if __name__ == "__main__":
    test()
