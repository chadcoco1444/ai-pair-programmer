#include "json_helper.h"

void reorderList(ListNode* head) {
    if (!head || !head->next) return;
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    ListNode* second = slow->next;
    slow->next = NULL;
    ListNode* prev = NULL;
    while (second) { ListNode* t = second->next; second->next = prev; prev = second; second = t; }
    second = prev;
    ListNode* first = head;
    while (second) {
        ListNode* t1 = first->next;
        ListNode* t2 = second->next;
        first->next = second;
        second->next = t1;
        first = t1; second = t2;
    }
}

int main() {
    JsonValue* args = parse_args();
    ListNode* head = build_list(&args[0]);
    reorderList(head);
    print_list(head);
    return 0;
}
