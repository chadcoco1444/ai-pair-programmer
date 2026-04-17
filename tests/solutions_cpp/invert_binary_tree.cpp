#include "json_helper.h"

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* l = invertTree(root->left);
        TreeNode* r = invertTree(root->right);
        root->left = r;
        root->right = l;
        return root;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    auto result = sol.invertTree(root);
    cout << tree_to_json(result) << endl;
    return 0;
}
