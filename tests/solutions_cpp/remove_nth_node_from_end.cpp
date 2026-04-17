#include "json_helper.h"

class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* fast = &dummy;
        ListNode* slow = &dummy;
        for (int i = 0; i < n + 1; i++) {
            if (fast) fast = fast->next;
        }
        while (fast) {
            fast = fast->next;
            slow = slow->next;
        }
        if (slow->next) slow->next = slow->next->next;
        return dummy.next;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto head = build_list(args[0]);
    int n = to_int(args[1]);
    auto result = sol.removeNthFromEnd(head, n);
    cout << list_to_json(result) << endl;
    return 0;
}
