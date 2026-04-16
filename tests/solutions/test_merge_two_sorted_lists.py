"""
Merge Two Sorted Lists - Blind 75 Linked List #3
Merge two sorted linked lists into one sorted list.
Approach: Iterative with a dummy head node.
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
    def mergeTwoLists(self, list1: ListNode, list2: ListNode) -> ListNode:
        dummy = ListNode(0)
        current = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                current.next = list1
                list1 = list1.next
            else:
                current.next = list2
                list2 = list2.next
            current = current.next

        current.next = list1 if list1 else list2
        return dummy.next


def test():
    sol = Solution()

    # Test 1: [1,2,4] + [1,3,4] -> [1,1,2,3,4,4]
    l1 = make_list([1, 2, 4])
    l2 = make_list([1, 3, 4])
    result = sol.mergeTwoLists(l1, l2)
    assert list_to_array(result) == [1, 1, 2, 3, 4, 4], "Test 1 failed"

    # Test 2: Both empty -> []
    result = sol.mergeTwoLists(None, None)
    assert list_to_array(result) == [], "Test 2 failed"

    # Test 3: One empty list
    l1 = make_list([1, 2, 3])
    result = sol.mergeTwoLists(l1, None)
    assert list_to_array(result) == [1, 2, 3], "Test 3 failed"

    # Test 4: Single elements
    l1 = make_list([1])
    l2 = make_list([2])
    result = sol.mergeTwoLists(l1, l2)
    assert list_to_array(result) == [1, 2], "Test 4 failed"

    # Test 5: Lists of different lengths
    l1 = make_list([1, 3, 5, 7])
    l2 = make_list([2, 4])
    result = sol.mergeTwoLists(l1, l2)
    assert list_to_array(result) == [1, 2, 3, 4, 5, 7], "Test 5 failed"

    print("All test_merge_two_sorted_lists tests passed!")


if __name__ == "__main__":
    test()
