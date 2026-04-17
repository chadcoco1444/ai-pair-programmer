class Solution {
    reverseList(head) {
        let prev = null;
        let current = head;
        while (current) {
            const nextNode = current.next;
            current.next = prev;
            prev = current;
            current = nextNode;
        }
        return prev;
    }
}
