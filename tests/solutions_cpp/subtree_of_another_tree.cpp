#include "json_helper.h"

class Solution {
public:
    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if (!subRoot) return true;
        if (!root) return false;
        if (sameTree(root, subRoot)) return true;
        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
private:
    bool sameTree(TreeNode* a, TreeNode* b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (a->val != b->val) return false;
        return sameTree(a->left, b->left) && sameTree(a->right, b->right);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    auto subRoot = build_tree(args[1]);
    bool result = sol.isSubtree(root, subRoot);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
