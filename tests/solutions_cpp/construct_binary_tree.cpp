#include "json_helper.h"

class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < (int)inorder.size(); i++) inorder_idx[inorder[i]] = i;
        pre = &preorder;
        pre_pos = 0;
        return build(0, (int)inorder.size() - 1);
    }
private:
    unordered_map<int, int> inorder_idx;
    vector<int>* pre;
    int pre_pos;
    TreeNode* build(int in_lo, int in_hi) {
        if (in_lo > in_hi) return nullptr;
        int v = (*pre)[pre_pos++];
        TreeNode* node = new TreeNode(v);
        int mid = inorder_idx[v];
        node->left = build(in_lo, mid - 1);
        node->right = build(mid + 1, in_hi);
        return node;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto preorder = to_vector_int(args[0]);
    auto inorder = to_vector_int(args[1]);
    auto result = sol.buildTree(preorder, inorder);
    cout << tree_to_json(result) << endl;
    return 0;
}
