#include "json_helper.h"

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Min-heap: pair<value, index> (index breaks ties); store nodes separately
        using Item = tuple<int, int, ListNode*>;
        priority_queue<Item, vector<Item>, greater<Item>> pq;
        for (int i = 0; i < (int)lists.size(); i++) {
            if (lists[i]) pq.push({lists[i]->val, i, lists[i]});
        }
        ListNode dummy(0);
        ListNode* curr = &dummy;
        while (!pq.empty()) {
            auto [val, i, node] = pq.top(); pq.pop();
            curr->next = node;
            curr = curr->next;
            if (node->next) pq.push({node->next->val, i, node->next});
        }
        curr->next = nullptr;
        return dummy.next;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto lists = build_lists(args[0]);
    auto result = sol.mergeKLists(lists);
    cout << list_to_json(result) << endl;
    return 0;
}
