from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        self.count = 0
        self.result = None

        def inorder(node):
            if node is None or self.result is not None:
                return
            inorder(node.left)
            self.count += 1
            if self.count == k:
                self.result = node.val
                return
            inorder(node.right)

        inorder(root)
        return self.result


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

    # [3,1,4,null,2], k=1 -> 1
    root = build_tree([3, 1, 4, None, 2])
    assert sol.kthSmallest(root, 1) == 1

    # [5,3,6,2,4,null,null,1], k=3 -> 3
    root2 = build_tree([5, 3, 6, 2, 4, None, None, 1])
    assert sol.kthSmallest(root2, 3) == 3

    # Single node, k=1
    assert sol.kthSmallest(TreeNode(5), 1) == 5

    print("All tests passed.")


if __name__ == "__main__":
    test()
