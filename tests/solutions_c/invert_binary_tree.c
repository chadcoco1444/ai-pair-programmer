#include "json_helper.h"

TreeNode* invertTree(TreeNode* root) {
    if (!root) return NULL;
    TreeNode* l = invertTree(root->left);
    TreeNode* r = invertTree(root->right);
    root->left = r;
    root->right = l;
    return root;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    print_tree(invertTree(root));
    return 0;
}
