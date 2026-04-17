#include "json_helper.h"

class Solution {
public:
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
};

int main() {
    auto args = parse_args();
    Solution sol;
    int pos = to_int(args[1]);
    auto head = build_list_with_cycle(args[0], pos);
    bool result = sol.hasCycle(head);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
