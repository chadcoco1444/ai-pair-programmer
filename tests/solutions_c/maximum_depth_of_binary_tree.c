#include "json_helper.h"

int maxDepth(TreeNode* root) {
    if (!root) return 0;
    int l = maxDepth(root->left);
    int r = maxDepth(root->right);
    return 1 + (l > r ? l : r);
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    print_int(maxDepth(root));
    return 0;
}
