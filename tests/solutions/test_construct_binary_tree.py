from typing import Optional, List
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder or not inorder:
            return None
        root_val = preorder[0]
        root = TreeNode(root_val)
        mid = inorder.index(root_val)
        root.left = self.buildTree(preorder[1: mid + 1], inorder[:mid])
        root.right = self.buildTree(preorder[mid + 1:], inorder[mid + 1:])
        return root


def tree_to_inorder(root):
    if root is None:
        return []
    return tree_to_inorder(root.left) + [root.val] + tree_to_inorder(root.right)


def tree_to_preorder(root):
    if root is None:
        return []
    return [root.val] + tree_to_preorder(root.left) + tree_to_preorder(root.right)


def test():
    sol = Solution()

    # preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]
    preorder = [3, 9, 20, 15, 7]
    inorder = [9, 3, 15, 20, 7]
    root = sol.buildTree(preorder, inorder)
    assert tree_to_preorder(root) == preorder
    assert tree_to_inorder(root) == inorder

    # Single node
    root2 = sol.buildTree([1], [1])
    assert root2.val == 1

    # Two nodes
    root3 = sol.buildTree([1, 2], [2, 1])
    assert tree_to_preorder(root3) == [1, 2]
    assert tree_to_inorder(root3) == [2, 1]

    print("All tests passed.")


if __name__ == "__main__":
    test()
