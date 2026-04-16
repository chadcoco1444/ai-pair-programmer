"""
Clone Graph - Blind 75 Graph #1
Given a node in a connected undirected graph, return a deep copy of the graph.
Approach: BFS/DFS with hash map to track visited nodes.
"""
from collections import deque


class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


class Solution:
    def cloneGraph(self, node: "Node") -> "Node":
        if not node:
            return None

        visited = {}

        def dfs(n):
            if n in visited:
                return visited[n]
            clone = Node(n.val)
            visited[n] = clone
            for neighbor in n.neighbors:
                clone.neighbors.append(dfs(neighbor))
            return clone

        return dfs(node)


def build_graph(adj_list):
    """Build graph from adjacency list (1-indexed values)."""
    if not adj_list:
        return None
    nodes = [Node(i + 1) for i in range(len(adj_list))]
    for i, neighbors in enumerate(adj_list):
        for j in neighbors:
            nodes[i].neighbors.append(nodes[j - 1])
    return nodes[0]


def graph_to_adj_list(node):
    """Convert graph back to adjacency list for comparison."""
    if not node:
        return []
    visited = {}
    queue = deque([node])
    visited[node] = True
    result = {}
    while queue:
        n = queue.popleft()
        result[n.val] = sorted([nb.val for nb in n.neighbors])
        for nb in n.neighbors:
            if nb not in visited:
                visited[nb] = True
                queue.append(nb)
    return [result[i] for i in sorted(result.keys())]


def test():
    sol = Solution()

    # Test 1: Simple 4-node cycle graph: 1-2-3-4-1, plus 1-3
    # adjList = [[2,4],[1,3],[2,4],[1,3]]
    adj_list = [[2, 4], [1, 3], [2, 4], [1, 3]]
    original = build_graph(adj_list)
    cloned = sol.cloneGraph(original)

    # Verify it's a deep copy (different node objects)
    assert cloned is not original, "Clone should be a different object"
    orig_adj = graph_to_adj_list(original)
    clone_adj = graph_to_adj_list(cloned)
    assert orig_adj == clone_adj, f"Adjacency lists differ: {orig_adj} vs {clone_adj}"

    # Verify no shared nodes
    orig_nodes = set()
    queue = deque([original])
    visited = set()
    visited.add(original)
    while queue:
        n = queue.popleft()
        orig_nodes.add(id(n))
        for nb in n.neighbors:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)

    queue = deque([cloned])
    visited = set()
    visited.add(cloned)
    while queue:
        n = queue.popleft()
        assert id(n) not in orig_nodes, "Cloned graph shares node objects with original"
        for nb in n.neighbors:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)

    # Test 2: Single node, no neighbors
    single = Node(1)
    cloned_single = sol.cloneGraph(single)
    assert cloned_single is not single
    assert cloned_single.val == 1
    assert cloned_single.neighbors == []

    # Test 3: None input
    assert sol.cloneGraph(None) is None

    print("All test_clone_graph tests passed!")


if __name__ == "__main__":
    test()
