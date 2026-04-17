#include "json_helper.h"

static int g_best;

static int dfs_mps(TreeNode* n) {
    if (!n) return 0;
    int l = dfs_mps(n->left); if (l < 0) l = 0;
    int r = dfs_mps(n->right); if (r < 0) r = 0;
    int sum = n->val + l + r;
    if (sum > g_best) g_best = sum;
    int ml = l > r ? l : r;
    return n->val + ml;
}

int maxPathSum(TreeNode* root) {
    g_best = INT_MIN;
    dfs_mps(root);
    return g_best;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    print_int(maxPathSum(root));
    return 0;
}
