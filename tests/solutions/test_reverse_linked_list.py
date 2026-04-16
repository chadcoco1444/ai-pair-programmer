"""
Reverse Linked List - Blind 75 Linked List #1
Reverse a singly linked list iteratively.
Approach: Three-pointer iterative reversal.
"""


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def make_list(values: list) -> ListNode:
    """Create a linked list from a list of values."""
    if not values:
        return None
    head = ListNode(values[0])
    current = head
    for v in values[1:]:
        current.next = ListNode(v)
        current = current.next
    return head


def list_to_array(head: ListNode) -> list:
    """Convert linked list to array for easy comparison."""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev = None
        current = head
        while current:
            next_node = current.next
            current.next = prev
            prev = current
            current = next_node
        return prev


def test():
    sol = Solution()

    # Test 1: [1,2,3,4,5] -> [5,4,3,2,1]
    head = make_list([1, 2, 3, 4, 5])
    result = sol.reverseList(head)
    assert list_to_array(result) == [5, 4, 3, 2, 1], "Test 1 failed"

    # Test 2: [1,2] -> [2,1]
    head = make_list([1, 2])
    result = sol.reverseList(head)
    assert list_to_array(result) == [2, 1], "Test 2 failed"

    # Test 3: Single node [1] -> [1]
    head = make_list([1])
    result = sol.reverseList(head)
    assert list_to_array(result) == [1], "Test 3 failed"

    # Test 4: Empty list -> None
    result = sol.reverseList(None)
    assert result is None, "Test 4 failed"

    # Test 5: [1,2,3] -> [3,2,1]
    head = make_list([1, 2, 3])
    result = sol.reverseList(head)
    assert list_to_array(result) == [3, 2, 1], "Test 5 failed"

    print("All test_reverse_linked_list tests passed!")


if __name__ == "__main__":
    test()
