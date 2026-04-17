#include "json_helper.h"

static bool same_tree(TreeNode* a, TreeNode* b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a->val != b->val) return false;
    return same_tree(a->left, b->left) && same_tree(a->right, b->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (!subRoot) return true;
    if (!root) return false;
    if (same_tree(root, subRoot)) return true;
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* a = build_tree(&args[0]);
    TreeNode* b = build_tree(&args[1]);
    print_bool(isSubtree(a, b));
    return 0;
}
