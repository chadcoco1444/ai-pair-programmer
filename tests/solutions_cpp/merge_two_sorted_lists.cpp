#include "json_helper.h"

class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* curr = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                curr->next = list1;
                list1 = list1->next;
            } else {
                curr->next = list2;
                list2 = list2->next;
            }
            curr = curr->next;
        }
        curr->next = list1 ? list1 : list2;
        return dummy.next;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto l1 = build_list(args[0]);
    auto l2 = build_list(args[1]);
    auto result = sol.mergeTwoLists(l1, l2);
    cout << list_to_json(result) << endl;
    return 0;
}
