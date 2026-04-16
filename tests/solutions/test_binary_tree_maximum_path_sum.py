from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float("-inf")

        def dfs(node):
            if node is None:
                return 0
            left_gain = max(dfs(node.left), 0)
            right_gain = max(dfs(node.right), 0)
            # Path through this node
            self.max_sum = max(self.max_sum, node.val + left_gain + right_gain)
            # Return max gain going up (can only go one direction)
            return node.val + max(left_gain, right_gain)

        dfs(root)
        return self.max_sum


def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root


def test():
    sol = Solution()

    # [1,2,3] -> 6
    root = build_tree([1, 2, 3])
    assert sol.maxPathSum(root) == 6

    # [-10,9,20,null,null,15,7] -> 42
    root2 = build_tree([-10, 9, 20, None, None, 15, 7])
    assert sol.maxPathSum(root2) == 42

    # Single negative node
    assert sol.maxPathSum(TreeNode(-3)) == -3

    # [-3] -> -3
    root3 = build_tree([-3])
    assert sol.maxPathSum(root3) == -3

    print("All tests passed.")


if __name__ == "__main__":
    test()
