from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(node, min_val, max_val):
            if node is None:
                return True
            if node.val <= min_val or node.val >= max_val:
                return False
            return (validate(node.left, min_val, node.val) and
                    validate(node.right, node.val, max_val))

        return validate(root, float("-inf"), float("inf"))


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

    # [2,1,3] -> True
    root = build_tree([2, 1, 3])
    assert sol.isValidBST(root) == True

    # [5,1,4,null,null,3,6] -> False
    root2 = build_tree([5, 1, 4, None, None, 3, 6])
    assert sol.isValidBST(root2) == False

    # Single node
    assert sol.isValidBST(TreeNode(1)) == True

    # Duplicate values not allowed in BST
    root3 = build_tree([2, 2, 2])
    assert sol.isValidBST(root3) == False

    # [5,4,6,null,null,3,7] -> False (3 < 5 but is right child of 6)
    root4 = build_tree([5, 4, 6, None, None, 3, 7])
    assert sol.isValidBST(root4) == False

    print("All tests passed.")


if __name__ == "__main__":
    test()
