from typing import Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p is None and q is None:
            return True
        if p is None or q is None:
            return False
        if p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)


def build_tree(values):
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

    # Same trees [1,2,3]
    p = build_tree([1, 2, 3])
    q = build_tree([1, 2, 3])
    assert sol.isSameTree(p, q) == True

    # Different trees [1,2] vs [1,null,2]
    p2 = build_tree([1, 2])
    q2 = build_tree([1, None, 2])
    assert sol.isSameTree(p2, q2) == False

    # Different values [1,2,1] vs [1,1,2]
    p3 = build_tree([1, 2, 1])
    q3 = build_tree([1, 1, 2])
    assert sol.isSameTree(p3, q3) == False

    # Both empty
    assert sol.isSameTree(None, None) == True

    # One empty
    assert sol.isSameTree(TreeNode(1), None) == False

    print("All tests passed.")


if __name__ == "__main__":
    test()
