#include "json_helper.h"

class Solution {
public:
    int maxPathSum(TreeNode* root) {
        best = INT_MIN;
        dfs(root);
        return best;
    }
private:
    int best;
    int dfs(TreeNode* node) {
        if (!node) return 0;
        int l = max(0, dfs(node->left));
        int r = max(0, dfs(node->right));
        best = max(best, node->val + l + r);
        return node->val + max(l, r);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    cout << sol.maxPathSum(root) << endl;
    return 0;
}
