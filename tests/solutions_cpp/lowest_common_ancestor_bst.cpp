#include "json_helper.h"

class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        TreeNode* curr = root;
        while (curr) {
            if (p->val < curr->val && q->val < curr->val) curr = curr->left;
            else if (p->val > curr->val && q->val > curr->val) curr = curr->right;
            else return curr;
        }
        return nullptr;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto root = build_tree(args[0]);
    auto p = find_node(root, to_int(args[1]));
    auto q = find_node(root, to_int(args[2]));
    auto result = sol.lowestCommonAncestor(root, p, q);
    cout << result->val << endl;
    return 0;
}
