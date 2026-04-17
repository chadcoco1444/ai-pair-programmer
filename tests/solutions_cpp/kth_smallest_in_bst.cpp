#include "json_helper.h"

class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* curr = root;
        while (curr || !st.empty()) {
            while (curr) {
                st.push(curr);
                curr = curr->left;
            }
            curr = st.top(); st.pop();
            if (--k == 0) return curr->val;
            curr = curr->right;
        }
        return -1;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    int k = to_int(args[1]);
    cout << sol.kthSmallest(root, k) << endl;
    return 0;
}
