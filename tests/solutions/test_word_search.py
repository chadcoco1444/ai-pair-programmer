"""
Word Search - Blind 75 Matrix #4
Search for a word in a 2D board using adjacent cells (no reuse).
Approach: DFS backtracking — mark cells visited, unmark on backtrack.
"""


class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])

        def dfs(r, c, idx):
            if idx == len(word):
                return True
            if r < 0 or r >= rows or c < 0 or c >= cols:
                return False
            if board[r][c] != word[idx]:
                return False

            # Mark as visited
            tmp = board[r][c]
            board[r][c] = "#"

            found = (
                dfs(r + 1, c, idx + 1)
                or dfs(r - 1, c, idx + 1)
                or dfs(r, c + 1, idx + 1)
                or dfs(r, c - 1, idx + 1)
            )

            # Restore (backtrack)
            board[r][c] = tmp
            return found

        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False


def test():
    sol = Solution()

    board = [
        ["A", "B", "C", "E"],
        ["S", "F", "C", "S"],
        ["A", "D", "E", "E"],
    ]

    # Test 1: "ABCCED" -> True
    import copy
    assert sol.exist(copy.deepcopy(board), "ABCCED") == True, "Test 1 failed"

    # Test 2: "SEE" -> True
    assert sol.exist(copy.deepcopy(board), "SEE") == True, "Test 2 failed"

    # Test 3: "ABCB" -> False (cannot reuse B)
    assert sol.exist(copy.deepcopy(board), "ABCB") == False, "Test 3 failed"

    # Test 4: Single cell board, word matches
    assert sol.exist([["A"]], "A") == True, "Test 4 failed"

    # Test 5: Single cell board, word doesn't match
    assert sol.exist([["A"]], "B") == False, "Test 5 failed"

    # Test 6: Word longer than board cells available
    assert sol.exist([["A", "B"], ["C", "D"]], "ABCD") == False, "Test 6 failed"

    # Test 7: Word found using a snake path
    board2 = [["A", "B"], ["C", "D"]]
    assert sol.exist(copy.deepcopy(board2), "ABDC") == True, "Test 7 failed"

    print("All test_word_search tests passed!")


if __name__ == "__main__":
    test()
