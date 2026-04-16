from typing import List


class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None  # stores the complete word at leaf


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        # Build trie from words
        root = TrieNode()
        for word in words:
            node = root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.word = word

        rows, cols = len(board), len(board[0])
        result = []

        def dfs(row, col, node):
            char = board[row][col]
            if char not in node.children:
                return
            next_node = node.children[char]
            if next_node.word:
                result.append(next_node.word)
                next_node.word = None  # avoid duplicates

            board[row][col] = "#"  # mark visited
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                    dfs(nr, nc, next_node)
            board[row][col] = char  # restore

            # Prune empty trie nodes
            if not next_node.children:
                del node.children[char]

        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)

        return result


def test():
    sol = Solution()

    board = [
        ["o", "a", "a", "n"],
        ["e", "t", "a", "e"],
        ["i", "h", "k", "r"],
        ["i", "f", "l", "v"]
    ]
    words = ["oath", "pea", "eat", "rain"]
    result = sol.findWords(board, words)
    assert sorted(result) == sorted(["eat", "oath"]), f"Got {result}"

    # Simple board
    board2 = [["a", "b"], ["c", "d"]]
    words2 = ["abdc", "abcd", "ac"]
    result2 = sol.findWords(board2, words2)
    assert "abdc" in result2

    # No match
    board3 = [["a"]]
    words3 = ["b"]
    assert sol.findWords(board3, words3) == []

    print("All tests passed.")


if __name__ == "__main__":
    test()
