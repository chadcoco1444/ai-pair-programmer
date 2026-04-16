from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        while root:
            if p.val < root.val and q.val < root.val:
                root = root.left
            elif p.val > root.val and q.val > root.val:
                root = root.right
            else:
                return root
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


def find_node(root, val):
    while root:
        if val < root.val:
            root = root.left
        elif val > root.val:
            root = root.right
        else:
            return root
    return None


def test():
    sol = Solution()

    # [6,2,8,0,4,7,9,null,null,3,5], p=2, q=8 -> 6
    root = build_tree([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])
    p = find_node(root, 2)
    q = find_node(root, 8)
    assert sol.lowestCommonAncestor(root, p, q).val == 6

    # p=2, q=4 -> 2
    p2 = find_node(root, 2)
    q2 = find_node(root, 4)
    assert sol.lowestCommonAncestor(root, p2, q2).val == 2

    # p=0, q=5 -> 2
    p3 = find_node(root, 0)
    q3 = find_node(root, 5)
    assert sol.lowestCommonAncestor(root, p3, q3).val == 2

    print("All tests passed.")


if __name__ == "__main__":
    test()
