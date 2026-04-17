#include "json_helper.h"

ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy; dummy.next = NULL;
    ListNode* cur = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) { cur->next = l1; l1 = l1->next; }
        else { cur->next = l2; l2 = l2->next; }
        cur = cur->next;
    }
    cur->next = l1 ? l1 : l2;
    return dummy.next;
}

int main() {
    JsonValue* args = parse_args();
    ListNode* l1 = build_list(&args[0]);
    ListNode* l2 = build_list(&args[1]);
    ListNode* r = mergeTwoLists(l1, l2);
    print_list(r);
    return 0;
}
