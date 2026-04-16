"""
Merge K Sorted Lists - Blind 75 Linked List #4
Merge k sorted linked lists into one sorted list.
Approach: Min-heap (priority queue) to always pick the smallest head.
"""
import heapq


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
    def mergeKLists(self, lists: list[ListNode]) -> ListNode:
        dummy = ListNode(0)
        current = dummy

        # (value, index, node) — index breaks ties without comparing ListNodes
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        while heap:
            val, i, node = heapq.heappop(heap)
            current.next = node
            current = current.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next


def test():
    sol = Solution()

    # Test 1: [[1,4,5],[1,3,4],[2,6]] -> [1,1,2,3,4,4,5,6]
    lists = [make_list([1, 4, 5]), make_list([1, 3, 4]), make_list([2, 6])]
    result = sol.mergeKLists(lists)
    assert list_to_array(result) == [1, 1, 2, 3, 4, 4, 5, 6], "Test 1 failed"

    # Test 2: Empty list of lists
    result = sol.mergeKLists([])
    assert list_to_array(result) == [], "Test 2 failed"

    # Test 3: List containing one empty list
    result = sol.mergeKLists([None])
    assert list_to_array(result) == [], "Test 3 failed"

    # Test 4: Single list
    lists = [make_list([1, 2, 3])]
    result = sol.mergeKLists(lists)
    assert list_to_array(result) == [1, 2, 3], "Test 4 failed"

    # Test 5: Two lists
    lists = [make_list([1, 3]), make_list([2, 4])]
    result = sol.mergeKLists(lists)
    assert list_to_array(result) == [1, 2, 3, 4], "Test 5 failed"

    print("All test_merge_k_sorted_lists tests passed!")


if __name__ == "__main__":
    test()
