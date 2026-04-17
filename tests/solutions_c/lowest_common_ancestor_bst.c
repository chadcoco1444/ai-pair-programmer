#include "json_helper.h"

TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    TreeNode* cur = root;
    while (cur) {
        if (p->val < cur->val && q->val < cur->val) cur = cur->left;
        else if (p->val > cur->val && q->val > cur->val) cur = cur->right;
        else return cur;
    }
    return NULL;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    TreeNode* p = find_node(root, to_int(&args[1]));
    TreeNode* q = find_node(root, to_int(&args[2]));
    TreeNode* r = lowestCommonAncestor(root, p, q);
    print_int(r->val);
    return 0;
}
