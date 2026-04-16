"""
Graph Valid Tree - Blind 75 Graph #6
Determine if n nodes and given edges form a valid tree.
Approach: A valid tree has exactly n-1 edges and is fully connected (no cycles).
Uses Union-Find for cycle detection.
"""


class Solution:
    def validTree(self, n: int, edges: list[list[int]]) -> bool:
        # A tree must have exactly n-1 edges
        if len(edges) != n - 1:
            return False

        # Union-Find
        parent = list(range(n))
        rank = [0] * n

        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])  # path compression
            return parent[x]

        def union(x, y):
            px, py = find(x), find(y)
            if px == py:
                return False  # cycle detected
            if rank[px] < rank[py]:
                px, py = py, px
            parent[py] = px
            if rank[px] == rank[py]:
                rank[px] += 1
            return True

        for u, v in edges:
            if not union(u, v):
                return False

        return True


def test():
    sol = Solution()

    # Test 1: (5, [[0,1],[0,2],[0,3],[1,4]]) -> True (star tree)
    assert sol.validTree(5, [[0, 1], [0, 2], [0, 3], [1, 4]]) == True, "Test 1 failed"

    # Test 2: (5, [[0,1],[1,2],[2,3],[1,3],[1,4]]) -> False (cycle 1-2-3-1)
    assert (
        sol.validTree(5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]) == False
    ), "Test 2 failed"

    # Test 3: Single node, no edges -> True
    assert sol.validTree(1, []) == True, "Test 3 failed"

    # Test 4: Two nodes, one edge -> True
    assert sol.validTree(2, [[0, 1]]) == True, "Test 4 failed"

    # Test 5: Two nodes, no edges -> False (disconnected)
    assert sol.validTree(2, []) == False, "Test 5 failed"

    # Test 6: Disconnected graph
    assert sol.validTree(4, [[0, 1], [2, 3]]) == False, "Test 6 failed"

    print("All test_graph_valid_tree tests passed!")


if __name__ == "__main__":
    test()
