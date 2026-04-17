#include "json_helper.h"

bool isSameTree(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    if (p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* p = build_tree(&args[0]);
    TreeNode* q = build_tree(&args[1]);
    print_bool(isSameTree(p, q));
    return 0;
}
