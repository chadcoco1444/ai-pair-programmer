#include "json_helper.h"

class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (!p && !q) return true;
        if (!p || !q) return false;
        if (p->val != q->val) return false;
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto p = build_tree(args[0]);
    auto q = build_tree(args[1]);
    bool result = sol.isSameTree(p, q);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
