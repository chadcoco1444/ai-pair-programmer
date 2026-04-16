"""
Remove Nth Node From End of List - Blind 75 Linked List #5
Remove the nth node from the end of the list.
Approach: Two-pointer — advance fast pointer n steps ahead, then move both.
"""


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def make_list(values: list) -> ListNode:
    if not values:
        return None
    head = ListNode(values[0])
    current = head
    for v in values[1:]:
        current.next = ListNode(v)
        current = current.next
    return head


def list_to_array(head: ListNode) -> list:
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result


class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        dummy = ListNode(0)
        dummy.next = head
        fast = dummy
        slow = dummy

        # Move fast pointer n+1 steps ahead
        for _ in range(n + 1):
            fast = fast.next

        # Move both until fast reaches end
        while fast:
            fast = fast.next
            slow = slow.next

        # Remove the nth node from end
        slow.next = slow.next.next
        return dummy.next


def test():
    sol = Solution()

    # Test 1: [1,2,3,4,5] remove 2nd from end -> [1,2,3,5]
    head = make_list([1, 2, 3, 4, 5])
    result = sol.removeNthFromEnd(head, 2)
    assert list_to_array(result) == [1, 2, 3, 5], "Test 1 failed"

    # Test 2: [1] remove 1st from end -> []
    head = make_list([1])
    result = sol.removeNthFromEnd(head, 1)
    assert list_to_array(result) == [], "Test 2 failed"

    # Test 3: [1,2] remove 1st from end -> [1]
    head = make_list([1, 2])
    result = sol.removeNthFromEnd(head, 1)
    assert list_to_array(result) == [1], "Test 3 failed"

    # Test 4: [1,2] remove 2nd from end (head) -> [2]
    head = make_list([1, 2])
    result = sol.removeNthFromEnd(head, 2)
    assert list_to_array(result) == [2], "Test 4 failed"

    # Test 5: [1,2,3,4,5] remove last (1st from end) -> [1,2,3,4]
    head = make_list([1, 2, 3, 4, 5])
    result = sol.removeNthFromEnd(head, 1)
    assert list_to_array(result) == [1, 2, 3, 4], "Test 5 failed"

    print("All test_remove_nth_node_from_end tests passed!")


if __name__ == "__main__":
    test()
