"""
Reorder List - Blind 75 Linked List #6
Reorder L0 -> L1 -> ... -> Ln to L0 -> Ln -> L1 -> Ln-1 -> L2 -> ...
Approach: Find middle + reverse second half + merge two halves.
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
    def reorderList(self, head: ListNode) -> None:
        """Modifies the list in-place."""
        if not head or not head.next:
            return

        # Step 1: Find middle using slow/fast pointers
        slow, fast = head, head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next

        # Step 2: Reverse second half
        second = slow.next
        slow.next = None  # cut the list
        prev = None
        while second:
            tmp = second.next
            second.next = prev
            prev = second
            second = tmp
        second = prev  # head of reversed second half

        # Step 3: Merge two halves
        first = head
        while second:
            tmp1 = first.next
            tmp2 = second.next
            first.next = second
            second.next = tmp1
            first = tmp1
            second = tmp2


def test():
    sol = Solution()

    # Test 1: [1,2,3,4] -> [1,4,2,3]
    head = make_list([1, 2, 3, 4])
    sol.reorderList(head)
    assert list_to_array(head) == [1, 4, 2, 3], "Test 1 failed"

    # Test 2: [1,2,3,4,5] -> [1,5,2,4,3]
    head = make_list([1, 2, 3, 4, 5])
    sol.reorderList(head)
    assert list_to_array(head) == [1, 5, 2, 4, 3], "Test 2 failed"

    # Test 3: Single node [1] -> [1]
    head = make_list([1])
    sol.reorderList(head)
    assert list_to_array(head) == [1], "Test 3 failed"

    # Test 4: Two nodes [1,2] -> [1,2]
    head = make_list([1, 2])
    sol.reorderList(head)
    assert list_to_array(head) == [1, 2], "Test 4 failed"

    # Test 5: Three nodes [1,2,3] -> [1,3,2]
    head = make_list([1, 2, 3])
    sol.reorderList(head)
    assert list_to_array(head) == [1, 3, 2], "Test 5 failed"

    print("All test_reorder_list tests passed!")


if __name__ == "__main__":
    test()
