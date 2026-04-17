#include "json_helper.h"

static int* g_pre;
static int g_pre_pos;
static int* g_in_idx; /* map value+offset -> index; use negative offset support */
static int g_in_min, g_in_max;

static TreeNode* cb_build(int in_lo, int in_hi) {
    if (in_lo > in_hi) return NULL;
    int v = g_pre[g_pre_pos++];
    TreeNode* node = new_tree_node(v);
    int mid = g_in_idx[v - g_in_min];
    node->left = cb_build(in_lo, mid - 1);
    node->right = cb_build(mid + 1, in_hi);
    return node;
}

TreeNode* buildTree(int* preorder, int preorderSize, int* inorder, int inorderSize) {
    if (inorderSize == 0) return NULL;
    int lo = inorder[0], hi = inorder[0];
    for (int i = 1; i < inorderSize; i++) {
        if (inorder[i] < lo) lo = inorder[i];
        if (inorder[i] > hi) hi = inorder[i];
    }
    g_in_min = lo;
    g_in_max = hi;
    int range = hi - lo + 1;
    g_in_idx = (int*)malloc(sizeof(int) * range);
    for (int i = 0; i < inorderSize; i++) g_in_idx[inorder[i] - lo] = i;
    g_pre = preorder;
    g_pre_pos = 0;
    TreeNode* root = cb_build(0, inorderSize - 1);
    free(g_in_idx);
    return root;
}

int main() {
    JsonValue* args = parse_args();
    int n1, n2;
    int* pre = to_int_array(&args[0], &n1);
    int* ino = to_int_array(&args[1], &n2);
    TreeNode* root = buildTree(pre, n1, ino, n2);
    print_tree(root);
    return 0;
}
