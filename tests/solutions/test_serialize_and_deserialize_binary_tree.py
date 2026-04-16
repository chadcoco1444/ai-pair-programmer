from typing import Optional
from collections import deque


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        """BFS serialization."""
        if root is None:
            return ""
        result = []
        queue = deque([root])
        while queue:
            node = queue.popleft()
            if node is None:
                result.append("null")
            else:
                result.append(str(node.val))
                queue.append(node.left)
                queue.append(node.right)
        return ",".join(result)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        """BFS deserialization."""
        if not data:
            return None
        tokens = data.split(",")
        root = TreeNode(int(tokens[0]))
        queue = deque([root])
        i = 1
        while queue and i < len(tokens):
            node = queue.popleft()
            if i < len(tokens) and tokens[i] != "null":
                node.left = TreeNode(int(tokens[i]))
                queue.append(node.left)
            i += 1
            if i < len(tokens) and tokens[i] != "null":
                node.right = TreeNode(int(tokens[i]))
                queue.append(node.right)
            i += 1
        return root


def trees_equal(p, q):
    if p is None and q is None:
        return True
    if p is None or q is None:
        return False
    return p.val == q.val and trees_equal(p.left, q.left) and trees_equal(p.right, q.right)


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
    codec = Codec()

    # [1,2,3,null,null,4,5]
    root = build_tree([1, 2, 3, None, None, 4, 5])
    serialized = codec.serialize(root)
    deserialized = codec.deserialize(serialized)
    assert trees_equal(root, deserialized)

    # Empty tree
    serialized_empty = codec.serialize(None)
    assert codec.deserialize(serialized_empty) is None

    # Single node
    root2 = TreeNode(42)
    serialized2 = codec.serialize(root2)
    deserialized2 = codec.deserialize(serialized2)
    assert trees_equal(root2, deserialized2)

    # Tree with negatives
    root3 = build_tree([-10, 9, 20, None, None, 15, 7])
    serialized3 = codec.serialize(root3)
    deserialized3 = codec.deserialize(serialized3)
    assert trees_equal(root3, deserialized3)

    print("All tests passed.")


if __name__ == "__main__":
    test()
