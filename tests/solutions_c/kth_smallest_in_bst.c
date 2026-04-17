#include "json_helper.h"

int kthSmallest(TreeNode* root, int k) {
    /* iterative inorder with explicit stack */
    TreeNode** stk = (TreeNode**)malloc(sizeof(TreeNode*) * 1024);
    int top = 0;
    TreeNode* cur = root;
    while (cur || top > 0) {
        while (cur) { stk[top++] = cur; cur = cur->left; }
        cur = stk[--top];
        if (--k == 0) { int v = cur->val; free(stk); return v; }
        cur = cur->right;
    }
    free(stk);
    return -1;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    int k = to_int(&args[1]);
    print_int(kthSmallest(root, k));
    return 0;
}
