from typing import Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))


def build_tree(values):
    """Build tree from level-order list (None for missing nodes)."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i = 1
    while queue and i < len(values):
        node = queue.pop(0)
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

    # [3,9,20,null,null,15,7] -> depth 3
    root = build_tree([3, 9, 20, None, None, 15, 7])
    assert sol.maxDepth(root) == 3

    # Single node
    assert sol.maxDepth(TreeNode(1)) == 1

    # Empty tree
    assert sol.maxDepth(None) == 0

    # [1,null,2] -> depth 2
    root2 = build_tree([1, None, 2])
    assert sol.maxDepth(root2) == 2

    print("All tests passed.")


if __name__ == "__main__":
    test()
