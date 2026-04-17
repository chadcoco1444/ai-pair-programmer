#include "json_helper.h"

ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy; dummy.next = head;
    ListNode* fast = &dummy;
    ListNode* slow = &dummy;
    for (int i = 0; i < n + 1; i++) if (fast) fast = fast->next;
    while (fast) { fast = fast->next; slow = slow->next; }
    if (slow->next) slow->next = slow->next->next;
    return dummy.next;
}

int main() {
    JsonValue* args = parse_args();
    ListNode* head = build_list(&args[0]);
    int n = to_int(&args[1]);
    ListNode* r = removeNthFromEnd(head, n);
    print_list(r);
    return 0;
}
