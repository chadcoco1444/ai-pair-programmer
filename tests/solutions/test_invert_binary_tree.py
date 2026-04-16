from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root


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


def tree_to_list(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    # strip trailing Nones
    while result and result[-1] is None:
        result.pop()
    return result


def test():
    sol = Solution()

    # [4,2,7,1,3,6,9] -> [4,7,2,9,6,3,1]
    root = build_tree([4, 2, 7, 1, 3, 6, 9])
    inverted = sol.invertTree(root)
    assert tree_to_list(inverted) == [4, 7, 2, 9, 6, 3, 1]

    # [2,1,3] -> [2,3,1]
    root2 = build_tree([2, 1, 3])
    inverted2 = sol.invertTree(root2)
    assert tree_to_list(inverted2) == [2, 3, 1]

    # Empty tree
    assert sol.invertTree(None) is None

    print("All tests passed.")


if __name__ == "__main__":
    test()
