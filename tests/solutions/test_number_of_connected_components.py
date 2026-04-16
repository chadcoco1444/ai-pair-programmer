"""
Number of Connected Components in an Undirected Graph - Blind 75 Graph #7
Given n nodes and edges, count connected components.
Approach: Union-Find — each union reduces component count by 1.
"""


class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        parent = list(range(n))
        rank = [0] * n

        def find(x):
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]

        def union(x, y):
            px, py = find(x), find(y)
            if px == py:
                return 0  # already connected
            if rank[px] < rank[py]:
                px, py = py, px
            parent[py] = px
            if rank[px] == rank[py]:
                rank[px] += 1
            return 1  # merged one component

        components = n
        for u, v in edges:
            components -= union(u, v)
        return components


def test():
    sol = Solution()

    # Test 1: (5, [[0,1],[1,2],[3,4]]) -> 2
    assert sol.countComponents(5, [[0, 1], [1, 2], [3, 4]]) == 2, "Test 1 failed"

    # Test 2: (5, [[0,1],[1,2],[2,3],[3,4]]) -> 1 (fully connected chain)
    assert sol.countComponents(5, [[0, 1], [1, 2], [2, 3], [3, 4]]) == 1, "Test 2 failed"

    # Test 3: No edges -> n components
    assert sol.countComponents(5, []) == 5, "Test 3 failed"

    # Test 4: Single node
    assert sol.countComponents(1, []) == 1, "Test 4 failed"

    # Test 5: 3 isolated nodes
    assert sol.countComponents(3, []) == 3, "Test 5 failed"

    # Test 6: All connected
    assert sol.countComponents(4, [[0, 1], [0, 2], [0, 3]]) == 1, "Test 6 failed"

    print("All test_number_of_connected_components tests passed!")


if __name__ == "__main__":
    test()
