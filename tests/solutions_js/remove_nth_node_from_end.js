class Solution {
    removeNthFromEnd(head, n) {
        const dummy = new ListNode(0);
        dummy.next = head;
        let fast = dummy;
        let slow = dummy;

        for (let i = 0; i < n + 1; i++) {
            fast = fast.next;
        }

        while (fast) {
            fast = fast.next;
            slow = slow.next;
        }

        slow.next = slow.next.next;
        return dummy.next;
    }
}
