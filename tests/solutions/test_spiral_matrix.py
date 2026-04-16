"""
Spiral Matrix - Blind 75 Matrix #2
Return all elements of the matrix in spiral order.
Approach: Boundary shrinking — track top/bottom/left/right boundaries.
"""


class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        if not matrix or not matrix[0]:
            return []

        result = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1

        while top <= bottom and left <= right:
            # Traverse right along top row
            for c in range(left, right + 1):
                result.append(matrix[top][c])
            top += 1

            # Traverse down along right column
            for r in range(top, bottom + 1):
                result.append(matrix[r][right])
            right -= 1

            # Traverse left along bottom row (if still valid)
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    result.append(matrix[bottom][c])
                bottom -= 1

            # Traverse up along left column (if still valid)
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    result.append(matrix[r][left])
                left += 1

        return result


def test():
    sol = Solution()

    # Test 1: [[1,2,3],[4,5,6],[7,8,9]] -> [1,2,3,6,9,8,7,4,5]
    result = sol.spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    assert result == [1, 2, 3, 6, 9, 8, 7, 4, 5], f"Test 1 failed: {result}"

    # Test 2: [[1,2,3,4],[5,6,7,8],[9,10,11,12]] -> [1,2,3,4,8,12,11,10,9,5,6,7]
    result = sol.spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
    assert result == [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7], f"Test 2 failed: {result}"

    # Test 3: Single element
    assert sol.spiralOrder([[1]]) == [1], "Test 3 failed"

    # Test 4: Single row
    assert sol.spiralOrder([[1, 2, 3]]) == [1, 2, 3], "Test 4 failed"

    # Test 5: Single column
    assert sol.spiralOrder([[1], [2], [3]]) == [1, 2, 3], "Test 5 failed"

    # Test 6: 2x2 matrix
    result = sol.spiralOrder([[1, 2], [3, 4]])
    assert result == [1, 2, 4, 3], f"Test 6 failed: {result}"

    print("All test_spiral_matrix tests passed!")


if __name__ == "__main__":
    test()
