from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        if subRoot is None:
            return True
        if root is None:
            return False
        if self._same_tree(root, subRoot):
            return True
        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)

    def _same_tree(self, p, q):
        if p is None and q is None:
            return True
        if p is None or q is None:
            return False
        return p.val == q.val and self._same_tree(p.left, q.left) and self._same_tree(p.right, q.right)


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

    # root=[3,4,5,1,2], sub=[4,1,2] -> True
    root = build_tree([3, 4, 5, 1, 2])
    sub = build_tree([4, 1, 2])
    assert sol.isSubtree(root, sub) == True

    # root=[3,4,5,1,2,null,null,null,null,0], sub=[4,1,2] -> False
    root2 = build_tree([3, 4, 5, 1, 2, None, None, None, None, 0])
    assert sol.isSubtree(root2, sub) == False

    # Subtree is None -> always True
    assert sol.isSubtree(root, None) == True

    # Root is None, subRoot is not None -> False
    assert sol.isSubtree(None, TreeNode(1)) == False

    print("All tests passed.")


if __name__ == "__main__":
    test()
