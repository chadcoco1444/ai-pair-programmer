#include "json_helper.h"

ListNode* reverseList(ListNode* head) {
    ListNode* prev = NULL;
    ListNode* cur = head;
    while (cur) { ListNode* nx = cur->next; cur->next = prev; prev = cur; cur = nx; }
    return prev;
}

int main() {
    JsonValue* args = parse_args();
    ListNode* head = build_list(&args[0]);
    ListNode* r = reverseList(head);
    print_list(r);
    return 0;
}
