#include "json_helper.h"

class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return validate(root, nullptr, nullptr);
    }
private:
    bool validate(TreeNode* node, long long* lo, long long* hi) {
        if (!node) return true;
        if (lo && node->val <= *lo) return false;
        if (hi && node->val >= *hi) return false;
        long long v = node->val;
        return validate(node->left, lo, &v) && validate(node->right, &v, hi);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    bool result = sol.isValidBST(root);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
