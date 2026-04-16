"""
Linked List Cycle - Blind 75 Linked List #2
Detect if a linked list has a cycle.
Approach: Floyd's tortoise and hare — slow/fast pointers.
"""


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def make_list_with_cycle(values: list, pos: int) -> ListNode:
    """
    Create a linked list. If pos >= 0, the last node's next points to
    the node at index pos (creating a cycle).
    """
    if not values:
        return None
    nodes = [ListNode(v) for v in values]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos >= 0:
        nodes[-1].next = nodes[pos]
    return nodes[0]


class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False


def test():
    sol = Solution()

    # Test 1: [3,2,0,-4] with cycle at index 1 -> True
    head = make_list_with_cycle([3, 2, 0, -4], 1)
    assert sol.hasCycle(head) == True, "Test 1 failed"

    # Test 2: [1,2] with cycle at index 0 -> True
    head = make_list_with_cycle([1, 2], 0)
    assert sol.hasCycle(head) == True, "Test 2 failed"

    # Test 3: [1] no cycle -> False
    head = make_list_with_cycle([1], -1)
    assert sol.hasCycle(head) == False, "Test 3 failed"

    # Test 4: [1,2,3,4,5] no cycle -> False
    head = make_list_with_cycle([1, 2, 3, 4, 5], -1)
    assert sol.hasCycle(head) == False, "Test 4 failed"

    # Test 5: Empty list -> False
    assert sol.hasCycle(None) == False, "Test 5 failed"

    # Test 6: Single node pointing to itself -> True
    node = ListNode(1)
    node.next = node
    assert sol.hasCycle(node) == True, "Test 6 failed"

    print("All test_linked_list_cycle tests passed!")


if __name__ == "__main__":
    test()
