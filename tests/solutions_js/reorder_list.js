class Solution {
    reorderList(head) {
        if (!head || !head.next) return;

        // Step 1: Find middle using slow/fast pointers
        let slow = head;
        let fast = head;
        while (fast.next && fast.next.next) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // Step 2: Reverse second half
        let second = slow.next;
        slow.next = null;
        let prev = null;
        while (second) {
            const tmp = second.next;
            second.next = prev;
            prev = second;
            second = tmp;
        }
        second = prev;

        // Step 3: Merge two halves
        let first = head;
        while (second) {
            const tmp1 = first.next;
            const tmp2 = second.next;
            first.next = second;
            second.next = tmp1;
            first = tmp1;
            second = tmp2;
        }
    }
}
