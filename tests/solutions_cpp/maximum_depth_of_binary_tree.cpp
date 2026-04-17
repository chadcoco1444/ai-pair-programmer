#include "json_helper.h"

class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    cout << sol.maxDepth(root) << endl;
    return 0;
}
