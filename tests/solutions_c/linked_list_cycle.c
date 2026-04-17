#include "json_helper.h"

bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

int main() {
    JsonValue* args = parse_args();
    int pos = to_int(&args[1]);
    ListNode* head = build_list_with_cycle(&args[0], pos);
    print_bool(hasCycle(head));
    return 0;
}
