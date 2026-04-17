#include "json_helper.h"

static bool validate(TreeNode* n, long long* lo, long long* hi) {
    if (!n) return true;
    if (lo && n->val <= *lo) return false;
    if (hi && n->val >= *hi) return false;
    long long v = n->val;
    return validate(n->left, lo, &v) && validate(n->right, &v, hi);
}

bool isValidBST(TreeNode* root) {
    return validate(root, NULL, NULL);
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    print_bool(isValidBST(root));
    return 0;
}
